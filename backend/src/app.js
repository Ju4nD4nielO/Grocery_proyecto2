const express = require('express');
const cors    = require('cors');
const session = require('express-session');

const authRoutes       = require('./routes/auth');
const productosRoutes  = require('./routes/productos');
const ventasRoutes     = require('./routes/ventas');
const clientesRoutes   = require('./routes/clientes');
const empleadosRoutes  = require('./routes/empleados');
const categoriasRoutes = require('./routes/categorias');
const proveedoresRoutes= require('./routes/proveedores');
const reportesRoutes   = require('./routes/reportes');

const app = express();

// ── CORS — permite cookies de sesión desde el frontend ────
app.use(cors({
  origin: true,          // refleja el Origin de la petición
  credentials: true,     // necesario para que el navegador envíe cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.options('*', cors());

// ── Body parser ───────────────────────────────────────────
app.use(express.json());

// ── Sesiones ──────────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET || 'groceryos-secret-2026',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   false,   // true solo con HTTPS
    maxAge:   1000 * 60 * 60 * 8,  // 8 horas
  },
}));

// ── Rutas ─────────────────────────────────────────────────
app.use('/auth',        authRoutes);
app.use('/productos',   productosRoutes);
app.use('/ventas',      ventasRoutes);
app.use('/clientes',    clientesRoutes);
app.use('/empleados',   empleadosRoutes);
app.use('/categorias',  categoriasRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/reportes',    reportesRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Arrancar ──────────────────────────────────────────────
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`GroceryOS backend corriendo en puerto ${PORT}`);
});