const express  = require('express');
const router   = express.Router();
const { prisma, pool } = require('../db');
const { requireAuth, puedeVerProductos, puedeEditarStock, soloAdmin, adminOGerente } = require('../middleware/auth');

// GET /productos — todos los roles autenticados
router.get('/', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const productos = await prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });
    const result = productos.map(p => ({
      id_producto:  p.id_producto,
      nombre:       p.nombre,
      descripcion:  p.descripcion,
      precio:       p.precio,
      stock:        p.stock,
      id_categoria: p.id_categoria,
      categoria:    p.categoria.nombre,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /productos/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const p = await prisma.producto.findUnique({
      where:   { id_producto: parseInt(req.params.id) },
      include: { categoria: true },
    });
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ ...p, categoria: p.categoria.nombre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /productos — invoca SP sp_crear_producto
// Roles: admin, gerente, bodeguero
router.post('/', ...adminOGerente, async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;
  if (!nombre || precio === undefined || stock === undefined || !id_categoria) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, precio, stock, id_categoria' });
  }
  try {
    // Llamada al stored procedure sp_crear_producto
    const result = await pool.query(
      `SELECT * FROM sp_crear_producto($1, $2, $3, $4, $5)`,
      [nombre, descripcion || null, parseFloat(precio), parseInt(stock), parseInt(id_categoria)]
    );
    const { p_id_producto, p_mensaje } = result.rows[0];
    if (p_id_producto === -1) {
      return res.status(400).json({ error: p_mensaje });
    }
    // ORM — Prisma (CRUD: READ) para devolver el objeto creado
    const nuevo = await prisma.producto.findUnique({
      where:   { id_producto: p_id_producto },
      include: { categoria: true },
    });
    res.status(201).json({ ...nuevo, categoria: nuevo.categoria.nombre, mensaje: p_mensaje });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id — Prisma ORM (CRUD: UPDATE)
// Roles: admin, gerente, bodeguero
router.put('/:id', ...puedeEditarStock, async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;
  try {
    // ORM — Prisma (CRUD: UPDATE)
    const actualizado = await prisma.producto.update({
      where: { id_producto: parseInt(req.params.id) },
      data: {
        nombre:       nombre,
        descripcion:  descripcion,
        precio:       precio !== undefined ? parseFloat(precio) : undefined,
        stock:        stock  !== undefined ? parseInt(stock)    : undefined,
        id_categoria: id_categoria ? parseInt(id_categoria) : undefined,
      },
      include: { categoria: true },
    });
    res.json({ ...actualizado, categoria: actualizado.categoria.nombre });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /productos/:id/stock — ajuste de stock via SP
// Roles: admin, bodeguero
router.patch('/:id/stock', ...puedeEditarStock, async (req, res) => {
  const { cantidad } = req.body;
  if (cantidad === undefined) return res.status(400).json({ error: 'cantidad es requerida' });
  try {
    // Llamada al stored procedure sp_actualizar_stock
    const result = await pool.query(
      `SELECT * FROM sp_actualizar_stock($1, $2, $3)`,
      [parseInt(req.params.id), parseInt(cantidad), 0]
    );
    const { p_stock_nuevo, p_mensaje } = result.rows[0];
    if (p_stock_nuevo === -1) return res.status(400).json({ error: p_mensaje });
    res.json({ stock_nuevo: p_stock_nuevo, mensaje: p_mensaje });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id — solo admin
router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: DELETE)
    await prisma.producto.delete({
      where: { id_producto: parseInt(req.params.id) },
    });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;