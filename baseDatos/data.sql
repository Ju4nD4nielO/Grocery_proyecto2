-- ============================================
-- DATA: categoria (10 registros)
-- ============================================
INSERT INTO categoria (nombre, descripcion) VALUES
('Lácteos',        'Leche, quesos, yogures y derivados'),
('Carnes',         'Res, pollo, cerdo y embutidos'),
('Frutas',         'Frutas frescas de temporada'),
('Verduras',       'Vegetales frescos y orgánicos'),
('Panadería',      'Pan, pasteles y repostería'),
('Bebidas',        'Jugos, refrescos, agua y licores'),
('Limpieza',       'Productos de aseo del hogar'),
('Snacks',         'Papas, galletas y dulces'),
('Congelados',     'Alimentos congelados y helados'),
('Granos',         'Arroz, frijoles, lentejas y cereales');

-- ============================================
-- DATA: proveedor (25 registros)
-- ============================================
INSERT INTO proveedor (nombre, telefono, email) VALUES
('Lácteos El Campo',        '2345-1001', 'ventas@lacteoselcampo.com'),
('Carnes Premium GT',       '2345-1002', 'pedidos@carnespremium.com'),
('Finca Verde',             '2345-1003', 'info@fincaverde.com.gt'),
('Distribuidora Norte',     '2345-1004', 'norte@distribuidora.com'),
('Panadería San José',      '2345-1005', 'pan@sanjose.com.gt'),
('Bebidas Tropicales',      '2345-1006', 'ventas@bebidastrop.com'),
('Limpieza Total',          '2345-1007', 'pedidos@limpiezatotal.com'),
('Snacks del Valle',        '2345-1008', 'snacks@delvalle.com'),
('Congelados Express',      '2345-1009', 'express@congelados.com'),
('Granos de Guatemala',     '2345-1010', 'granos@guate.com'),
('Agro Santa Rosa',         '2345-1011', 'agro@santarosa.com'),
('Importadora Central',     '2345-1012', 'import@central.com'),
('Distribuidora Sur',       '2345-1013', 'sur@distribuidora.com'),
('Alimentos Frescos',       '2345-1014', 'frescos@alimentos.com'),
('Orgánicos GT',            '2345-1015', 'organicos@gt.com'),
('Carnes El Rancho',        '2345-1016', 'rancho@carnes.com'),
('Frutas Selectas',         '2345-1017', 'selectas@frutas.com'),
('Lácteos Alta Verapaz',    '2345-1018', 'av@lacteos.com'),
('Bebidas del Sur',         '2345-1019', 'sur@bebidas.com'),
('Pan Fresco Diario',       '2345-1020', 'diario@panfresco.com'),
('Aseo y Hogar',            '2345-1021', 'aseo@hogar.com'),
('Dulces Chapines',         '2345-1022', 'dulces@chapines.com'),
('Helados del Norte',       '2345-1023', 'norte@helados.com'),
('Cereales GT',             '2345-1024', 'cereales@gt.com'),
('Verduras Orgánicas',      '2345-1025', 'organicas@verduras.com');

-- ============================================
-- DATA: producto (30 registros)
-- ============================================
INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria) VALUES
('Leche entera 1L',       'Leche pasteurizada entera',          12.50, 150, 1),
('Queso fresco 500g',     'Queso fresco artesanal',             25.00,  80, 1),
('Yogur natural 250g',    'Yogur sin azúcar',                   10.00, 100, 1),
('Pechuga de pollo 1lb',  'Pollo fresco sin hueso',             28.00,  60, 2),
('Carne molida 1lb',      'Carne de res molida',                35.00,  50, 2),
('Chorizo 250g',          'Chorizo estilo guatemalteco',        18.00,  70, 2),
('Manzana roja (lb)',     'Manzana importada roja',              8.00, 200, 3),
('Banano (lb)',           'Banano criollo maduro',               3.50, 300, 3),
('Sandía (unidad)',       'Sandía grande aprox 5kg',            35.00,  25, 3),
('Tomate (lb)',           'Tomate manzano fresco',               5.00, 250, 4),
('Chile pimiento (lb)',   'Chile pimiento verde',                7.50, 120, 4),
('Zanahoria (lb)',        'Zanahoria fresca limpia',             4.00, 180, 4),
('Pan francés (unidad)',  'Pan francés recién horneado',         1.50, 400, 5),
('Baguette (unidad)',     'Baguette artesanal',                  8.00,  60, 5),
('Pastel de chocolate',  'Pastel entero 8 porciones',           85.00,  15, 5),
('Agua pura 500ml',       'Agua purificada en botella',          3.00, 500, 6),
('Coca-Cola 355ml',       'Refresco de cola',                    7.00, 300, 6),
('Jugo de naranja 1L',    'Jugo natural de naranja',            18.00,  80, 6),
('Detergente líq. 1L',   'Detergente para ropa',               32.00,  90, 7),
('Cloro 1L',              'Blanqueador multiusos',              12.00, 120, 7),
('Jabón de trastes 500ml','Lavavajillas biodegradable',         15.00, 100, 7),
('Papas fritas 150g',     'Papas sabor original',               10.00, 200, 8),
('Galletas surtidas 200g','Galletas de mantequilla',            12.50, 150, 8),
('Chocolate en barra 45g','Chocolate con leche',                 8.00, 250, 8),
('Helado vainilla 1L',    'Helado cremoso de vainilla',         35.00,  40, 9),
('Pizza congelada',       'Pizza de queso y jamón',             45.00,  30, 9),
('Arroz blanco 1lb',      'Arroz blanco de grano largo',         6.50, 400, 10),
('Frijoles negros 1lb',   'Frijoles negros secos',               7.00, 350, 10),
('Lentejas 500g',         'Lentejas verdes importadas',         14.00, 150, 10),
('Avena 500g',            'Avena en hojuelas',                  16.00, 120, 10);

