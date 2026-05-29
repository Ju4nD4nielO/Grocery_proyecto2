# GroceryOS — Proyecto 3 · cc3088 Bases de Datos 1

Extensión del Proyecto 2 con seguridad a nivel de base de datos: roles y permisos en PostgreSQL, stored procedures, ORM (Prisma) y autenticación con sesiones.

---

## Levantar el proyecto

```bash
git clone https://github.com/Ju4nD4nielO/Grocery_proyecto2
git checkout proyecto-3
cp .env.example .env   # las variables ya vienen con valores correctos
docker compose up --build
```

La aplicación queda disponible en:

| Servicio   | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:8081 |
| Backend    | http://localhost:3008 |
| PostgreSQL | localhost:5433        |

> La base de datos se inicializa automáticamente con los 4 scripts en `baseDatos/` en orden numérico.

---

## Credenciales

| Campo      | Valor    |
|------------|----------|
| Usuario DB | `proy3`  |
| Contraseña | `secret` |
| Base       | `tienda` |

---

## Usuarios de prueba (uno por cada rol)

| Usuario      | Contraseña    | Rol        |
|--------------|---------------|------------|
| `admin1`     | `password123` | admin      |
| `gerente1`   | `password123` | gerente    |
| `cajero1`    | `password123` | cajero     |
| `bodeguero1` | `password123` | bodeguero  |
| `vendedor1`  | `password123` | vendedor   |

---

## Esquema de roles en el DBMS

Los roles se crean con `CREATE ROLE` en PostgreSQL y se asignan permisos granulares con `GRANT`/`REVOKE` por tabla y operación.

| Rol             | Tablas y operaciones permitidas |
|-----------------|---------------------------------|
| `rol_admin`     | SELECT, INSERT, UPDATE, DELETE en **todas** las tablas |
| `rol_gerente`   | Lectura general + INSERT/UPDATE/DELETE en `empleado` y `proveedor` |
| `rol_cajero`    | SELECT en productos/clientes/empleados; INSERT en `venta` y `detalle_venta`; UPDATE stock en `producto` |
| `rol_bodeguero` | SELECT y UPDATE en `producto` y `categoria`; sin acceso a ventas ni clientes |
| `rol_vendedor`  | SELECT en productos; INSERT/UPDATE en `cliente`; INSERT en `venta` y `detalle_venta` |

### Permisos de UI por rol

| Sección      | admin | gerente | cajero | bodeguero | vendedor |
|--------------|:-----:|:-------:|:------:|:---------:|:--------:|
| Dashboard    | ✅    | ✅      | ✅     | ✅        | ✅       |
| Nueva Venta  | ✅    | ✅      | ✅     | ❌        | ✅       |
| Productos    | ✅    | ✅      | 👁     | ✅        | 👁       |
| Categorías   | ✅    | ✅      | 👁     | 👁        | 👁       |
| Clientes     | ✅    | ✅      | ✅     | ❌        | ✅       |
| Empleados    | ✅    | ✅      | ❌     | ❌        | ❌       |
| Proveedores  | ✅    | ✅      | ❌     | ❌        | ❌       |
| Reportes     | ✅    | ✅      | ❌     | ❌        | ❌       |

> ✅ = ver y editar · 👁 = solo lectura · ❌ = sin acceso

---

## Stored Procedures

| Procedure                  | Descripción                                              | Características                     |
|----------------------------|----------------------------------------------------------|-------------------------------------|
| `sp_registrar_venta`       | Registra venta completa con sus detalles                 | Transacción + ROLLBACK, params OUT  |
| `sp_cancelar_venta`        | Cancela venta y restaura stock                           | Params OUT, manejo de excepciones   |
| `sp_crear_producto`        | Inserta producto con validaciones de negocio             | Params IN/OUT                       |
| `sp_actualizar_stock`      | Ajusta stock de un producto                              | Param INOUT, excepciones            |
| `sp_reporte_top_productos` | Devuelve los N productos más vendidos                    | RETURNS TABLE, solo lectura         |
| `sp_crear_cliente`         | Inserta cliente con validación de email único            | Params IN/OUT, excepciones          |

---

## ORM — Prisma

Prisma se usa como ORM principal. Las operaciones CRUD migradas:

| Entidad     | Operaciones via Prisma ORM                      |
|-------------|--------------------------------------------------|
| Producto    | `findMany`, `findUnique`, `update`, `delete`     |
| Cliente     | `findMany`, `findUnique`, `update`, `delete`     |
| Categoría   | `findMany`, `create`, `update`, `delete`         |
| Empleado    | `findMany`, `create`, `update`, `delete`         |
| Proveedor   | `findMany`, `create`, `update`, `delete`         |
| UsuarioApp  | `findUnique` (autenticación)                     |

Las operaciones críticas (crear venta, crear producto, crear cliente, ajustar stock) se delegan a stored procedures invocados con `pool.query()`.

---

## Estructura del repositorio

```
.
├── baseDatos/
│   ├── schema.sql        # Tablas + tabla usuario_app
│   ├── roles.sql         # 5 roles con GRANT/REVOKE
│   ├── procedures.sql    # 6 stored procedures
│   └── data.sql          # Datos + 5 usuarios de prueba
├── backend/
│   ├── Dockerfile
│   ├── package.json      # Prisma, express-session, bcryptjs
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.js
│       ├── db.js         # PrismaClient + Pool pg
│       ├── middleware/
│       │   └── auth.js   # requireAuth, requireRol(...)
│       └── routes/
│           ├── auth.js   # POST /auth/login, logout, GET /me
│           ├── productos.js
│           ├── clientes.js
│           ├── categorias.js
│           ├── empleados.js
│           ├── proveedores.js
│           ├── ventas.js
│           └── reportes.js
├── frontend/
│   ├── Dockerfile
│   └── index.html        # SPA con login + protección por rol
├── docker-compose.yml
├── .env
├── .env.example
└── README.md
```

---

## Apagar el proyecto

```bash
docker compose down
# Eliminar también los datos persistidos:
docker compose down -v
```