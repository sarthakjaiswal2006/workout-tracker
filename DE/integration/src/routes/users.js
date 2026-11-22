// users.js : register + profile    (tables: users, user_profiles)
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../db');
const { httpError } = require('../errors');

// CREATE  POST /api/users/register
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, heightCm, fitnessLevel } = req.body;
    if (!fullName || !email || !password) throw httpError(400, 'fullName, email and password are required.');
    if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters.');

    const hash = await bcrypt.hash(password, 10);
    const user = await withTransaction(async (db) => {
      const u = await db.query(
        `INSERT INTO users (full_name, email, password_hash)
         VALUES ($1, LOWER($2), $3)
         RETURNING user_id, full_name, email, created_at`,
        [fullName.trim(), email.trim(), hash]);
      await db.query(
        `INSERT INTO user_profiles (user_id, height_cm, fitness_level)
         VALUES ($1, $2, COALESCE($3, 'beginner'))`,
        [u.rows[0].user_id, heightCm ?? null, fitnessLevel ?? null]);
      return u.rows[0];
    });
    res.status(201).json(user);
  } catch (e) { next(e); }   // duplicate e-mail -> 409 via errorHandler
});

// READ  GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.user_id, u.full_name, u.email, p.height_cm, p.fitness_level, p.preferred_unit
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.user_id
       WHERE u.user_id = $1`, [req.params.id]);
    if (!rows.length) throw httpError(404, 'User not found.');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// UPDATE  PATCH /api/users/:id/profile
router.patch('/:id/profile', async (req, res, next) => {
  try {
    const { heightCm, fitnessLevel, preferredUnit } = req.body;
    const { rows } = await query(
      `UPDATE user_profiles
          SET height_cm      = COALESCE($2, height_cm),
              fitness_level  = COALESCE($3, fitness_level),
              preferred_unit = COALESCE($4, preferred_unit)
        WHERE user_id = $1
        RETURNING *`, [req.params.id, heightCm ?? null, fitnessLevel ?? null, preferredUnit ?? null]);
    if (!rows.length) throw httpError(404, 'Profile not found.');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

module.exports = router;
