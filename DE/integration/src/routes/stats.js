// stats.js : dashboard analytics (aggregate queries Q3, Q4, Q5, Q9, Q10 from sql/03_queries.sql)
const router = require('express').Router();
const { query } = require('../db');

// Volume per workout  (Q3)
router.get('/:userId/volume', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT w.workout_id, w.title, w.workout_date,
              COUNT(es.set_id) AS total_sets, SUM(es.reps * es.weight_kg) AS volume_kg
         FROM workouts w
         JOIN workout_exercises we ON we.workout_id = w.workout_id
         JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
        WHERE w.user_id = $1 AND es.weight_kg IS NOT NULL
        GROUP BY w.workout_id, w.title, w.workout_date
        ORDER BY w.workout_date`, [req.params.userId]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Muscle-group balance  (Q4)
router.get('/:userId/muscle-groups', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT mg.name AS muscle_group, COUNT(*) AS total_sets
         FROM workouts w
         JOIN workout_exercises we ON we.workout_id = w.workout_id
         JOIN exercises e          ON e.exercise_id = we.exercise_id
         JOIN muscle_groups mg     ON mg.muscle_group_id = e.muscle_group_id
         JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
        WHERE w.user_id = $1
        GROUP BY mg.name ORDER BY total_sets DESC`, [req.params.userId]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Personal records  (Q5)
router.get('/:userId/records', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT e.name AS exercise, MAX(es.weight_kg) AS best_weight_kg
         FROM workouts w
         JOIN workout_exercises we ON we.workout_id = w.workout_id
         JOIN exercises e          ON e.exercise_id = we.exercise_id
         JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
        WHERE w.user_id = $1 AND es.weight_kg > 0
        GROUP BY e.name ORDER BY best_weight_kg DESC`, [req.params.userId]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Goal progress  (Q9)
router.get('/:userId/goals', async (req, res, next) => {
  try {
    const { rows } = await query(
      `WITH best AS (
         SELECT w.user_id, we.exercise_id, MAX(es.weight_kg) AS best_weight_kg
           FROM workouts w
           JOIN workout_exercises we ON we.workout_id = w.workout_id
           JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
          WHERE w.user_id = $1
          GROUP BY w.user_id, we.exercise_id)
       SELECT e.name AS exercise, g.target_weight_kg, g.target_date, g.status, b.best_weight_kg,
              ROUND(100.0 * b.best_weight_kg / g.target_weight_kg, 1) AS pct_complete
         FROM goals g
         JOIN exercises e ON e.exercise_id = g.exercise_id
         LEFT JOIN best b ON b.user_id = g.user_id AND b.exercise_id = g.exercise_id
        WHERE g.user_id = $1
        ORDER BY g.target_date`, [req.params.userId]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Log (or correct) body weight - UPSERT uses the UNIQUE(user_id, measured_on) constraint
router.post('/:userId/body-weight', async (req, res, next) => {
  try {
    const { measuredOn, bodyWeightKg } = req.body;
    const { rows } = await query(
      `INSERT INTO body_measurements (user_id, measured_on, body_weight_kg)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, measured_on) DO UPDATE SET body_weight_kg = EXCLUDED.body_weight_kg
       RETURNING *`, [req.params.userId, measuredOn, bodyWeightKg]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

// Body-weight trend  (Q10)
router.get('/:userId/body-weight', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT measured_on, body_weight_kg,
              ROUND(body_weight_kg - LAG(body_weight_kg) OVER (ORDER BY measured_on), 1) AS change_kg
         FROM body_measurements WHERE user_id = $1 ORDER BY measured_on`, [req.params.userId]);
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
