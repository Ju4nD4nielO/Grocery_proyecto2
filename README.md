# GroceryOS — Proyecto 2 · cc3062 Sistemas y Tecnologías Web

Aplicación web para gestión de inventario y ventas de una tienda. Frontend en React + Vite, backend en Node.js/Express, base de datos PostgreSQL, todo orquestado con Docker.

---

## Levantar el proyecto

```bash
git clone https://github.com/Ju4nD4nielO/Grocery_proyecto2
cd Grocery_proyecto2
cp .env.example .env
docker compose up --build
```

La aplicación queda disponible en:

| Servicio   | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:8081 |
| Backend    | http://localhost:3008 |
| PostgreSQL | localhost:5433        |

> La base de datos se inicializa automáticamente con `baseDatos/schema.sql` y `baseDatos/data.sql`.

---

## Credenciales de base de datos

| Campo      | Valor    |
|------------|----------|
| Usuario    | `proy2`  |
| Contraseña | `secret` |
| Base       | `tienda` |

## Credenciales de la aplicación (demo)

| Usuario    | Contraseña   | Rol      |
|------------|-------------|----------|
| `admin`    | `admin123`  | Gerente  |
| `cajero`   | `cajero123` | Cajero   |
| `vendedor` | `vend123`   | Vendedor |

---

## Estructura del repositorio

```
.
├── baseDatos/
│   ├── schema.sql          # Tablas, índices
│   └── data.sql            # 25+ registros por tabla + vistas
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
│           └── reportes.js
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .eslintrc.cjs
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── hooks/
│       │   └── useApi.js
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   └── Toast.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Productos.jsx
│       │   ├── CrudPages.jsx   # Categorías, Clientes, Empleados, Proveedores
│       │   ├── Ventas.jsx
│       │   └── Reportes.jsx
│       └── tests/
│           ├── setup.js
│           └── contexts.test.jsx
├── docker-compose.yml
├── .env
├── .env.example
└── README.md
```

---

## API REST — Endpoints

Base URL: `http://localhost:3008`

### Productos `/productos`
| Método | Ruta             | Descripción            |
|--------|------------------|------------------------|
| GET    | `/productos`     | Listar todos           |
| GET    | `/productos/:id` | Obtener por ID         |
| POST   | `/productos`     | Crear producto         |
| PUT    | `/productos/:id` | Actualizar producto    |
| DELETE | `/productos/:id` | Eliminar producto      |

### Clientes `/clientes`
| Método | Ruta            | Descripción         |
|--------|-----------------|---------------------|
| GET    | `/clientes`     | Listar todos        |
| GET    | `/clientes/:id` | Obtener por ID      |
| POST   | `/clientes`     | Crear cliente       |
| PUT    | `/clientes/:id` | Actualizar cliente  |
| DELETE | `/clientes/:id` | Eliminar cliente    |

### Categorías, Empleados, Proveedores
Misma estructura CRUD en `/categorias`, `/empleados`, `/proveedores`.

### Ventas `/ventas`
| Método | Ruta      | Descripción                              |
|--------|-----------|------------------------------------------|
| POST   | `/ventas` | Crear venta con transacción y descuento de stock |

Body esperado:
```json
{
  "id_cliente": 1,
  "id_empleado": 2,
  "productos": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 5, "cantidad": 1 }
  ]
}
```

### Reportes `/reportes`
| Ruta                             | Descripción                                 |
|----------------------------------|---------------------------------------------|
| `/reportes/ventas-detalle`       | Vista con cliente, empleado y total         |
| `/reportes/productos-vendidos`   | JOIN producto, categoría y proveedor        |
| `/reportes/clientes-compras`     | Clientes con total gastado y nº de compras  |
| `/reportes/ventas-por-categoria` | GROUP BY + HAVING sobre categorías          |
| `/reportes/productos-sin-ventas` | Subquery con IN                             |
| `/reportes/clientes-frecuentes`  | Subquery con EXISTS                         |
| `/reportes/ranking-empleados`    | CTE + window function ROW_NUMBER            |
| `/reportes/stock-bajo`           | Subquery correlacionado vs. promedio        |

Todos los endpoints devuelven JSON. Los errores devuelven el código HTTP correspondiente (400, 404, 500) con `{ "error": "mensaje" }`.

---

## Funcionalidades implementadas

### I. Arquitectura y API REST
- Endpoints documentados en este README
- CRUD completo para productos, clientes, categorías, empleados y proveedores
- Manejo de errores con códigos HTTP correctos y mensajes en JSON
- Endpoints de agregación en `/reportes` (totales de ventas, stock, rankings)

### II. Frontend — React
- **React Router** con 8 rutas: `/login`, `/`, `/ventas`, `/productos`, `/categorias`, `/clientes`, `/empleados`, `/proveedores`, `/reportes`
- **React Context** para sesión de usuario (`AuthContext`) y carrito de compras (`CartContext`)
- **Hooks**: `useState`, `useEffect`, `useCallback` en todas las páginas; `useMemo` en `CartContext` para el total
- **`useReducer`** en `CartContext` para el flujo completo del carrito (ADD, UPDATE, REMOVE, CLEAR)
- **Formularios controlados** con validación en cliente en todas las páginas CRUD
- **Reportes** con tabla de datos reales y gráfica de barras en el Dashboard (recharts)
- **Manejo de errores** visible mediante sistema de Toast y mensajes inline en formularios

### III. Calidad de código
- ESLint configurado: `npm run lint`
- 10 pruebas unitarias con Vitest + Testing Library: `npm test`

### IV. Despliegue
- `docker compose up --build` levanta la base de datos, backend y frontend sin pasos adicionales
- Variables de entorno en `.env` / `.env.example`

### V. Avanzado
- Autenticación con login/logout manejado en `AuthContext` (sesión en `sessionStorage`)
- Exportación a CSV desde la página de Reportes
- Diseño responsivo verificable en móvil y escritorio

---

## Comandos de desarrollo (sin Docker)

```bash
# Backend
cd backend
npm install
node src/app.js

# Frontend
cd frontend
npm install
npm run dev      # desarrollo
npm run build    # producción
npm run lint     # linter
npm test         # pruebas
```

---

## Apagar el proyecto

```bash
docker compose down

# Para eliminar también los volúmenes (borra los datos):
docker compose down -v
```