-- ============================================
-- DATA: producto_proveedor
-- ============================================
INSERT INTO producto_proveedor (id_producto, id_proveedor) VALUES
(1,1),(2,1),(3,1),(3,18),
(4,2),(5,2),(6,16),
(7,17),(8,3),(9,3),(9,17),
(10,25),(11,4),(12,25),
(13,5),(14,5),(15,20),
(16,6),(17,6),(18,19),
(19,7),(20,7),(21,21),
(22,8),(23,8),(24,22),
(25,9),(26,9),
(27,10),(28,10),(29,24),(30,24);

-- ============================================
-- DATA: cliente (25 registros)
-- ============================================
INSERT INTO cliente (nombre, email, telefono) VALUES
('Ana García',        'ana.garcia@email.com',      '5501-1001'),
('Carlos López',      'carlos.lopez@email.com',    '5501-1002'),
('María Rodríguez',   'maria.rod@email.com',       '5501-1003'),
('José Martínez',     'jose.mart@email.com',       '5501-1004'),
('Laura Pérez',       'laura.perez@email.com',     '5501-1005'),
('Diego Herrera',     'diego.herr@email.com',      '5501-1006'),
('Sofía Torres',      'sofia.torres@email.com',    '5501-1007'),
('Andrés Morales',    'andres.mor@email.com',      '5501-1008'),
('Isabella Cruz',     'isabella.cr@email.com',     '5501-1009'),
('Miguel Flores',     'miguel.fl@email.com',       '5501-1010'),
('Valentina Ruiz',    'val.ruiz@email.com',        '5501-1011'),
('Sebastián Díaz',    'seb.diaz@email.com',        '5501-1012'),
('Camila Vásquez',    'cam.vasq@email.com',        '5501-1013'),
('Mateo Jiménez',     'mateo.jim@email.com',       '5501-1014'),
('Daniela Reyes',     'dan.reyes@email.com',       '5501-1015'),
('Emilio Castillo',   'emilio.cas@email.com',      '5501-1016'),
('Fernanda Mendoza',  'fer.mendoza@email.com',     '5501-1017'),
('Ricardo Aguilar',   'ric.aguilar@email.com',     '5501-1018'),
('Paola Romero',      'paola.rom@email.com',       '5501-1019'),
('Alejandro Soto',    'alej.soto@email.com',       '5501-1020'),
('Natalia Vargas',    'nat.vargas@email.com',      '5501-1021'),
('Hugo Espinoza',     'hugo.esp@email.com',        '5501-1022'),
('Lucía Fuentes',     'lucia.fue@email.com',       '5501-1023'),
('Gabriel Navarro',   'gab.nav@email.com',         '5501-1024'),
('Mariana Sandoval',  'mar.sandoval@email.com',    '5501-1025');

-- ============================================
-- DATA: empleado (25 registros)
-- ============================================
INSERT INTO empleado (nombre, puesto) VALUES
('Roberto Ajú',       'Cajero'),
('Elena Cuc',         'Vendedor'),
('Pedro Ixcot',       'Cajero'),
('Rosa Tzoc',         'Gerente'),
('Juan Caal',         'Vendedor'),
('Miriam Batz',       'Cajero'),
('Oscar Choc',        'Bodeguero'),
('Silvia Pop',        'Vendedor'),
('Héctor Xol',        'Cajero'),
('Alma Maquin',       'Vendedor'),
('Tomás Chub',        'Bodeguero'),
('Irma Tzib',         'Cajero'),
('Ernesto Coy',       'Vendedor'),
('Dolores Ich',       'Cajero'),
('Marcos Yat',        'Gerente'),
('Verónica Caal',     'Vendedor'),
('Fidel Choc',        'Bodeguero'),
('Luisa Xuc',         'Cajero'),
('Ramón Bux',         'Vendedor'),
('Gloria Tzi',        'Cajero'),
('Abelardo Mó',       'Bodeguero'),
('Carmen Cucul',      'Vendedor'),
('Wilber Saquic',     'Cajero'),
('Delia Tzul',        'Vendedor'),
('Norberto Caal',     'Gerente');

