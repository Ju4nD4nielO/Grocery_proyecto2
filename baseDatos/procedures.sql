-- ============================================================
-- STORED PROCEDURES — Proyecto 3
--
-- SP 1: sp_registrar_venta         → transacción + ROLLBACK
-- SP 2: sp_cancelar_venta          → OUT param + excepción
-- SP 3: sp_crear_producto          → IN params + validación
-- SP 4: sp_actualizar_stock        → IN/OUT + excepción
-- SP 5: sp_reporte_top_productos   → lectura / reporte
-- SP 6: sp_crear_cliente           → IN params + validación
-- ============================================================

-- ============================================================
-- SP 1: sp_registrar_venta
-- Registra una venta completa con sus detalles.
-- Maneja la transacción, verifica stock y hace ROLLBACK
-- si cualquier producto no tiene stock suficiente.
--
-- Parámetros IN:
--   p_id_cliente   → id del cliente
--   p_id_empleado  → id del empleado que atiende
--   p_productos    → JSON array: [{"id":1,"cantidad":2}, ...]
-- Parámetro OUT:
--   p_id_venta     → id de la venta creada (-1 si falló)
--   p_mensaje      → mensaje de éxito o error
-- ============================================================
CREATE OR REPLACE FUNCTION sp_registrar_venta(
    p_id_cliente  INT,
    p_id_empleado INT,
    p_productos   JSONB,
    OUT p_id_venta INT,
    OUT p_mensaje  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item        JSONB;
    v_id_producto INT;
    v_cantidad    INT;
    v_precio      DECIMAL(10,2);
    v_stock       INT;
BEGIN
    -- Iniciar transacción explícita
    BEGIN
        -- Validar que cliente y empleado existan
        IF NOT EXISTS (SELECT 1 FROM cliente  WHERE id_cliente  = p_id_cliente)  THEN
            RAISE EXCEPTION 'Cliente con id % no existe', p_id_cliente;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM empleado WHERE id_empleado = p_id_empleado) THEN
            RAISE EXCEPTION 'Empleado con id % no existe', p_id_empleado;
        END IF;

        -- Crear cabecera de venta
        INSERT INTO venta (id_cliente, id_empleado)
        VALUES (p_id_cliente, p_id_empleado)
        RETURNING id_venta INTO p_id_venta;

        -- Procesar cada producto del array JSON
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
        LOOP
            v_id_producto := (v_item->>'id')::INT;
            v_cantidad    := (v_item->>'cantidad')::INT;

            -- Validar que el producto exista y obtener precio/stock
            SELECT precio, stock
            INTO v_precio, v_stock
            FROM producto
            WHERE id_producto = v_id_producto
            FOR UPDATE;  -- bloqueo para evitar condición de carrera

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Producto con id % no existe', v_id_producto;
            END IF;

            -- Verificar stock suficiente
            IF v_stock < v_cantidad THEN
                RAISE EXCEPTION 'Stock insuficiente para producto %. Disponible: %, solicitado: %',
                    v_id_producto, v_stock, v_cantidad;
            END IF;

            -- Insertar detalle
            INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
            VALUES (p_id_venta, v_id_producto, v_cantidad, v_precio);

            -- Descontar stock
            UPDATE producto
            SET stock = stock - v_cantidad
            WHERE id_producto = v_id_producto;
        END LOOP;

        p_mensaje := 'Venta registrada correctamente con id ' || p_id_venta;

    -- Si algo falla, ROLLBACK automático del bloque y retorna -1
    EXCEPTION
        WHEN OTHERS THEN
            p_id_venta := -1;
            p_mensaje  := SQLERRM;
            RAISE;  -- re-lanza para que el cliente vea el error
    END;
END;
$$;

