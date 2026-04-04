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

app = FastAPI(title="StellarView 3D - Backend")

# Разрешаем все запросы с фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройки токена
SECRET_KEY = os.getenv("SECRET_KEY") or "мой_очень_секретный_ключ_лучше_поменять"
ALGORITHM = "HS256"
TOKEN_LIFE_DAYS = 7

# Хэширование паролей
pwd_hasher = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Подключаемся к базе
DB_URL = "sqlite:///./users.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

print("Проверяю базу данных...")
Base.metadata.create_all(bind=engine)
print("База готова к работе")

def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def check_password(plain_pw, hashed_pw):
    return pwd_hasher.verify(plain_pw, hashed_pw)

def hash_password(password):
    # bcrypt не любит пароли длиннее 72 байт
    safe_pw = password.encode("utf-8")[:72]
    return pwd_hasher.hash(safe_pw.decode("utf-8", errors="ignore"))

def create_token(payload):
    data = payload.copy()
    expire = datetime.utcnow() + timedelta(days=TOKEN_LIFE_DAYS)
    data["exp"] = expire
    print(f"Создаю токен для пользователя: {payload.get('sub')}")
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ====================== РЕГИСТРАЦИЯ ======================
@app.post("/register")
async def register_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    print(f"Попытка регистрации: {username}")

    # Проверяем, есть ли уже такой ник
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Этот никнейм уже занят")

    hashed = hash_password(password)
    new_user = User(username=username, hashed_password=hashed)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(f"Пользователь {username} успешно создан")
    return {"message": "Регистрация прошла успешно, теперь можно войти"}

# ====================== ЛОГИН ======================
@app.post("/token")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not check_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный никнейм или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_token({"sub": user.username})
    print(f"Успешный вход — {user.username}")
    return {"access_token": token, "token_type": "bearer"}

# ====================== ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ ======================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Токен пустой")
    except JWTError:
        raise HTTPException(status_code=401, detail="Токен недействителен")

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    return user

# ====================== ЗАГРУЗКА МОДЕЛИ ======================
UPLOAD_DIR = "uploads/models"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/models", StaticFiles(directory=UPLOAD_DIR), name="models")

@app.post("/upload-model")
async def upload_model(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    print(f"{current_user.username} пытается загрузить файл: {file.filename}")

    allowed_ext = {".glb", ".gltf", ".obj", ".fbx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="Можно загружать только .glb .gltf .obj .fbx")

    new_name = f"{uuid.uuid4()}{file_ext}"
    save_path = os.path.join(UPLOAD_DIR, new_name)

    try:
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        print(f"Файл успешно сохранён: {save_path}")
    except Exception as e:
        print("Ошибка при сохранении файла:", str(e))
        raise HTTPException(status_code=500, detail="Не удалось сохранить файл")

    file_url = f"http://localhost:8000/models/{new_name}"
    return {"url": file_url, "filename": new_name}

# ====================== ОБРАБОТКА НЕОЖИДАННЫХ ОШИБОК ======================
@app.exception_handler(Exception)
async def catch_errors(request, exc):
    print("!!! НЕОЖИДАННАЯ ОШИБКА !!!")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Сервер упал: {str(exc)}"}
    )