-- ============================================
-- DATA: venta (30 registros)
-- ============================================
INSERT INTO venta (fecha, id_cliente, id_empleado) VALUES
('2026-01-05 09:10:00',  1,  1),
('2026-01-06 10:20:00',  2,  2),
('2026-01-07 11:00:00',  3,  3),
('2026-01-08 08:30:00',  4,  1),
('2026-01-09 14:15:00',  5,  2),
('2026-01-10 09:45:00',  6,  4),
('2026-01-11 13:00:00',  7,  3),
('2026-01-12 10:30:00',  8,  5),
('2026-01-13 16:00:00',  9,  6),
('2026-01-14 11:20:00', 10,  1),
('2026-01-15 09:00:00', 11,  2),
('2026-01-16 12:40:00', 12,  7),
('2026-01-17 10:10:00', 13,  3),
('2026-01-18 15:30:00', 14,  8),
('2026-01-19 08:50:00', 15,  4),
('2026-01-20 14:00:00', 16,  9),
('2026-01-21 11:45:00', 17,  5),
('2026-01-22 13:20:00', 18,  1),
('2026-01-23 10:05:00', 19,  2),
('2026-01-24 09:30:00', 20,  6),
('2026-01-25 16:15:00', 21,  3),
('2026-01-26 12:00:00', 22,  7),
('2026-01-27 11:10:00', 23,  8),
('2026-01-28 14:50:00', 24,  4),
('2026-01-29 10:40:00', 25,  9),
('2026-02-01 09:20:00',  1,  2),
('2026-02-03 13:10:00',  3,  5),
('2026-02-05 15:00:00',  5,  1),
('2026-02-07 10:30:00',  7,  3),
('2026-02-10 11:00:00',  9,  6);

-- ============================================
-- DATA: detalle_venta (40 registros)
-- ============================================
INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES
(1,  1,  2, 12.50),
(1,  7,  3,  8.00),
(2,  4,  2, 28.00),
(2, 16,  4,  3.00),
(3,  2,  1, 25.00),
(3, 13,  5,  1.50),
(4, 10,  2,  5.00),
(4, 22,  1, 10.00),
(5,  5,  1, 35.00),
(5, 27,  2,  6.50),
(6,  8,  4,  3.50),
(6, 17,  2,  7.00),
(7,  3,  2, 10.00),
(7, 23,  3, 12.50),
(8,  6,  2, 18.00),
(8, 20,  1, 12.00),
(9, 15,  1, 85.00),
(9, 25,  2, 35.00),
(10, 11, 2,  7.50),
(10, 28, 3,  7.00),
(11,  1, 3, 12.50),
(11, 19, 1, 32.00),
(12,  9, 1, 35.00),
(12, 16, 6,  3.00),
(13,  4, 3, 28.00),
(13, 12, 2,  4.00),
(14, 26, 2, 45.00),
(14, 18, 1, 18.00),
(15, 30, 2, 16.00),
(15, 24, 3,  8.00),
(16,  5, 2, 35.00),
(16, 10, 4,  5.00),
(17,  2, 2, 25.00),
(17, 13, 8,  1.50),
(18, 29, 1, 14.00),
(18, 22, 2, 10.00),
(19,  7, 5,  8.00),
(19, 17, 3,  7.00),
(20,  3, 4, 10.00),
(20, 21, 2, 15.00);

-- ============================================
-- VISTAS
-- ============================================

-- Vista: resumen de ventas con cliente y empleado
CREATE OR REPLACE VIEW vista_ventas_detalle AS
SELECT
    v.id_venta,
    v.fecha,
    c.nombre  AS cliente,
    e.nombre  AS empleado,
    e.puesto,
    SUM(dv.cantidad * dv.precio_unitario) AS total
FROM venta v
JOIN cliente  c  ON v.id_cliente  = c.id_cliente
JOIN empleado e  ON v.id_empleado = e.id_empleado
JOIN detalle_venta dv ON v.id_venta = dv.id_venta
GROUP BY v.id_venta, v.fecha, c.nombre, e.nombre, e.puesto;

-- Vista: productos con categoría y stock
CREATE OR REPLACE VIEW vista_productos_completo AS
SELECT
    p.id_producto,
    p.nombre,
    p.precio,
    p.stock,
    c.nombre AS categoria
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria;