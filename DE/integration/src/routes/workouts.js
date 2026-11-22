// workouts.js : core feature - log, view, edit, delete workouts
// tables: workouts, workout_exercises, exercise_sets (+ exercises for names)
const router = require('express').Router();
const { query, withTransaction } = require('../db');
const { httpError } = require('../errors');

/**
 * CREATE  POST /api/workouts
 * Body: { userId, title, workoutDate, durationMin, notes,
 *         exercises: [ { exerciseId, sets: [ { reps, weightKg, durationSec, distanceKm } ] } ] }
 * Three tables are written inside ONE transaction: all rows are saved, or none.
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, title, workoutDate, durationMin, notes, exercises = [] } = req.body;
    if (!userId || !title || !workoutDate) throw httpError(400, 'userId, title and workoutDate are required.');
    if (!Array.isArray(exercises) || exercises.length === 0) throw httpError(400, 'At least one exercise is required.');

    const workoutId = await withTransaction(async (db) => {
      const w = await db.query(
        `INSERT INTO workouts (user_id, title, workout_date, duration_min, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING workout_id`,
        [userId, title.trim(), workoutDate, durationMin ?? null, notes ?? null]);
      const id = w.rows[0].workout_id;

      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        const we = await db.query(
          `INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order)
           VALUES ($1, $2, $3) RETURNING workout_exercise_id`,
          [id, ex.exerciseId, i + 1]);
        const weId = we.rows[0].workout_exercise_id;

        for (let s = 0; s < (ex.sets || []).length; s++) {
          const st = ex.sets[s];
          await db.query(
            `INSERT INTO exercise_sets (workout_exercise_id, set_number, reps, weight_kg, duration_sec, distance_km)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [weId, s + 1, st.reps ?? null, st.weightKg ?? null, st.durationSec ?? null, st.distanceKm ?? null]);
        }
      }
      return id;
    });
    res.status(201).json({ workoutId });
  } catch (e) { next(e); }
});

// READ (list)  GET /api/workouts?userId=1&from=2026-11-01&to=2026-11-21&limit=20&offset=0
router.get('/', async (req, res, next) => {
  try {
    const { userId, from, to } = req.query;
    if (!userId) throw httpError(400, 'userId is required.');
    const limit  = Math.min(parseInt(req.query.limit, 10)  || 20, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const { rows } = await query(
      `SELECT workout_id, title, workout_date, duration_min, notes
         FROM workouts
        WHERE user_id = $1
          AND ($2::date IS NULL OR workout_date >= $2::date)
          AND ($3::date IS NULL OR workout_date <= $3::date)
        ORDER BY workout_date DESC, workout_id DESC
        LIMIT $4 OFFSET $5`,
      [userId, from ?? null, to ?? null, limit, offset]);
    res.json(rows);
  } catch (e) { next(e); }
});

// READ (one, nested)  GET /api/workouts/:id   -> same 4-table JOIN as Query Q2
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT w.workout_id, w.user_id, w.title, w.workout_date, w.duration_min, w.notes,
              we.workout_exercise_id, we.exercise_order, e.exercise_id, e.name AS exercise, e.category,
              es.set_id, es.set_number, es.reps, es.weight_kg, es.duration_sec, es.distance_km
         FROM workouts w
         LEFT JOIN workout_exercises we ON we.workout_id = w.workout_id
         LEFT JOIN exercises e          ON e.exercise_id = we.exercise_id
         LEFT JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
        WHERE w.workout_id = $1
        ORDER BY we.exercise_order, es.set_number`, [req.params.id]);
    if (!rows.length) throw httpError(404, 'Workout not found.');

    const first = rows[0];
    const workout = { workoutId: first.workout_id, userId: first.user_id, title: first.title,
                      workoutDate: first.workout_date, durationMin: first.duration_min, notes: first.notes, exercises: [] };
    const byId = new Map();
    for (const r of rows) {
      if (!r.workout_exercise_id) continue;
      if (!byId.has(r.workout_exercise_id)) {
        const ex = { exerciseId: r.exercise_id, name: r.exercise, category: r.category, sets: [] };
        byId.set(r.workout_exercise_id, ex);
        workout.exercises.push(ex);
      }
      if (r.set_id) byId.get(r.workout_exercise_id).sets.push({
        setId: r.set_id, setNumber: r.set_number, reps: r.reps, weightKg: r.weight_kg,
        durationSec: r.duration_sec, distanceKm: r.distance_km });
    }
    res.json(workout);
  } catch (e) { next(e); }
});

// UPDATE  PATCH /api/workouts/:id      (only the fields that are sent are changed)
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, workoutDate, durationMin, notes } = req.body;
    const { rows } = await query(
      `UPDATE workouts
          SET title        = COALESCE($2, title),
              workout_date = COALESCE($3, workout_date),
              duration_min = COALESCE($4, duration_min),
              notes        = COALESCE($5, notes)
        WHERE workout_id = $1
        RETURNING workout_id, title, workout_date, duration_min, notes`,
      [req.params.id, title ?? null, workoutDate ?? null, durationMin ?? null, notes ?? null]);
    if (!rows.length) throw httpError(404, 'Workout not found.');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// UPDATE a single set  PATCH /api/workouts/sets/:setId
router.patch('/sets/:setId', async (req, res, next) => {
  try {
    const { reps, weightKg } = req.body;
    const { rows } = await query(
      `UPDATE exercise_sets
          SET reps = COALESCE($2, reps), weight_kg = COALESCE($3, weight_kg)
        WHERE set_id = $1 RETURNING *`, [req.params.setId, reps ?? null, weightKg ?? null]);
    if (!rows.length) throw httpError(404, 'Set not found.');
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// DELETE  DELETE /api/workouts/:id     (children removed by ON DELETE CASCADE)
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM workouts WHERE workout_id = $1', [req.params.id]);
    if (!rowCount) throw httpError(404, 'Workout not found.');
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
