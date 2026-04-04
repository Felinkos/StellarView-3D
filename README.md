# StellarView 3D

**A modern web-based 3D model viewer and editor running directly in the browser.**

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Installation](#installation)
- [Frontend](#frontend)
- [Backend](#backend)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Acknowledgments](#contact--acknowledgments)

## About the Project

StellarView 3D is a full-stack web application that allows users to upload, view, and interactively edit their own 3D models right in the browser — no software installation required.

It was created as a diploma project (ВКР) in 2026 under the specialty **09.03.02 Information Systems and Technologies**.

Main goals:
- Provide an intuitive 3D viewer/editor for students, designers, game developers and hobbyists
- Support popular formats: glTF/glb, OBJ, FBX
- Real-time mouse controls: drag to move, scroll to zoom, right-drag to rotate
- Adjustable scene lighting, background color, and model position
- Secure file upload and storage on the server
- Google OAuth authentication

## Features

- Upload 3D models (glTF/glb, OBJ, FBX) via drag & drop or file picker
- Interactive mouse controls (left drag = move, wheel = zoom, right drag = rotate)
- Real-time lighting adjustment (directional + ambient + hemisphere)
- Custom background color picker
- Responsive right-side control panel (collapsible)
- Persistent model storage on backend
- Google login / registration
- Beautiful space-themed background with stars and grid

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Three Fiber (declarative Three.js)
- @react-three/drei (helpers & loaders)
- Tailwind CSS / custom dark theme

**Backend:**
- FastAPI (Python)
- Uvicorn
- File storage (local folder + static serving)
- Google OAuth 2.0
- CORS support

**3D:**
- Three.js (via React Three Fiber)
- glTF loader

## Live Demo

(If deployed)  
→ https://stellarview-3d.vercel.app/editor  
(If local only)  
→ http://localhost:5173/editor after running both frontend & backend

## Installation

### Prerequisites

- Node.js 18+ & npm / pnpm / yarn
- Python 3.10+
- Git

### Frontend

```bash
git clone https://github.com/yourusername/stellarview-3d-frontend.git
cd stellarview-3d-frontend
npm install
npm run dev

→ Open http://localhost:5173

### Backend

git clone https://github.com/yourusername/stellarview-3d-backend.git
cd stellarview-3d-backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

→ Open http://localhost:8000/docs to see Swagger

### Usage

Start backend (uvicorn main:app --reload --port 8000)
Start frontend (npm run dev)
Go to http://localhost:5173/editor
Click "Загрузить модель" → select .glb / .obj / .fbx file
Enable "Режим перемещения модели" checkbox
Left mouse drag on model → move it
Mouse wheel → zoom
Right mouse drag → rotate
Adjust lighting and background in the right panel

### Project Structure

stellarview-3d/
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
│   ├── uploads/models/        # uploaded files go here
│   ├── venv/
│   ├── .env
│   └── main.py
│
├── README.md
└── README.ru.md

### Contributing
Contributions are welcome!

Fork the repo
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

### License
Distributed under the MIT License.

### Contact & Acknowledgments

Felinkos — [email@example.com]
Project Link: github(???)

### Special thanks

Three.js & React Three Fiber team
FastAPI & Uvicorn developers
Khronos Group (glTF format)
Everyone who tested early versions!