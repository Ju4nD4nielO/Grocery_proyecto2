const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM empleado ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, puesto } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const result = await db.query(
      'INSERT INTO empleado (nombre, puesto) VALUES ($1,$2) RETURNING *',
      [nombre, puesto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, puesto } = req.body;
  try {
    const result = await db.query(
      'UPDATE empleado SET nombre=$1, puesto=$2 WHERE id_empleado=$3 RETURNING *',
      [nombre, puesto, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM empleado WHERE id_empleado=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;