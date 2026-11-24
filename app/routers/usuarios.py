import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, Pedido
from app.routers.auth import get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def _construir_datos_usuario(usuario: Usuario, db: Session) -> dict:
    pedidos_db = (
        db.query(Pedido)
        .filter(Pedido.usuario_id == usuario.id)
        .order_by(Pedido.creado_en.desc())
        .all()
    )

    fecha_alta = usuario.creado_en.isoformat() if usuario.creado_en else None
    fecha_consentimiento = (
        usuario.fecha_consentimiento.isoformat()
        if usuario.fecha_consentimiento
        else fecha_alta
    )

    return {
        "titular": {
            "nombre": usuario.nombre,
            "email": usuario.email,
            "alta": fecha_alta,
        },
        "consentimiento": {
            "otorgado": usuario.acepto_tratamiento,
            "fecha": fecha_consentimiento,
        },
        "pedidos": [
            {
                "id": p.id,
                "fecha": p.creado_en.isoformat() if p.creado_en else None,
                "total": float(p.total),
                "estado": p.estado,
            }
            for p in pedidos_db
        ],
    }


@router.get("/me/datos")
def obtener_mis_datos(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    return _construir_datos_usuario(usuario_actual, db)


@router.get("/me/exportar")
def exportar_mis_datos(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    datos = _construir_datos_usuario(usuario_actual, db)
    contenido = json.dumps(datos, indent=2, ensure_ascii=False)
    headers = {
        "Content-Disposition": 'attachment; filename="mis-datos.json"',
    }
    return Response(
        content=contenido,
        media_type="application/json",
        headers=headers,
    )


@router.delete("/me")
def dar_de_baja_cuenta(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_user),
):
    usuario_actual.nombre = "Usuario dado de baja"
    usuario_actual.email = f"baja-{usuario_actual.id}@anonimo.local"
    usuario_actual.password_hash = "!"
    usuario_actual.acepto_tratamiento = False
    usuario_actual.activo = False
    usuario_actual.fecha_baja = datetime.now(timezone.utc)

    db.commit()
    return {"mensaje": "Cuenta dada de baja y anonimizada con éxito"}
