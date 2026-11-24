import sys
import os
import shutil
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from datetime import datetime, timezone
from app.database import SessionLocal
from app import models
from app.core.security import hash_password

SEED_IMAGES_DIR = BASE_DIR / "seed_images"
DEST_DIR = BASE_DIR / "uploads" / "productos"


def copiar_imagen_local(nombre_archivo: str) -> str:
    ruta_origen = SEED_IMAGES_DIR / nombre_archivo
    if not ruta_origen.exists():
        raise FileNotFoundError(f"No se encontró la imagen de origen en {ruta_origen}")

    DEST_DIR.mkdir(parents=True, exist_ok=True)
    ext = ruta_origen.suffix.lower()
    nombre_unico = f"{ruta_origen.stem}-{secrets.token_hex(8)}{ext}"
    ruta_destino = DEST_DIR / nombre_unico
    shutil.copy2(ruta_origen, ruta_destino)
    print(f"[*] Imagen copiada: {nombre_archivo} -> {nombre_unico}")
    return f"/static/productos/{nombre_unico}"


def seed_all():
    db = SessionLocal()
    try:
        print("[*] Limpiando datos previos de pedidos y productos...")
        if hasattr(models, "SolicitudRevocacion"):
            db.query(models.SolicitudRevocacion).delete()
        if hasattr(models, "ItemPedido"):
            db.query(models.ItemPedido).delete()
        if hasattr(models, "Pedido"):
            db.query(models.Pedido).delete()
        db.query(models.Producto).delete()
        db.commit()

        admin_email = "admin@frutimix.com"
        admin = db.query(models.Usuario).filter_by(email=admin_email).first()
        if not admin:
            print(f"[*] Creando usuario administrador: {admin_email}...")
            admin_kwargs = {
                "nombre": "Admin FrutiMix",
                "email": admin_email,
                "rol": "admin",
                "activo": True,
                "acepto_tratamiento": True,
                "fecha_consentimiento": datetime.now(timezone.utc),
            }
            if hasattr(models.Usuario, "hashed_password"):
                admin_kwargs["hashed_password"] = hash_password("admin1234")
            if hasattr(models.Usuario, "password_hash"):
                admin_kwargs["password_hash"] = hash_password("admin1234")

            db.add(models.Usuario(**admin_kwargs))
            db.commit()
        else:
            print(f"[*] Usuario administrador {admin_email} ya existe.")

        cat = None
        if hasattr(models, "Categoria"):
            cat = db.query(models.Categoria).filter_by(nombre="Jugos").first()
            if not cat:
                cat = models.Categoria(nombre="Jugos")
                db.add(cat)
                db.commit()

        jugos = [
            {
                "nombre": "Jugo Detox Verde",
                "descripcion": "Espinaca, apio y manzana verde.",
                "precio_final": 1700.0,
                "stock": 10,
                "local_image": "detox.jpg",
            },
            {
                "nombre": "Jugo de Naranja",
                "descripcion": "100% natural, prensado en frío.",
                "precio_final": 1500.0,
                "stock": 12,
                "local_image": "naranja.webp",
            },
            {
                "nombre": "Jugo Tropical",
                "descripcion": "Mango, ananá y maracuyá.",
                "precio_final": 1600.0,
                "stock": 8,
                "imagen_url": "https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=600",
            },
            {
                "nombre": "Licuado de Frutilla",
                "descripcion": "Frutillas frescas con leche y un toque de miel.",
                "precio_final": 1800.0,
                "stock": 15,
                "imagen_url": "https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg?auto=compress&cs=tinysrgb&w=600",
            },
            {
                "nombre": "Batido de Chocolate",
                "descripcion": "Cacao puro, plátano y avena.",
                "precio_final": 1900.0,
                "stock": 10,
                "local_image": "chocolate.jpg",
            },
            {
                "nombre": "Limonada Artesanal",
                "descripcion": "Limón, menta y jengibre.",
                "precio_final": 1400.0,
                "stock": 20,
                "imagen_url": "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=600",
            },
        ]

        print("[*] Insertando productos de FrutiMix...")
        for j in jugos:
            if j.get("local_image"):
                imagen_url = copiar_imagen_local(j["local_image"])
            else:
                imagen_url = j.get("imagen_url")

            prod_kwargs = {
                "nombre": j["nombre"],
                "precio_final": j["precio_final"],
                "stock": j["stock"],
                "imagen_url": imagen_url,
            }
            if hasattr(models.Producto, "descripcion"):
                prod_kwargs["descripcion"] = j["descripcion"]
            if hasattr(models.Producto, "categoria_id") and cat:
                prod_kwargs["categoria_id"] = cat.id
            if hasattr(models.Producto, "cuotas_cantidad"):
                prod_kwargs["cuotas_cantidad"] = 3
            if hasattr(models.Producto, "cuotas_valor"):
                prod_kwargs["cuotas_valor"] = round(j["precio_final"] / 3, 2)
            if hasattr(models.Producto, "garantia_meses"):
                prod_kwargs["garantia_meses"] = 6
            if hasattr(models.Producto, "en_stock"):
                prod_kwargs["en_stock"] = j["stock"] > 0

            db.add(models.Producto(**prod_kwargs))

        db.commit()
        print(">>> SEEDING COMPLETADO: 6 productos (3 locales en uploads/productos/ y 3 con URLs de Pexels) <<<")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
