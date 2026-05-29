const express  = require('express');
const router   = express.Router();
const { prisma } = require('../db');
const { requireAuth, adminOGerente, soloAdmin } = require('../middleware/auth');

// GET /categorias — todos los autenticados
router.get('/', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /categorias — admin, gerente
router.post('/', ...adminOGerente, async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    // ORM — Prisma (CRUD: CREATE)
    const nueva = await prisma.categoria.create({
      data: { nombre, descripcion },
    });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /categorias/:id — admin, gerente
router.put('/:id', ...adminOGerente, async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    // ORM — Prisma (CRUD: UPDATE)
    const actualizada = await prisma.categoria.update({
      where: { id_categoria: parseInt(req.params.id) },
      data:  { nombre, descripcion },
    });
    res.json(actualizada);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /categorias/:id — solo admin
router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: DELETE)
    await prisma.categoria.delete({
      where: { id_categoria: parseInt(req.params.id) },
    });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;