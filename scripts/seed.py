import sys
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from datetime import datetime, timezone
from app.database import SessionLocal
from app import models
from app.core.security import hash_password


def seed_all():
    db = SessionLocal()
    try:
        print("[*] Iniciando seed idempotente de FrutiMix...")

        # 1. Administrador (configurable por variables de entorno)
        admin_email = os.environ.get("SEED_ADMIN_EMAIL", "admin@frutimix.com")
        admin_password = os.environ.get("SEED_ADMIN_PASSWORD", "admin1234")

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
                admin_kwargs["hashed_password"] = hash_password(admin_password)
            if hasattr(models.Usuario, "password_hash"):
                admin_kwargs["password_hash"] = hash_password(admin_password)

            db.add(models.Usuario(**admin_kwargs))
            db.commit()
            print(f"[*] Usuario administrador {admin_email} creado exitosamente.")
        else:
            print(f"[*] Usuario administrador {admin_email} ya existe.")

        # 2. Categoría (si el modelo existe)
        cat = None
        if hasattr(models, "Categoria"):
            cat = db.query(models.Categoria).filter_by(nombre="Jugos").first()
            if not cat:
                cat = models.Categoria(nombre="Jugos")
                db.add(cat)
                db.commit()

        # 3. Productos (3 imágenes locales persistentes en /demo/ y 3 en Pexels)
        jugos = [
            {
                "nombre": "Jugo Detox Verde",
                "descripcion": "Espinaca, apio y manzana verde.",
                "precio_final": 1700.0,
                "stock": 10,
                "imagen_url": "/demo/detox.jpg",
            },
            {
                "nombre": "Jugo de Naranja",
                "descripcion": "100% natural, prensado en frío.",
                "precio_final": 1500.0,
                "stock": 12,
                "imagen_url": "/demo/naranja.webp",
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
                "imagen_url": "/demo/chocolate.jpg",
            },
            {
                "nombre": "Limonada Artesanal",
                "descripcion": "Limón, menta y jengibre.",
                "precio_final": 1400.0,
                "stock": 20,
                "imagen_url": "https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=600",
            },
        ]

        print("[*] Sincronizando catálogo de productos...")
        for j in jugos:
            prod = db.query(models.Producto).filter_by(nombre=j["nombre"]).first()
            if not prod:
                prod_kwargs = {
                    "nombre": j["nombre"],
                    "precio_final": j["precio_final"],
                    "stock": j["stock"],
                    "imagen_url": j["imagen_url"],
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
                print(f" [+] Creado producto: {j['nombre']}")
            else:
                # Actualizar campos e imagen_url sin duplicar ni borrar pedidos
                prod.precio_final = j["precio_final"]
                prod.imagen_url = j["imagen_url"]
                if hasattr(prod, "cuotas_cantidad"):
                    prod.cuotas_cantidad = 3
                if hasattr(prod, "cuotas_valor"):
                    prod.cuotas_valor = round(j["precio_final"] / 3, 2)
                if hasattr(prod, "garantia_meses"):
                    prod.garantia_meses = 6
                if hasattr(prod, "stock") and (prod.stock is None or prod.stock == 0):
                    prod.stock = j["stock"]
                print(f" [~] Actualizado producto existente: {j['nombre']} -> {j['imagen_url']}")

        db.commit()
        print(">>> SEED IDEMPOTENTE COMPLETADO: Catálogo FrutiMix sincronizado exitosamente <<<")
    except Exception as e:
        db.rollback()
        print(f"Error en seed_all: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
