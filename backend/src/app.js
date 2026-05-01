const express = require('express');
const cors = require('cors');

const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});