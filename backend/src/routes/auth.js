const express  = require('express');
const bcrypt   = require('bcryptjs');
const router   = express.Router();
const { prisma } = require('../db');
const { requireAuth } = require('../middleware/auth');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // ORM — Prisma (CRUD: READ)
    const usuario = await prisma.usuarioApp.findUnique({
      where: { username },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Guardar datos en sesión (sin el hash)
    req.session.usuario = {
      id:     usuario.id_usuario,
      username: usuario.username,
      nombre: usuario.nombre,
      rol:    usuario.rol,
    };

    res.json({
      message:  'Login exitoso',
      usuario:  req.session.usuario,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada' });
  });
});

// GET /auth/me — devuelve el usuario de la sesión actual
router.get('/me', requireAuth, (req, res) => {
  res.json({ usuario: req.session.usuario });
});

module.exports = router;