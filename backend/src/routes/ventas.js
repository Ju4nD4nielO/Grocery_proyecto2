const express  = require('express');
const router   = express.Router();
const { pool } = require('../db');
const { puedeVender, soloAdmin } = require('../middleware/auth');

// POST /ventas — registrar venta via SP (con transacción y ROLLBACK internos)
router.post('/', ...puedeVender, async (req, res) => {
  const { id_cliente, id_empleado, productos } = req.body;

  if (!id_cliente || !id_empleado || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'id_cliente, id_empleado y productos son requeridos' });
  }

  // Construir el JSON que espera el SP
  // productos = [{ id_producto, cantidad }, ...]
  // El SP espera: [{"id": X, "cantidad": Y}, ...]
  const productosJson = JSON.stringify(
    productos.map(p => ({ id: p.id_producto, cantidad: p.cantidad }))
  );

  try {
    // Llamada al stored procedure sp_registrar_venta
    // El SP maneja internamente BEGIN / COMMIT / ROLLBACK
    const result = await pool.query(
      `SELECT * FROM sp_registrar_venta($1, $2, $3::jsonb)`,
      [id_cliente, id_empleado, productosJson]
    );

    const { p_id_venta, p_mensaje } = result.rows[0];

    if (p_id_venta === -1) {
      return res.status(400).json({ error: p_mensaje });
    }

    res.json({ message: p_mensaje, id_venta: p_id_venta });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /ventas/:id — cancelar venta via SP (restaura stock)
// Solo admin puede cancelar ventas
router.delete('/:id', ...soloAdmin, async (req, res) => {
  try {
    // Llamada al stored procedure sp_cancelar_venta
    const result = await pool.query(
      `SELECT * FROM sp_cancelar_venta($1)`,
      [parseInt(req.params.id)]
    );

    const { p_exito, p_mensaje } = result.rows[0];

    if (!p_exito) {
      return res.status(400).json({ error: p_mensaje });
    }

    res.json({ message: p_mensaje });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;