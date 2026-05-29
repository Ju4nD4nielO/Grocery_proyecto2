-- ============================================================
-- ROLES DE BASE DE DATOS — Proyecto 3
-- Se crean con CREATE ROLE y se asignan permisos granulares
-- por tabla y operación mediante GRANT / REVOKE.
--
-- Los 5 roles y sus responsabilidades:
--
--  rol_admin      → acceso total (administrador del sistema)
--  rol_gerente    → reportes, empleados, proveedores, lectura general
--  rol_cajero     → crear ventas, consultar productos y clientes
--  rol_bodeguero  → gestionar stock de productos
--  rol_vendedor   → consultar productos/clientes, crear ventas
-- ============================================================

-- ── Crear roles (IF NOT EXISTS evita error en reinicios) ────
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_admin')     THEN CREATE ROLE rol_admin;     END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_gerente')   THEN CREATE ROLE rol_gerente;   END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_cajero')    THEN CREATE ROLE rol_cajero;    END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_bodeguero') THEN CREATE ROLE rol_bodeguero; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rol_vendedor')  THEN CREATE ROLE rol_vendedor;  END IF;
END
$$;

-- ============================================================
-- ROL: rol_admin
-- Acceso completo a todas las tablas del negocio
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON categoria        TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON producto         TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON proveedor        TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON producto_proveedor TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON cliente          TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON empleado         TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON venta            TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON detalle_venta    TO rol_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON usuario_app      TO rol_admin;
-- Secuencias (para SERIAL / RETURNING)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public   TO rol_admin;

-- ============================================================
-- ROL: rol_gerente
-- Lectura general + gestión de empleados y proveedores
-- Sin acceso a crear/eliminar usuarios
-- ============================================================
GRANT SELECT ON categoria         TO rol_gerente;
GRANT SELECT ON producto          TO rol_gerente;
GRANT SELECT ON proveedor         TO rol_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON proveedor TO rol_gerente;
GRANT SELECT ON producto_proveedor TO rol_gerente;
GRANT SELECT ON cliente           TO rol_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON empleado  TO rol_gerente;
GRANT SELECT ON venta             TO rol_gerente;
GRANT SELECT ON detalle_venta     TO rol_gerente;
GRANT SELECT ON usuario_app       TO rol_gerente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_gerente;

-- ============================================================
-- ROL: rol_cajero
-- Crear y consultar ventas; ver productos y clientes
-- No puede modificar inventario ni empleados
-- ============================================================
GRANT SELECT ON categoria         TO rol_cajero;
GRANT SELECT ON producto          TO rol_cajero;
GRANT SELECT ON cliente           TO rol_cajero;
GRANT SELECT ON empleado          TO rol_cajero;
GRANT SELECT, INSERT ON venta     TO rol_cajero;
GRANT SELECT, INSERT ON detalle_venta TO rol_cajero;
-- Necesita leer/actualizar stock al registrar venta (via SP)
GRANT UPDATE (stock) ON producto  TO rol_cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_cajero;

-- REVOKE explícito: cajero NO puede tocar proveedores ni usuarios
REVOKE INSERT, UPDATE, DELETE ON proveedor    FROM rol_cajero;
REVOKE ALL                    ON usuario_app  FROM rol_cajero;

-- ============================================================
-- ROL: rol_bodeguero
-- Ver y actualizar stock; lectura de productos y categorías
-- No puede crear ventas ni ver información financiera
-- ============================================================
GRANT SELECT ON categoria         TO rol_bodeguero;
GRANT SELECT, UPDATE ON producto  TO rol_bodeguero;
GRANT SELECT ON proveedor         TO rol_bodeguero;
GRANT SELECT ON producto_proveedor TO rol_bodeguero;
-- REVOKE explícito: bodeguero NO puede ver ventas ni clientes
REVOKE ALL ON venta           FROM rol_bodeguero;
REVOKE ALL ON detalle_venta   FROM rol_bodeguero;
REVOKE ALL ON cliente         FROM rol_bodeguero;
REVOKE ALL ON usuario_app     FROM rol_bodeguero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_bodeguero;

-- ============================================================
-- ROL: rol_vendedor
-- Consultar productos y clientes; registrar ventas
-- No puede modificar inventario directamente ni ver usuarios
-- ============================================================
GRANT SELECT ON categoria         TO rol_vendedor;
GRANT SELECT ON producto          TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON cliente TO rol_vendedor;
GRANT SELECT ON empleado          TO rol_vendedor;
GRANT SELECT, INSERT ON venta     TO rol_vendedor;
GRANT SELECT, INSERT ON detalle_venta TO rol_vendedor;
GRANT UPDATE (stock) ON producto  TO rol_vendedor;
-- REVOKE explícito: vendedor NO puede eliminar ni ver usuarios
REVOKE DELETE ON cliente      FROM rol_vendedor;
REVOKE ALL    ON usuario_app  FROM rol_vendedor;
REVOKE ALL    ON proveedor    FROM rol_vendedor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor;

-- ============================================================
-- Asignar el usuario proy3 (conexión principal del backend)
-- a rol_admin para que pueda operar todas las tablas y
-- ejecutar los stored procedures en nombre de cualquier rol.
-- El control de acceso fino se hace en la capa de aplicación.
-- ============================================================
GRANT rol_admin     TO proy3;
GRANT rol_gerente   TO proy3;
GRANT rol_cajero    TO proy3;
GRANT rol_bodeguero TO proy3;
GRANT rol_vendedor  TO proy3;