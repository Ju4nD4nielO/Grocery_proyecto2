# Grocery_proyecto2

# GroceryOS — Proyecto 2 · cc3088 Bases de Datos 1

Aplicación web para gestión de inventario y ventas de una tienda.  

---

## Levantar el proyecto

```bash
git clone <url-del-repositorio>
cp .env.example .env   # las variables ya vienen con valores correctos
docker compose up --build
```

La aplicación queda disponible en:

| Servicio  | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:8081  |
| Backend   | http://localhost:3008  |
| PostgreSQL| localhost:5433         |

> La base de datos se inicializa automáticamente con `baseDatos/schema.sql` y `baseDatos/data.sql` (25+ registros por tabla).

---

## Credenciales de base de datos

| Campo    | Valor    |
|----------|----------|
| Usuario  | `proy2`  |
| Contraseña | `secret` |
| Base     | `tienda` |

---

## Estructura del repositorio

```
.
├── baseDatos/
│   ├── schema.sql    
│   └── data.sql          
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── db.js
│       └── routes/
│           ├── productos.js   
│           ├── clientes.js    
│           ├── empleados.js    
│           ├── categorias.js   
│           ├── proveedores.js 
│           ├── ventas.js       
├── frontend/
│   ├── Dockerfile
│   └── index.html       
├── docker-compose.yml
├── .env
├── .env.example
└── README.md
```

---

## Funcionalidades implementadas

### I. Diseño de base de datos

### II. SQL (todas ejecutadas desde la aplicación web)

### III. Aplicación web

---

## Apagar el proyecto

```bash
docker compose down
# Para eliminar también los datos:
docker compose down -v
```