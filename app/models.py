from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Numeric, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    precio_final = Column(Float, nullable=False)
    cuotas_cantidad = Column(Integer, nullable=False)
    cuotas_valor = Column(Float, nullable=False)
    garantia_meses = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False)

    # Relación con ItemPedido
    items = relationship("ItemPedido", back_populates="producto")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="cliente")
    activo = Column(Boolean, default=True, nullable=False)
    fecha_baja = Column(DateTime(timezone=True), nullable=True)
    acepto_tratamiento = Column(Boolean, default=True, nullable=False)
    fecha_consentimiento = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False)
    creado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=func.now(), nullable=False)

    # Relaciones
    pedidos = relationship("Pedido", back_populates="usuario")
    solicitudes_revocacion = relationship("SolicitudRevocacion", back_populates="usuario")

    @property
    def hashed_password(self):
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value):
        self.password_hash = value


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total = Column(Numeric(12, 2), default=0.0, nullable=False)
    estado = Column(String, default="pendiente", nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow, server_default=func.now(), nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="pedidos")
    items = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")
    solicitudes_revocacion = relationship("SolicitudRevocacion", back_populates="pedido", cascade="all, delete-orphan")


class ItemPedido(Base):
    __tablename__ = "items_pedido"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)

    # Relaciones
    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="items")

    @property
    def nombre_producto(self):
        return self.producto.nombre if self.producto else None


class SolicitudRevocacion(Base):
    __tablename__ = "solicitudes_revocacion"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String, unique=True, nullable=False, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    creada_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    pedido = relationship("Pedido", back_populates="solicitudes_revocacion")
    usuario = relationship("Usuario", back_populates="solicitudes_revocacion")
