import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, pedidos, usuarios, productos

# Autocrear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ModaMinimal - E-commerce API")

# Asegurar directorios para archivos estáticos
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "productos").mkdir(parents=True, exist_ok=True)

# Montar servidor de archivos estáticos
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Configuración CORS con orígenes controlados
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in allowed_origins_env.split(",")
    if origin.strip()
] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(pedidos.router)
app.include_router(usuarios.router)
app.include_router(productos.router)


@app.get("/")
def read_root():
    return {
        "mensaje": "Bienvenido a la API de ModaMinimal",
        "normativa": "Ley Nº 24.240 - Defensa del Consumidor",
    }