-- ============================================================
-- SP 2: sp_cancelar_venta
-- Cancela una venta existente: devuelve el stock y elimina
-- los registros. Tiene parámetro OUT y manejo de excepciones.
--
-- Parámetros IN:
--   p_id_venta   → id de la venta a cancelar
-- Parámetros OUT:
--   p_exito      → TRUE si se canceló, FALSE si falló
--   p_mensaje    → descripción del resultado
-- ============================================================
CREATE OR REPLACE FUNCTION sp_cancelar_venta(
    p_id_venta  INT,
    OUT p_exito   BOOLEAN,
    OUT p_mensaje TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_row detalle_venta%ROWTYPE;
BEGIN
    BEGIN
        -- Verificar que la venta exista
        IF NOT EXISTS (SELECT 1 FROM venta WHERE id_venta = p_id_venta) THEN
            RAISE EXCEPTION 'La venta con id % no existe', p_id_venta;
        END IF;

        -- Restaurar stock de cada producto del detalle
        FOR v_row IN
            SELECT * FROM detalle_venta WHERE id_venta = p_id_venta
        LOOP
            UPDATE producto
            SET stock = stock + v_row.cantidad
            WHERE id_producto = v_row.id_producto;
        END LOOP;

        -- Eliminar detalle y cabecera (CASCADE lo maneja, pero lo explicitamos)
        DELETE FROM detalle_venta WHERE id_venta = p_id_venta;
        DELETE FROM venta         WHERE id_venta = p_id_venta;

        p_exito   := TRUE;
        p_mensaje := 'Venta ' || p_id_venta || ' cancelada y stock restaurado correctamente';

    EXCEPTION
        WHEN OTHERS THEN
            -- ROLLBACK implícito del bloque BEGIN/EXCEPTION
            p_exito   := FALSE;
            p_mensaje := 'Error al cancelar venta: ' || SQLERRM;
            RAISE;
    END;
END;
$$;

-- ============================================================
-- SP 3: sp_crear_producto
-- Inserta un nuevo producto con validaciones de negocio.
-- Lanza excepción si la categoría no existe o precio <= 0.
--
-- Parámetros IN:
--   p_nombre, p_descripcion, p_precio, p_stock, p_id_categoria
-- Parámetro OUT:
--   p_id_producto → id generado (-1 si falló)
--   p_mensaje     → resultado
-- ============================================================
CREATE OR REPLACE FUNCTION sp_crear_producto(
    p_nombre       VARCHAR(100),
    p_descripcion  TEXT,
    p_precio       DECIMAL(10,2),
    p_stock        INT,
    p_id_categoria INT,
    OUT p_id_producto INT,
    OUT p_mensaje     TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    BEGIN
        -- Validaciones de negocio
        IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
            RAISE EXCEPTION 'El nombre del producto no puede estar vacío';
        END IF;
        IF p_precio < 0 THEN
            RAISE EXCEPTION 'El precio no puede ser negativo';
        END IF;
        IF p_stock < 0 THEN
            RAISE EXCEPTION 'El stock no puede ser negativo';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM categoria WHERE id_categoria = p_id_categoria) THEN
            RAISE EXCEPTION 'La categoría con id % no existe', p_id_categoria;
        END IF;

        INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria)
        VALUES (TRIM(p_nombre), p_descripcion, p_precio, p_stock, p_id_categoria)
        RETURNING id_producto INTO p_id_producto;

        p_mensaje := 'Producto creado con id ' || p_id_producto;

    EXCEPTION
        WHEN OTHERS THEN
            p_id_producto := -1;
            p_mensaje     := SQLERRM;
            RAISE;
    END;
END;
$$;

