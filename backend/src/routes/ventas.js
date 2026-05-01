const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const { id_cliente, id_empleado, productos } = req.body;
    /*
      productos = [
        { id_producto: 1, cantidad: 2 },
        { id_producto: 3, cantidad: 1 }
      ]
    */

    await client.query('BEGIN');

    // 1. Crear venta
    const ventaResult = await client.query(
      `INSERT INTO venta (id_cliente, id_empleado)
       VALUES ($1, $2)
       RETURNING id_venta`,
      [id_cliente, id_empleado]
    );

    const id_venta = ventaResult.rows[0].id_venta;

    // 2. Procesar cada producto
    for (let item of productos) {
      const { id_producto, cantidad } = item;

      // 2.1 Verificar stock
      const stockResult = await client.query(
        `SELECT stock, precio FROM producto WHERE id_producto = $1`,
        [id_producto]
      );

      if (stockResult.rows.length === 0) {
        throw new Error(`Producto ${id_producto} no existe`);
      }

      const stock = stockResult.rows[0].stock;
      const precio = stockResult.rows[0].precio;

      if (stock < cantidad) {
        throw new Error(`Stock insuficiente para producto ${id_producto}`);
      }

      // 2.2 Insertar detalle
      await client.query(
        `INSERT INTO detalle_venta 
         (id_venta, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
        [id_venta, id_producto, cantidad, precio]
      );

      // 2.3 Actualizar stock
      await client.query(
        `UPDATE producto
         SET stock = stock - $1
         WHERE id_producto = $2`,
        [cantidad, id_producto]
      );
    }

    // 3. Confirmar
    await client.query('COMMIT');

    res.json({
      message: 'Venta realizada correctamente',
      id_venta
    });

  } catch (error) {
    // ❗ MUY IMPORTANTE
    await client.query('ROLLBACK');

    res.status(400).json({
      error: error.message
    });

  } finally {
    client.release();
  }
});

module.exports = router;