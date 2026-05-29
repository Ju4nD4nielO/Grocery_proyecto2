// ============================================================
// Middleware de autenticación y autorización por rol
// ============================================================

/**
 * requireAuth — verifica que exista una sesión activa.
 * Si no hay sesión responde 401.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
  }
  next();
}

/**
 * requireRol(...roles) — verifica que el usuario tenga uno
 * de los roles permitidos. Siempre aplica requireAuth primero.
 *
 * Uso: router.get('/ruta', requireRol('admin','gerente'), handler)
 */
function requireRol(...rolesPermitidos) {
  return [
    requireAuth,
    (req, res, next) => {
      const rolUsuario = req.session.usuario.rol;
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          error: `Acceso denegado. Se requiere uno de los roles: ${rolesPermitidos.join(', ')}. Tu rol: ${rolUsuario}`,
        });
      }
      next();
    },
  ];
}

// Atajos por agrupación de roles
const soloAdmin          = requireRol('admin');
const adminOGerente      = requireRol('admin', 'gerente');
const puedeVender        = requireRol('admin', 'gerente', 'cajero', 'vendedor');
const puedeVerProductos  = requireRol('admin', 'gerente', 'cajero', 'bodeguero', 'vendedor');
const puedeEditarStock   = requireRol('admin', 'bodeguero');

module.exports = {
  requireAuth,
  requireRol,
  soloAdmin,
  adminOGerente,
  puedeVender,
  puedeVerProductos,
  puedeEditarStock,
};