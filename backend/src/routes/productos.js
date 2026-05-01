const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos los productos (JOIN con categoria)
router.get('/', async (req, res) => {
try {
    const result = await db.query(`
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
             c.id_categoria, c.nombre AS categoria
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET producto por id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, c.nombre AS categoria
       FROM producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       WHERE p.id_producto = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;
  if (!nombre || !precio || stock === undefined || !id_categoria) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, precio, stock, id_categoria' });
  }
  try {
    const result = await db.query(
      `INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, descripcion, precio, stock, id_categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria } = req.body;
  try {
    const result = await db.query(
      `UPDATE producto
       SET nombre=$1, descripcion=$2, precio=$3, stock=$4, id_categoria=$5
       WHERE id_producto=$6
       RETURNING *`,
      [nombre, descripcion, precio, stock, id_categoria, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE producto
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM producto WHERE id_producto=$1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;