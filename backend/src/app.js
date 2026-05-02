const express = require('express');
const cors = require('cors');

const productosRoutes   = require('./routes/productos');
const ventasRoutes      = require('./routes/ventas');
const clientesRoutes    = require('./routes/clientes');
const empleadosRoutes   = require('./routes/empleados');
const categoriasRoutes  = require('./routes/categorias');
const proveedoresRoutes = require('./routes/proveedores');
const reportesRoutes    = require('./routes/reportes');

const app = express();

// CORS explícito
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Responder preflight para todas las rutas
app.options('*', cors());

app.use(express.json());

app.use('/productos',   productosRoutes);
app.use('/ventas',      ventasRoutes);
app.use('/clientes',    clientesRoutes);
app.use('/empleados',   empleadosRoutes);
app.use('/categorias',  categoriasRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/reportes',    reportesRoutes);

app.listen(3008, () => {
  console.log('Servidor corriendo en puerto 3008');
});