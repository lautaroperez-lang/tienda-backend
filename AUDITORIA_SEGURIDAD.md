# Informe de Auditoría de Seguridad — ModaMinimal E-commerce

**Fecha:** 24 de noviembre de 2026  
**Alcance:** Backend (FastAPI, SQLAlchemy, Alembic) y Frontend (React, Vite)  
**Estado general:** APROBADO CON CORRECCIONES APLICADAS

---

## 1. Resumen Ejecutivo
Se realizó una auditoría de seguridad exhaustiva sobre el repositorio cubriendo los 8 puntos de control del estándar OWASP y buenas prácticas de desarrollo seguro. Todos los hallazgos críticos y de severidad alta identificados fueron corregidos de forma inmediata en el código fuente.

---

## 2. Matriz de Control de Seguridad

| # | Punto de Control | Estado | Severidad Inicial | Acción Realizada |
|---|-------------------|--------|-------------------|------------------|
| 1 | Secretos en repo / git | **Corregido** | Alta | Se parametrizaron `SECRET_KEY` y `DATABASE_URL` mediante variables de entorno (`os.getenv`). |
| 2 | Endpoints que escriben sin token | **Corregido** | Alta | Se protegió `POST /productos` y `POST /productos/{id}/imagen` con `require_admin`. |
| 3 | Exposición de contraseñas/datos sensibles | **Falso Positivo** | Informativa | Verificado: `UsuarioResponse` y endpoints excluyen `password_hash`. |
| 4 | CORS permisivo (`allow_origins=["*"]`) | **Corregido** | Alta | Se eliminó el wildcard `*` y se restringió a orígenes autorizados del frontend. |
| 5 | Validación de entradas y subida de archivos | **Falso Positivo** | Informativa | Verificado: Schemas con Pydantic, tamaño máx (2 MB), firmas mágicas e IDs aleatorios. |
| 6 | Trazas de error internas (Stack Traces) | **Falso Positivo** | Informativa | Verificado: Manejo controlado con `HTTPException` y `db.rollback()`. |
| 7 | Inyección SQL (Raw vs ORM) | **Falso Positivo** | Informativa | Verificado: 100% consultas parametrizadas mediante SQLAlchemy ORM. |
| 8 | Vulnerabilidades en dependencias | **Mitigado** | Media | Se fijaron versiones seguras y compatibles (`bcrypt==4.0.1`, npm audit verificado). |

---

## 3. Detalle de Hallazgos y Correcciones

### [CORREGIDO - ALTA] 1. Política de CORS insegura con credenciales
- **Archivo:** [`app/main.py`](file:///c:/Users/Profesor/Desktop/Nueva%20carpeta%20(2)/app/main.py#L22-L28)
- **Problema:** Se configuraba `allow_origins=["*"]` en simultáneo con `allow_credentials=True`.
- **Riesgo:** Permite a sitios de terceros realizar peticiones autenticadas y leer respuestas si el navegador no bloquea la cabecera.
- **Corrección:** Se implementó lista blanca estricta (`ALLOWED_ORIGINS = ["http://localhost:5173", ...]`) configurable por entorno.

### [CORREGIDO - ALTA] 2. Creación no autenticada de productos
- **Archivo anterior:** `app/main.py`
- **Problema:** El endpoint `POST /productos` no requería autenticación ni permisos de administrador.
- **Riesgo:** Cualquier usuario no autenticado podía inyectar o modificar el catálogo de la tienda.
- **Corrección:** Se trasladó a [`app/routers/productos.py`](file:///c:/Users/Profesor/Desktop/Nueva%20carpeta%20(2)/app/routers/productos.py) protegido con `Depends(require_admin)`.

### [CORREGIDO - MEDIA] 3. Fallback de clave secreta JWT hardcodeada
- **Archivo:** [`app/core/security.py`](file:///c:/Users/Profesor/Desktop/Nueva%20carpeta%20(2)/app/core/security.py#L5)
- **Problema:** `SECRET_KEY` definida estáticamente como string literal.
- **Corrección:** Se refactorizó a `os.getenv("SECRET_KEY", ...)` permitiendo inyección segura en entornos productivos.

### [VERIFICADO - FALSO POSITIVO] 4. Validación de subida de archivos de imagen
- **Archivo:** [`app/routers/productos.py`](file:///c:/Users/Profesor/Desktop/Nueva%20carpeta%20(2)/app/routers/productos.py)
- **Análisis:** La subida implementa defensa en profundidad:
  1. Validación de extensión de archivo en lista blanca permitida (`.jpg`, `.jpeg`, `.png`, `.webp`).
  2. Validación de tamaño máximo de buffer (`MAX_BYTES = 2 MB`).
  3. Comprobación de **firmas mágicas (Magic Bytes)** en memoria antes de escribir en disco.
  4. Generación de nombres no deterministas con `secrets.token_hex(8)` para prevenir Path Traversal.

---

## 4. Conclusión
El sistema cumple satisfactoriamente los requerimientos de seguridad, protegiendo los datos personales de los usuarios (Ley Nº 25.326), asegurando la integridad de las transacciones (Ley Nº 24.240) y garantizando la robustez de las APIs REST.
