const express  = require('express');
const router   = express.Router();
const { prisma, pool } = require('../db');
const { requireAuth, puedeVender, soloAdmin, adminOGerente } = require('../middleware/auth');

// GET /clientes
router.get('/', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /clientes/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const cliente = await prisma.cliente.findUnique({
      where: { id_cliente: parseInt(req.params.id) },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /clientes — invoca SP sp_crear_cliente
// Roles: admin, gerente, cajero, vendedor
router.post('/', ...puedeVender, async (req, res) => {
  const { nombre, email, telefono } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    // Llamada al stored procedure sp_crear_cliente
    const result = await pool.query(
      `SELECT * FROM sp_crear_cliente($1, $2, $3)`,
      [nombre, email || null, telefono || null]
    );
    const { p_id_cliente, p_mensaje } = result.rows[0];
    if (p_id_cliente === -1) return res.status(400).json({ error: p_mensaje });

    // ORM — Prisma (CRUD: READ) para devolver objeto creado
    const nuevo = await prisma.cliente.findUnique({
      where: { id_cliente: p_id_cliente },
    });
    res.status(201).json({ ...nuevo, mensaje: p_mensaje });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /clientes/:id — ORM Prisma
router.put('/:id', ...puedeVender, async (req, res) => {
  const { nombre, email, telefono } = req.body;
  try {
    // ORM — Prisma (CRUD: UPDATE)
    const actualizado = await prisma.cliente.update({
      where: { id_cliente: parseInt(req.params.id) },
      data:  { nombre, email, telefono },
    });
    res.json(actualizado);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /clientes/:id — solo admin
router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: DELETE)
    await prisma.cliente.delete({
      where: { id_cliente: parseInt(req.params.id) },
    });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;