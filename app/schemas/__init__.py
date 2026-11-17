from pydantic import BaseModel, EmailStr

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