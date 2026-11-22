// exercises.js : exercise catalogue   (tables: exercises, muscle_groups)
const router = require('express').Router();
const { query } = require('../db');
const { httpError } = require('../errors');

// READ  GET /api/exercises?category=strength
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const { rows } = await query(
      `SELECT e.exercise_id, e.name, e.category, mg.name AS muscle_group
         FROM exercises e
         JOIN muscle_groups mg ON mg.muscle_group_id = e.muscle_group_id
        WHERE ($1::text IS NULL OR e.category = $1::text)
        ORDER BY mg.name, e.name`, [category ?? null]);
    res.json(rows);
  } catch (e) { next(e); }
});

// CREATE  POST /api/exercises
router.post('/', async (req, res, next) => {
  try {
    const { name, category, muscleGroupId } = req.body;
    if (!name || !category || !muscleGroupId) throw httpError(400, 'name, category and muscleGroupId are required.');
    const { rows } = await query(
      `INSERT INTO exercises (name, category, muscle_group_id) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), category, muscleGroupId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

module.exports = router;
