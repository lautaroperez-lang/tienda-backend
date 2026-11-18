from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

# Esquemas de Producto
class ProductoBase(BaseModel):
    nombre: str
    precio_final: float
    cuotas_cantidad: int = 1
    cuotas_valor: float = 0.0
    garantia_meses: int = 0
    stock: int = 0

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: int

    class Config:
        from_attributes = True

class ProductoSchema(ProductoBase):
    id: int | None = None

    class Config:
        from_attributes = True

Producto = ProductoSchema

# Esquemas de Autenticación / Usuarios (Clase 5)
class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginData(BaseModel):
    email: str
    password: str

# Esquemas de Pedidos (Clase 8)
class ItemIn(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)

class PedidoCreate(BaseModel):
    items: list[ItemIn] = Field(min_length=1)

class ItemOut(BaseModel):
    id: int
    producto_id: int
    nombre_producto: str | None = None
    cantidad: int
    precio_unitario: Decimal

    class Config:
        from_attributes = True

class PedidoOut(BaseModel):
    id: int
    estado: str
    total: Decimal
    creado_en: datetime
    items: list[ItemOut]

    class Config:
        from_attributes = True