-- ============================================================
-- SP 4: sp_actualizar_stock
-- Ajusta el stock de un producto (puede ser positivo o negativo).
-- Parámetro IN/OUT: p_stock_nuevo devuelve el stock resultante.
--
-- Parámetros IN:
--   p_id_producto → producto a ajustar
--   p_cantidad    → cantidad a sumar (negativo para restar)
-- Parámetro IN/OUT:
--   p_stock_nuevo → stock resultante después del ajuste
-- Parámetro OUT:
--   p_mensaje     → resultado
-- ============================================================
CREATE OR REPLACE FUNCTION sp_actualizar_stock(
    p_id_producto INT,
    p_cantidad    INT,
    INOUT p_stock_nuevo INT,
    OUT   p_mensaje     TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INT;
BEGIN
    BEGIN
        -- Verificar que el producto exista
        SELECT stock INTO v_stock_actual
        FROM producto
        WHERE id_producto = p_id_producto
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto con id % no existe', p_id_producto;
        END IF;

        -- Verificar que el resultado no sea negativo
        IF v_stock_actual + p_cantidad < 0 THEN
            RAISE EXCEPTION 'Stock insuficiente. Actual: %, ajuste solicitado: %',
                v_stock_actual, p_cantidad;
        END IF;

        UPDATE producto
        SET stock = stock + p_cantidad
        WHERE id_producto = p_id_producto
        RETURNING stock INTO p_stock_nuevo;

        p_mensaje := 'Stock actualizado. Anterior: ' || v_stock_actual || ', Nuevo: ' || p_stock_nuevo;

    EXCEPTION
        WHEN OTHERS THEN
            p_stock_nuevo := -1;
            p_mensaje     := 'Error al actualizar stock: ' || SQLERRM;
            RAISE;
    END;
END;
$$;

-- ============================================================
-- SP 5: sp_reporte_top_productos
-- Devuelve los N productos más vendidos por ingresos.
-- Es un SP de reporte puro (solo lectura).
--
-- Parámetro IN:
--   p_limite → cuántos productos retornar (default 10)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_reporte_top_productos(p_limite INT DEFAULT 10)
RETURNS TABLE (
    producto       TEXT,
    categoria      TEXT,
    unidades       BIGINT,
    ingresos_total NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.nombre::TEXT,
        c.nombre::TEXT,
        SUM(dv.cantidad)::BIGINT,
        SUM(dv.cantidad * dv.precio_unitario)
    FROM detalle_venta dv
    JOIN producto  p ON dv.id_producto  = p.id_producto
    JOIN categoria c ON p.id_categoria  = c.id_categoria
    GROUP BY p.nombre, c.nombre
    ORDER BY SUM(dv.cantidad * dv.precio_unitario) DESC
    LIMIT p_limite;
END;
$$;

-- ============================================================
-- SP 6: sp_crear_cliente
-- Inserta un cliente con validación de email único.
--
-- Parámetros IN:
--   p_nombre, p_email, p_telefono
-- Parámetros OUT:
--   p_id_cliente → id generado (-1 si falló)
--   p_mensaje    → resultado
-- ============================================================
CREATE OR REPLACE FUNCTION sp_crear_cliente(
    p_nombre   VARCHAR(100),
    p_email    VARCHAR(100),
    p_telefono VARCHAR(20),
    OUT p_id_cliente INT,
    OUT p_mensaje    TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    BEGIN
        IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
            RAISE EXCEPTION 'El nombre del cliente no puede estar vacío';
        END IF;

        -- Validar email único si se proporciona
        IF p_email IS NOT NULL AND TRIM(p_email) != '' THEN
            IF EXISTS (SELECT 1 FROM cliente WHERE email = TRIM(p_email)) THEN
                RAISE EXCEPTION 'Ya existe un cliente con el email %', p_email;
            END IF;
        END IF;

        INSERT INTO cliente (nombre, email, telefono)
        VALUES (TRIM(p_nombre), NULLIF(TRIM(p_email),''), NULLIF(TRIM(p_telefono),''))
        RETURNING id_cliente INTO p_id_cliente;

        p_mensaje := 'Cliente creado con id ' || p_id_cliente;

    EXCEPTION
        WHEN OTHERS THEN
            p_id_cliente := -1;
            p_mensaje    := SQLERRM;
            RAISE;
    END;
END;
$$;