from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
import uuid
import shutil
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StellarView 3D Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET = os.getenv("SECRET_KEY") or "очень_секретный_ключ_поменяй_потом"
ALGO = "HS256"
TOKEN_LIVES_DAYS = 7

pwd_hasher = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth_scheme = OAuth2PasswordBearer(tokenUrl="token")

DB_PATH = "sqlite:///./users_local.db"
engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_pw = Column(String)


print("Проверяю/создаю таблицу users...")
Base.metadata.create_all(bind=engine)
print("База готова")


def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def check_password(plain_text, hashed):
    return pwd_hasher.verify(plain_text, hashed)


def make_hash(pw_text):
    pw_bytes = pw_text.encode("utf-8")[:72]
    return pwd_hasher.hash(pw_bytes)


def create_jwt_token(payload: dict, lifetime_days: int = None):
    data = payload.copy()
    
    if lifetime_days is None:
        lifetime_days = TOKEN_LIVES_DAYS
        
    expire_time = datetime.utcnow() + timedelta(days=lifetime_days)
    data["exp"] = expire_time
    
    print("Создаю токен для", payload.get("sub", "???"))
    return jwt.encode(data, SECRET, algorithm=ALGO)


#РЕГИСТРАЦИЯ
@app.post("/register")
async def register_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db_session)
):
    print(f"Кто-то регистрируется: {username}")
    
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(400, detail="Этот ник уже занят")
    
    hashed = make_hash(password)
    new_user = User(username=username, hashed_pw=hashed)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Зарегистрирован, теперь можно войти"}


#ЛОГИН
@app.post("/token")
async def login_user(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_session)
):
    user = db.query(User).filter(User.username == form.username).first()
    
    if not user or not check_password(form.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильный ник или пароль"
        )
    
    token = create_jwt_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


#ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
async def get_current_user(
    token: str = Depends(oauth_scheme),
    db: Session = Depends(get_db_session)
):
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(401, "Токен пустой")
    except JWTError:
        raise HTTPException(401, "Токен сломан или просрочен")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(401, "Пользователь не найден")
    
    return user


#ЗАГРУЗКА МОДЕЛИ
UPLOAD_FOLDER = "uploads/models"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.mount("/models", StaticFiles(directory=UPLOAD_FOLDER), name="models")


@app.post("/upload-model")
async def upload_3d_model(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    print(f"{current_user.username} загружает файл: {file.filename}")
    
    allowed = {".glb", ".gltf", ".obj", ".fbx"}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed:
        raise HTTPException(400, "Только .glb .gltf .obj .fbx можно")
    
    new_name = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, new_name)
    
    try:
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        print("Файл сохранён →", save_path)
    except Exception as e:
        print("Ошибка при сохранении файла:", str(e))
        raise HTTPException(500, f"Не получилось сохранить: {str(e)}")
    
    url = f"http://localhost:8000/models/{new_name}"
    return {"url": url, "filename": new_name}


#ОШИБКИ ГЛОБАЛЬНО
@app.exception_handler(Exception)
async def catch_all_errors(request, exc):
    print("!!! НЕОБРАБОТАННАЯ ОШИБКА !!!")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Сервер упал: {str(exc)}"}
    )