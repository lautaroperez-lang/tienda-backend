import secrets
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Producto
from app.schemas import ProductoOut, ProductoCreate
from app.routers.auth import require_admin

router = APIRouter(prefix="/productos", tags=["Productos"])

CARPETA = Path("uploads/productos")
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 2 * 1024 * 1024  # 2 MB
FIRMAS = (b"\xff\xd8\xff", b"\x89PNG\r\n\x1a\n", b"RIFF")


@router.get("", response_model=List[ProductoOut])
@router.get("/", response_model=List[ProductoOut])
def obtener_productos(db: Session = Depends(get_db)):
    productos = db.query(Producto).all()
    return productos


@router.get("/{producto_id}", response_model=ProductoOut)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    return producto


@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    db_producto = Producto(
        nombre=producto.nombre,
        precio_final=producto.precio_final,
        cuotas_cantidad=producto.cuotas_cantidad,
        cuotas_valor=producto.cuotas_valor,
        garantia_meses=producto.garantia_meses,
        stock=producto.stock,
        imagen_url=producto.imagen_url,
    )
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.post("/{producto_id}/imagen", response_model=ProductoOut)
async def subir_imagen_producto(
    producto_id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    ext = Path(archivo.filename or "").suffix.lower()
    if ext not in EXTENSIONES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Tipo de archivo no permitido. Solo se aceptan .jpg, .jpeg, .png y .webp",
        )

    contenido = await archivo.read()
    if len(contenido) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo supera el tamaño máximo permitido de 2 MB",
        )

    if not contenido.startswith(FIRMAS):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Firma mágica inválida: el archivo no es una imagen válida",
        )

    CARPETA.mkdir(parents=True, exist_ok=True)
    nombre = f"{producto_id}-{secrets.token_hex(8)}{ext}"
    ruta_guardado = CARPETA / nombre

    with open(ruta_guardado, "wb") as f:
        f.write(contenido)

    producto.imagen_url = f"/static/productos/{nombre}"
    db.commit()
    db.refresh(producto)
    return producto
