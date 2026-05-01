const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const result = await db.query(`
    SELECT p.nombre, c.nombre AS categoria, p.precio, p.stock
    FROM producto p
    JOIN categoria c ON p.id_categoria = c.id_categoria
  `);
  res.json(result.rows);
});

module.exports = router;