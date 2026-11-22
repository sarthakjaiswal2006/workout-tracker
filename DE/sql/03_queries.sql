-- =====================================================================
-- 03_queries.sql : 13 project-specific queries / operations
-- Run AFTER 01_schema.sql and 02_seed.sql.   psql -d workout_tracker -f 03_queries.sql
-- Q1-Q9 are read-only. Q10-Q13 modify data (INSERT / UPDATE / DELETE).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Q1: Recent workouts of a user (filter + sort)
-- Business need: The 'History' screen lists a user's workouts from the last three weeks, newest first.
-- ---------------------------------------------------------------------
SELECT workout_id, title, workout_date, duration_min
FROM workouts
WHERE user_id = 1
  AND workout_date BETWEEN '2026-11-01' AND '2026-11-21'
ORDER BY workout_date DESC;


-- ---------------------------------------------------------------------
-- Q2: Full detail of one workout (4-table JOIN)
-- Business need: The 'Workout Detail' screen shows every exercise and set of a workout.
-- ---------------------------------------------------------------------
SELECT w.title, w.workout_date, we.exercise_order, e.name AS exercise,
       es.set_number, es.reps, es.weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.workout_id = 8
ORDER BY we.exercise_order, es.set_number;


-- ---------------------------------------------------------------------
-- Q3: Training volume per workout (aggregate)
-- Business need: The dashboard chart shows total volume lifted (reps × weight) and number of sets per workout.
-- ---------------------------------------------------------------------
SELECT w.workout_id, w.title, w.workout_date,
       COUNT(es.set_id)              AS total_sets,
       SUM(es.reps * es.weight_kg)   AS volume_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.user_id = 1
  AND es.weight_kg IS NOT NULL
GROUP BY w.workout_id, w.title, w.workout_date
ORDER BY volume_kg DESC;


-- ---------------------------------------------------------------------
-- Q4: Muscle groups trained at least 9 sets (GROUP BY + HAVING)
-- Business need: The 'Muscle Balance' card highlights which muscle groups a user trains most.
-- ---------------------------------------------------------------------
SELECT mg.name AS muscle_group, COUNT(*) AS total_sets
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN muscle_groups mg     ON mg.muscle_group_id = e.muscle_group_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.user_id = 1
GROUP BY mg.name
HAVING COUNT(*) >= 9
ORDER BY total_sets DESC;


-- ---------------------------------------------------------------------
-- Q5: Personal records per exercise (MAX)
-- Business need: The 'Personal Records' page lists the heaviest weight lifted per exercise.
-- ---------------------------------------------------------------------
SELECT e.name AS exercise, MAX(es.weight_kg) AS best_weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.user_id = 1
  AND es.weight_kg > 0
GROUP BY e.name
ORDER BY best_weight_kg DESC;


-- ---------------------------------------------------------------------
-- Q6: Above-average workouts (subquery)
-- Business need: Highlight the user's best sessions: those with more volume than their own average session.
-- ---------------------------------------------------------------------
SELECT w.workout_id, w.title, w.workout_date,
       SUM(es.reps * es.weight_kg) AS volume_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.user_id = 1 AND es.weight_kg IS NOT NULL
GROUP BY w.workout_id, w.title, w.workout_date
HAVING SUM(es.reps * es.weight_kg) > (
        SELECT AVG(v) FROM (
            SELECT SUM(es2.reps * es2.weight_kg) AS v
            FROM workouts w2
            JOIN workout_exercises we2 ON we2.workout_id = w2.workout_id
            JOIN exercise_sets es2     ON es2.workout_exercise_id = we2.workout_exercise_id
            WHERE w2.user_id = 1 AND es2.weight_kg IS NOT NULL
            GROUP BY w2.workout_id
        ) AS per_workout
)
ORDER BY volume_kg DESC;


-- ---------------------------------------------------------------------
-- Q7: Exercises a user has never tried (NOT EXISTS)
-- Business need: The 'Try Something New' suggestion lists catalogue exercises the user has never logged.
-- ---------------------------------------------------------------------
SELECT e.exercise_id, e.name, e.category
FROM exercises e
WHERE NOT EXISTS (
    SELECT 1
    FROM workout_exercises we
    JOIN workouts w ON w.workout_id = we.workout_id
    WHERE we.exercise_id = e.exercise_id
      AND w.user_id = 1
)
ORDER BY e.name;


-- ---------------------------------------------------------------------
-- Q8: Workout count and last activity for every user (LEFT JOIN)
-- Business need: Admin overview of user engagement, including users who have not logged anything yet.
-- ---------------------------------------------------------------------
SELECT u.user_id, u.full_name,
       COUNT(w.workout_id)  AS workouts_logged,
       MAX(w.workout_date)  AS last_workout
