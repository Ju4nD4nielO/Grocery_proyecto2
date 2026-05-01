const express = require('express');
const router = express.Router();
const db = require('../db');

// JOIN 1: Ventas con cliente, empleado y total 
router.get('/ventas-detalle', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM vista_ventas_detalle ORDER BY fecha DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JOIN 2: Productos vendidos con categoría y proveedor
router.get('/productos-vendidos', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.nombre      AS producto,
        cat.nombre    AS categoria,
        prov.nombre   AS proveedor,
        SUM(dv.cantidad) AS total_vendido,
        SUM(dv.cantidad * dv.precio_unitario) AS ingresos
      FROM detalle_venta dv
      JOIN producto p   ON dv.id_producto  = p.id_producto
      JOIN categoria cat ON p.id_categoria = cat.id_categoria
      JOIN producto_proveedor pp ON pp.id_producto = p.id_producto
      JOIN proveedor prov ON pp.id_proveedor = prov.id_proveedor
      GROUP BY p.nombre, cat.nombre, prov.nombre
      ORDER BY ingresos DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JOIN 3: Clientes con total gastado y número de compras
router.get('/clientes-compras', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        c.id_cliente,
        c.nombre  AS cliente,
        c.email,
        COUNT(DISTINCT v.id_venta)              AS num_compras,
        SUM(dv.cantidad * dv.precio_unitario)   AS total_gastado
      FROM cliente c
      JOIN venta v        ON c.id_cliente  = v.id_cliente
      JOIN detalle_venta dv ON v.id_venta  = dv.id_venta
      GROUP BY c.id_cliente, c.nombre, c.email
      ORDER BY total_gastado DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GROUP BY + HAVING: categorías con ingresos > 100
router.get('/ventas-por-categoria', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        cat.nombre AS categoria,
        COUNT(DISTINCT dv.id_venta) AS num_ventas,
        SUM(dv.cantidad)            AS unidades_vendidas,
        SUM(dv.cantidad * dv.precio_unitario) AS ingresos_total
      FROM detalle_venta dv
      JOIN producto p    ON dv.id_producto  = p.id_producto
      JOIN categoria cat ON p.id_categoria  = cat.id_categoria
      GROUP BY cat.nombre
      HAVING SUM(dv.cantidad * dv.precio_unitario) > 100
      ORDER BY ingresos_total DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SUBQUERY con IN: productos que nunca se han vendido
router.get('/productos-sin-ventas', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id_producto, p.nombre, p.stock, c.nombre AS categoria
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto NOT IN (
        SELECT DISTINCT id_producto FROM detalle_venta
      )
      ORDER BY p.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//SUBQUERY con EXISTS: clientes que han comprado más de una vez
router.get('/clientes-frecuentes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id_cliente, c.nombre, c.email, c.telefono
      FROM cliente c
      WHERE EXISTS (
        SELECT 1
        FROM venta v
        WHERE v.id_cliente = c.id_cliente
        GROUP BY v.id_cliente
        HAVING COUNT(*) > 1
      )
      ORDER BY c.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CTE: ranking de empleados por monto de ventas atendidas
router.get('/ranking-empleados', async (req, res) => {
  try {
    const result = await db.query(`
      WITH ventas_empleado AS (
        SELECT
          e.id_empleado,
          e.nombre   AS empleado,
          e.puesto,
          COUNT(DISTINCT v.id_venta)            AS ventas_atendidas,
          SUM(dv.cantidad * dv.precio_unitario) AS monto_total
        FROM empleado e
        JOIN venta v          ON e.id_empleado  = v.id_empleado
        JOIN detalle_venta dv ON v.id_venta      = dv.id_venta
        GROUP BY e.id_empleado, e.nombre, e.puesto
      )
      SELECT
        ROW_NUMBER() OVER (ORDER BY monto_total DESC) AS ranking,
        empleado,
        puesto,
        ventas_atendidas,
        monto_total
      FROM ventas_empleado
      ORDER BY ranking
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stock bajo (subquery correlacionado): productos con stock < promedio de su categoría
router.get('/stock-bajo', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.nombre, p.stock, c.nombre AS categoria,
             (SELECT AVG(p2.stock) FROM producto p2
              WHERE p2.id_categoria = p.id_categoria) AS promedio_categoria
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.stock < (
        SELECT AVG(p2.stock)
        FROM producto p2
        WHERE p2.id_categoria = p.id_categoria
      )
      ORDER BY p.stock ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;