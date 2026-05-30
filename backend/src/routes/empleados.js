const express  = require('express');
const router   = express.Router();
const { prisma } = require('../db');
const { requireAuth, adminOGerente, soloAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: READ)
    const empleados = await prisma.empleado.findMany({ orderBy: { nombre: 'asc' } });
    res.json(empleados);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', ...adminOGerente, async (req, res) => {
  const { nombre, puesto } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    // ORM — Prisma (CRUD: CREATE)
    const nuevo = await prisma.empleado.create({ data: { nombre, puesto } });
    res.status(201).json(nuevo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', ...adminOGerente, async (req, res) => {
  const { nombre, puesto } = req.body;
  try {
    // ORM — Prisma (CRUD: UPDATE)
    const actualizado = await prisma.empleado.update({
      where: { id_empleado: parseInt(req.params.id) },
      data:  { nombre, puesto },
    });
    res.json(actualizado);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Empleado no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // ORM — Prisma (CRUD: DELETE)
    await prisma.empleado.delete({ where: { id_empleado: parseInt(req.params.id) } });
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Empleado no encontrado' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;