FROM users u
LEFT JOIN workouts w ON w.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY workouts_logged DESC, u.user_id;


-- ---------------------------------------------------------------------
-- Q9: Goal progress (CTE + JOIN)
-- Business need: The 'Goals' screen shows target vs. best lifted weight and percentage completed.
-- ---------------------------------------------------------------------
WITH best AS (
    SELECT w.user_id, we.exercise_id, MAX(es.weight_kg) AS best_weight_kg
    FROM workouts w
    JOIN workout_exercises we ON we.workout_id = w.workout_id
    JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
    GROUP BY w.user_id, we.exercise_id
)
SELECT u.full_name, e.name AS exercise, g.target_weight_kg, g.target_date, g.status,
       b.best_weight_kg,
       ROUND(100.0 * b.best_weight_kg / g.target_weight_kg, 1) AS pct_complete
FROM goals g
JOIN users u     ON u.user_id = g.user_id
JOIN exercises e ON e.exercise_id = g.exercise_id
LEFT JOIN best b ON b.user_id = g.user_id AND b.exercise_id = g.exercise_id
ORDER BY u.user_id, g.target_date;


-- ---------------------------------------------------------------------
-- Q10: Body-weight change since previous check-in (window function)
-- Business need: The 'Progress' chart shows body-weight change between consecutive measurements.
-- ---------------------------------------------------------------------
SELECT u.full_name, bm.measured_on, bm.body_weight_kg,
       ROUND(bm.body_weight_kg - LAG(bm.body_weight_kg) OVER (
                 PARTITION BY bm.user_id ORDER BY bm.measured_on), 1) AS change_kg
FROM body_measurements bm
JOIN users u ON u.user_id = bm.user_id
ORDER BY u.user_id, bm.measured_on;


-- ---------------------------------------------------------------------
-- Q11: INSERT: log a new workout with an exercise and sets
-- Business need: User submits the 'Log Workout' form; the app saves the session, its exercise and its sets.
-- ---------------------------------------------------------------------
INSERT INTO workouts (user_id, title, workout_date, duration_min, notes)
VALUES (1, 'Push Day', '2026-11-19', 68, 'Chasing the bench goal');

INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order)
VALUES ((SELECT MAX(workout_id) FROM workouts), 1, 1);

INSERT INTO exercise_sets (workout_exercise_id, set_number, reps, weight_kg)
VALUES ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 1, 10, 67.5),
       ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 2,  8, 72.5),
       ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 3,  5, 77.5);

-- Verify
SELECT w.workout_id, w.title, e.name AS exercise, es.set_number, es.reps, es.weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.workout_id = (SELECT MAX(workout_id) FROM workouts)
ORDER BY es.set_number;


-- ---------------------------------------------------------------------
-- Q12: UPDATE: correct a mistyped set
-- Business need: User edits a set after realising they entered the wrong weight.
-- ---------------------------------------------------------------------
UPDATE exercise_sets
SET weight_kg = 75
WHERE workout_exercise_id = (SELECT MAX(workout_exercise_id) FROM workout_exercises)
  AND set_number = 3;

-- Verify
SELECT set_number, reps, weight_kg
FROM exercise_sets
WHERE workout_exercise_id = (SELECT MAX(workout_exercise_id) FROM workout_exercises)
ORDER BY set_number;


-- ---------------------------------------------------------------------
-- Q13: DELETE: remove a workout (cascading)
-- Business need: User deletes a workout entry; its exercises and sets must disappear with it.
-- ---------------------------------------------------------------------
-- Before
SELECT (SELECT COUNT(*) FROM workouts           WHERE workout_id = 13) AS workouts,
       (SELECT COUNT(*) FROM workout_exercises  WHERE workout_id = 13) AS exercises,
       (SELECT COUNT(*) FROM exercise_sets es
          JOIN workout_exercises we ON we.workout_exercise_id = es.workout_exercise_id
         WHERE we.workout_id = 13)                                    AS sets;

DELETE FROM workouts WHERE workout_id = 13;

-- After
SELECT (SELECT COUNT(*) FROM workouts           WHERE workout_id = 13) AS workouts,
       (SELECT COUNT(*) FROM workout_exercises  WHERE workout_id = 13) AS exercises,
       (SELECT COUNT(*) FROM exercise_sets es
          JOIN workout_exercises we ON we.workout_exercise_id = es.workout_exercise_id
         WHERE we.workout_id = 13)                                    AS sets;

