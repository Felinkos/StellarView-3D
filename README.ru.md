# StellarView 3D

**Современный веб-просмотрщик и редактор 3D-моделей прямо в браузере**

## Оглавление

- [О проекте](#о-проекте)
- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Демо](#демо)
- [Установка](#установка)
- [Фронтенд](#фронтенд)
- [Бэкенд](#бэкенд)
- [Использование](#использование)
- [Структура проекта](#структура-проекта)
- [Вклад в проект](#вклад-в-проект)
- [Лицензия](#лицензия)
- [Контакты и благодарности](#контакты-и-благодарности)

## О проекте

StellarView 3D - это полнофункциональное веб-приложение, позволяющее загружать, просматривать и редактировать собственные 3D-модели прямо в браузере без установки дополнительного ПО.

Основные цели:
- Создать простой и удобный инструмент для студентов, дизайнеров и разработчиков
- Поддержка популярных форматов: glTF/glb, OBJ, FBX
- Интерактивное управление моделью мышкой
- Настройка освещения, фона и позиции модели
- Безопасная загрузка и хранение файлов на сервере
- Авторизация: JWT-токены

## Возможности

- Загрузка моделей через drag & drop или выбор файла
- Управление мышкой:
  - Левая кнопка + движение → перемещение модели
  - Колёсико → масштаб
  - Правая кнопка + движение → вращение
- Настройка цвета фона и яркости света
- Выдвижная панель настроек справа
- Хранение моделей на сервере
- Вход / Регистрация
- Космический фон со звёздами и сеткой

## Технологический стек

**Фронтенд:**
- React 18 + Vite
- React Three Fiber
- @react-three/drei
- Tailwind CSS / тёмная тема

**Backend:**
- FastAPI (Python)
- Uvicorn
- JWT-авторизация (имя + пароль)
- Локальное хранение файлов (`/uploads`)
- База данных SQLite
- Поддержка CORS

**3D:**
- Three.js (через React Three Fiber)
- glTF-загрузчик

## Демо

(Если развёрнуто)  
→ https://StellarView-3D.vercel.app/editor  

(Локально)  
→ http://localhost:5173/editor после запуска фронтенда и бэкенда

## Установка

### Предварительные требования

- Node.js 18+ и npm / pnpm
- Python 3.10+
- Git

### Фронтенд

```bash
git clone https://github.com/Felinkos/StellarView-3D
cd StellarView-3D/frontend
npm install
npm run dev
```

→ Открой http://localhost:5173

### Бэкенд

```bash
git clone https://github.com/Felinkos/StellarView-3D
cd StellarView-3D/backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

→ Открой http://localhost:8000/docs

## Использование

Запусти бэкенд (uvicorn main:app --reload --port 8000)
Запусти фронтенд (npm run dev)
Перейди на http://localhost:5173/editor
Нажми «Загрузить модель» → выбери .glb / .obj / .fbx
Включи чекбокс «Режим перемещения модели»
Зажми левую кнопку мыши на модели → двигай
Колёсико — масштаб, правая кнопка — вращение
Настрой освещение и фон в правой панели

## Структура Проекта
```bash
StellarView-3D/
├── frontend/                  # React + Vite
│   ├── .vite/
│   ├── node_modules/
│   ├── public/
│   │   └── images/Crew/
│   │       ├── artemis-seek.svg
│   │       ├── christina-koch.jpg
│   │       ├── jeremy-hansen.jpg
│   │       ├── logo-artemis.png
│   │       ├── reid-wiseman.jpg
│   │       └── victor-glover.jpg
│   ├── models/
│   │   ├── Earth.glb
│   │   ├── Moon.glb
│   │   └── SLS.glb
│   ├── src/
│   │   ├── assets/models/
│   │   │   ├── Earth_model.jsx
│   │   │   ├── Moon_model.jsx
│   │   │   └── SLS_model.jsx
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   └── Scene.jsx 
│   │   │   ├── Editor/
│   │   │   │   ├── EditorPage.jsx
│   │   │   │   ├── ModelLoader.jsx
│   │   │   │   └── SceneControls.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslist.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── packege.json
│   ├── README.md
│   └── vite.config.js
│
├── backend/                   # FastAPI
│   ├── __pycache__/
│   ├── uploads/models/        # загруженные модели
│   ├── venv/
│   └── main.py
│
├── README.md
└── README.ru.md
```
### Вклад в проект
Приветствуются любые улучшения!

Форкни репозиторий
Создай ветку (git checkout -b feature/amazing-feature)
Зафиксируй изменения (git commit -m 'Add some feature')
Отправь (git push origin feature/amazing-feature)
Открой Pull Request

### Лицензия
Распространяется под лицензией MIT.

### Контакты и благодарности

Felinkos - [full.felinkosi@gmail.com]
Ссылка на проект: https://github.com/Felinkos/StellarView-3D

### Особая благодарность

Командам Three.js и React Three Fiber
Разработчикам FastAPI
Khronos Group (формат glTF)
Всем, кто тестировал ранние версии!