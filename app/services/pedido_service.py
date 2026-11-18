from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Pedido, ItemPedido, Producto, Usuario
from app.schemas import PedidoCreate


def crear_pedido(db: Session, usuario: Usuario, datos: PedidoCreate) -> Pedido:
    try:
        total = Decimal("0.00")
        items_db = []

        for item in datos.items:
            # Consultar cada producto bloqueando la fila para actualización
            p = (
                db.query(Producto)
                .filter(Producto.id == item.producto_id)
                .with_for_update()
                .first()
            )

            if not p:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto inexistente",
                )

            if p.stock < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Sin stock de {p.nombre}: quedan {p.stock}",
                )

            # Descontar stock
            p.stock -= item.cantidad

            # Calcular total usando Decimal
            precio_unitario_dec = Decimal(str(p.precio_final)).quantize(Decimal("0.01"))
            total += precio_unitario_dec * Decimal(item.cantidad)

            # Congelar precio unitario en ItemPedido
            item_db = ItemPedido(
                producto_id=p.id,
                cantidad=item.cantidad,
                precio_unitario=precio_unitario_dec,
            )
            items_db.append(item_db)

        pedido = Pedido(
            usuario_id=usuario.id,
            total=total,
            estado="pendiente",
            items=items_db,
        )

        db.add(pedido)
        db.commit()
        db.refresh(pedido)
        return pedido

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
