from typing import List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import Producto as ProductoModel
from app.schemas import ProductoSchema
from app.routers import auth, pedidos, usuarios

# Autocrear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ModaMinimal - E-commerce API")

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir el router en la instancia de FastAPI
app.include_router(auth.router)
app.include_router(pedidos.router)
app.include_router(usuarios.router)


@app.get("/")
def read_root():
    return {
        "mensaje": "Bienvenido a la API de ModaMinimal",
        "normativa": "Ley Nº 24.240 - Defensa del Consumidor"
    }


# GET /productos: consultar lista usando la sesión de base de datos
@app.get("/productos", response_model=List[ProductoSchema])
def obtener_productos(db: Session = Depends(get_db)):
    productos = db.query(ProductoModel).all()
    return productos


# POST /productos: guardar nuevo producto usando la sesión de base de datos
@app.post("/productos", response_model=ProductoSchema, status_code=201)
def crear_producto(producto: ProductoSchema, db: Session = Depends(get_db)):
    if producto.id is not None:
        existente = db.query(ProductoModel).filter(ProductoModel.id == producto.id).first()
        if existente:
            raise HTTPException(status_code=400, detail="El ID de producto ya existe.")

    db_producto = ProductoModel(
        nombre=producto.nombre,
        precio_final=producto.precio_final,
        cuotas_cantidad=producto.cuotas_cantidad,
        cuotas_valor=producto.cuotas_valor,
        garantia_meses=producto.garantia_meses,
        stock=producto.stock
    )
    if producto.id is not None:
        db_producto.id = producto.id

    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto
