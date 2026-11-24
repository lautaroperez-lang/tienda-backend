import secrets
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Pedido, Producto, SolicitudRevocacion, Usuario

PLAZO_DIAS = 10


def revocar(db: Session, usuario: Usuario, pedido_id: int) -> SolicitudRevocacion:
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()

    if not pedido or pedido.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )

    if pedido.estado == "cancelado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya fue cancelado",
        )

    ahora = datetime.now(timezone.utc)
    creado_en = pedido.creado_en
    if creado_en.tzinfo is None:
        creado_en = creado_en.replace(tzinfo=timezone.utc)

    dias_transcurridos = (ahora - creado_en).days
    if dias_transcurridos > PLAZO_DIAS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El plazo de 10 días ya venció",
        )

    try:
        for item in pedido.items:
            producto = (
                db.query(Producto)
                .filter(Producto.id == item.producto_id)
                .with_for_update()
                .first()
            )
            if producto:
                producto.stock += item.cantidad

        pedido.estado = "cancelado"

        codigo = f"ARR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"
        solicitud = SolicitudRevocacion(
            codigo=codigo,
            pedido_id=pedido.id,
            usuario_id=usuario.id,
        )

        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)
        return solicitud

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
