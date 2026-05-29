-- ============================================
-- TABLA: categoria
-- ============================================
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ============================================
-- TABLA: producto
-- ============================================
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- ============================================
-- TABLA: proveedor
-- ============================================
CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100)
);

-- ============================================
-- TABLA: producto_proveedor (N:M)
-- ============================================
CREATE TABLE producto_proveedor (
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    PRIMARY KEY (id_producto, id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor) ON DELETE CASCADE
);

-- ============================================
-- TABLA: cliente
-- ============================================
CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20)
);

-- ============================================
-- TABLA: empleado
-- ============================================
CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(50)
);

-- ============================================
-- TABLA: venta
-- ============================================
CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- ============================================
-- TABLA: detalle_venta
-- ============================================
CREATE TABLE detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ============================================
-- TABLA: usuario_app 
-- Almacena los usuarios de la aplicación con
-- su rol de negocio.
-- ============================================
CREATE TABLE usuario_app (
    id_usuario   SERIAL PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    rol          VARCHAR(30)  NOT NULL
                 CHECK (rol IN ('admin','gerente','cajero','bodeguero','vendedor')),
    nombre       VARCHAR(100) NOT NULL,
    activo       BOOLEAN      DEFAULT TRUE
);

-- ============================================
-- ÍNDICES (para rendimiento)
-- ============================================
CREATE INDEX idx_producto_categoria  ON producto(id_categoria);
CREATE INDEX idx_venta_cliente       ON venta(id_cliente);
CREATE INDEX idx_venta_empleado      ON venta(id_empleado);
CREATE INDEX idx_detalle_producto    ON detalle_venta(id_producto);
CREATE INDEX idx_usuario_username    ON usuario_app(username);