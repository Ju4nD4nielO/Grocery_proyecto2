const express  = require('express');
const router   = express.Router();
const { prisma } = require('../db');
const { requireAuth, adminOGerente, soloAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const proveedores = await prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } });
    res.json(proveedores);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', ...adminOGerente, async (req, res) => {
  const { nombre, telefono, email } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    // ORM — Prisma (CRUD: CREATE)
    const nuevo = await prisma.proveedor.create({ data: { nombre, telefono, email } });
    res.status(201).json(nuevo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', ...adminOGerente, async (req, res) => {
  const { nombre, telefono, email } = req.body;
  try {
    // ORM — Prisma (CRUD: UPDATE)
    const actualizado = await prisma.proveedor.update({
      where: { id_proveedor: parseInt(req.params.id) },
      data:  { nombre, telefono, email },
    });
    res.json(actualizado);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: DELETE)
    await prisma.proveedor.delete({ where: { id_proveedor: parseInt(req.params.id) } });
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;