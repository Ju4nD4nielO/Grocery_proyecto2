const { PrismaClient } = require('@prisma/client');
const { Pool }         = require('pg');

// ── Prisma (ORM) — usado en operaciones CRUD ──────────────
const prisma = new PrismaClient();

// ── Pool pg — usado exclusivamente para llamar SPs ────────
const pool = new Pool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT || '5432'),
});

module.exports = { prisma, pool };