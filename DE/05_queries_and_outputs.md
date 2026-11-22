# 05 – Project-Specific Queries and Execution Output

13 queries covering **INSERT, UPDATE, DELETE, SELECT with filtering and sorting, aggregates, GROUP BY / HAVING, JOINs, subqueries, CTE and a window function**. Every query serves a screen or feature of the Workout Tracker.

> **How outputs were produced:** each query was executed in order against the data in `sql/02_seed.sql`. The result tables below are those results. Number formatting may differ slightly in `psql` (e.g. `NUMERIC` shows `77.50` instead of `77.5`). Re-run `sql/03_queries.sql` in your own PostgreSQL and replace/add your own screenshots in `evidence/` before submission.

| # | Operation | Concept |
|---|---|---|
| Q1 | Recent workouts of a user (filter + sort) | SELECT, WHERE with comparison/AND, ORDER BY |
| Q2 | Full detail of one workout (4-table JOIN) | INNER JOIN across workouts, workout_exercises, exercises, exercise_sets |
| Q3 | Training volume per workout (aggregate) | SUM, COUNT, GROUP BY, ORDER BY on an aggregate, JOIN |
| Q4 | Muscle groups trained at least 9 sets (GROUP BY + HAVING) | GROUP BY, HAVING, multi-table JOIN |
| Q5 | Personal records per exercise (MAX) | MAX aggregate, GROUP BY, JOIN |
| Q6 | Above-average workouts (subquery) | Subquery inside HAVING with a derived table |
| Q7 | Exercises a user has never tried (NOT EXISTS) | Correlated subquery with NOT EXISTS |
| Q8 | Workout count and last activity for every user (LEFT JOIN) | LEFT JOIN, COUNT, MAX, GROUP BY |
| Q9 | Goal progress (CTE + JOIN) | CTE (WITH), JOIN, ROUND, derived percentage |
| Q10 | Body-weight change since previous check-in (window function) | Window function LAG() OVER (PARTITION BY ... ORDER BY ...) |
| Q11 | INSERT: log a new workout with an exercise and sets | INSERT (single and multi-row), sub-select for generated keys |
| Q12 | UPDATE: correct a mistyped set | UPDATE with WHERE and sub-select |
| Q13 | DELETE: remove a workout (cascading) | DELETE, ON DELETE CASCADE, COUNT for verification |

---

## Q1. Recent workouts of a user (filter + sort)

**Business need:** The 'History' screen lists a user's workouts from the last three weeks, newest first.  
**Concepts:** SELECT, WHERE with comparison/AND, ORDER BY

```sql
SELECT workout_id, title, workout_date, duration_min
FROM workouts
WHERE user_id = 1
  AND workout_date BETWEEN '2026-11-01' AND '2026-11-21'
ORDER BY workout_date DESC;
```

**Output:**

| workout_id | title | workout_date | duration_min |
|---|---|---|---|
| 8 | Push Day | 2026-11-12 | 65 |
| 7 | Leg Day | 2026-11-09 | 72 |
| 6 | Pull Day | 2026-11-06 | 58 |
| 5 | Morning Run | 2026-11-04 | 35 |
| 4 | Push Day | 2026-11-02 | 62 |

*(5 rows)*

**Explanation:** Filters on the `(user_id, workout_date)` index and sorts newest-first. In the app the dates become `CURRENT_DATE - INTERVAL '21 days'` and `CURRENT_DATE`.


---

## Q2. Full detail of one workout (4-table JOIN)

**Business need:** The 'Workout Detail' screen shows every exercise and set of a workout.  
**Concepts:** INNER JOIN across workouts, workout_exercises, exercises, exercise_sets

```sql
SELECT w.title, w.workout_date, we.exercise_order, e.name AS exercise,
       es.set_number, es.reps, es.weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.workout_id = 8
ORDER BY we.exercise_order, es.set_number;
```

**Output:**

| title | workout_date | exercise_order | exercise | set_number | reps | weight_kg |
|---|---|---|---|---|---|---|
| Push Day | 2026-11-12 | 1 | Bench Press | 1 | 10 | 65 |
| Push Day | 2026-11-12 | 1 | Bench Press | 2 | 8 | 70 |
| Push Day | 2026-11-12 | 1 | Bench Press | 3 | 6 | 75 |
| Push Day | 2026-11-12 | 2 | Incline Dumbbell Press | 1 | 10 | 25 |
| Push Day | 2026-11-12 | 2 | Incline Dumbbell Press | 2 | 10 | 27.5 |
| Push Day | 2026-11-12 | 3 | Overhead Press | 1 | 10 | 40 |
| Push Day | 2026-11-12 | 3 | Overhead Press | 2 | 8 | 42.5 |

*(7 rows)*

**Explanation:** Walks the chain workout → workout_exercises (M:N bridge) → exercises and → exercise_sets. This is the exact query behind `GET /api/workouts/:id`.


---

## Q3. Training volume per workout (aggregate)

**Business need:** The dashboard chart shows total volume lifted (reps × weight) and number of sets per workout.  
**Concepts:** SUM, COUNT, GROUP BY, ORDER BY on an aggregate, JOIN

```sql
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
```

**Output:**

| workout_id | title | workout_date | total_sets | volume_kg |
|---|---|---|---|---|
| 7 | Leg Day | 2026-11-09 | 5 | 5375 |
| 3 | Leg Day | 2026-10-30 | 5 | 5140 |
| 1 | Push Day | 2026-10-26 | 9 | 3140 |
| 8 | Push Day | 2026-11-12 | 7 | 2925 |
| 4 | Push Day | 2026-11-02 | 7 | 2765 |
| 6 | Pull Day | 2026-11-06 | 8 | 1855 |
| 2 | Pull Day | 2026-10-28 | 8 | 1710 |

*(7 rows)*

**Explanation:** `weight_kg IS NOT NULL` skips cardio/timed sets. Volume = Σ(reps × weight). Heavier days rank first.


---

## Q4. Muscle groups trained at least 9 sets (GROUP BY + HAVING)

**Business need:** The 'Muscle Balance' card highlights which muscle groups a user trains most.  
**Concepts:** GROUP BY, HAVING, multi-table JOIN

```sql
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
```

**Output:**

| muscle_group | total_sets |
|---|---|
| Chest | 16 |
| Back | 12 |
| Legs | 10 |

*(3 rows)*

**Explanation:** `HAVING` filters *after* grouping, which `WHERE` cannot do. Muscle groups with fewer than 9 sets (Shoulders, Arms, Core, Cardio) are excluded.


---

## Q5. Personal records per exercise (MAX)

**Business need:** The 'Personal Records' page lists the heaviest weight lifted per exercise.  
**Concepts:** MAX aggregate, GROUP BY, JOIN

```sql
SELECT e.name AS exercise, MAX(es.weight_kg) AS best_weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.user_id = 1
  AND es.weight_kg > 0
GROUP BY e.name
ORDER BY best_weight_kg DESC;
```

**Output:**

| exercise | best_weight_kg |
|---|---|
| Leg Press | 170 |
| Deadlift | 125 |
| Squat | 95 |
| Bench Press | 75 |
| Overhead Press | 42.5 |
| Incline Dumbbell Press | 27.5 |
| Bicep Curl | 15 |

*(7 rows)*

**Explanation:** `weight_kg > 0` removes body-weight movements (Pull-Up logged with 0 kg) and timed sets.


---

## Q6. Above-average workouts (subquery)

**Business need:** Highlight the user's best sessions: those with more volume than their own average session.  
**Concepts:** Subquery inside HAVING with a derived table

```sql
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
```

**Output:**

| workout_id | title | workout_date | volume_kg |
|---|---|---|---|
| 7 | Leg Day | 2026-11-09 | 5375 |
| 3 | Leg Day | 2026-10-30 | 5140 |

*(2 rows)*

**Explanation:** The inner query computes each workout's volume, the middle `AVG` gives the user's average, and the outer query keeps only workouts above it.


---

## Q7. Exercises a user has never tried (NOT EXISTS)

**Business need:** The 'Try Something New' suggestion lists catalogue exercises the user has never logged.  
**Concepts:** Correlated subquery with NOT EXISTS

```sql
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
```

**Output:**

| exercise_id | name | category |
|---|---|---|
| 11 | Cycling | cardio |
| 14 | Lunges | strength |
| 13 | Rowing Machine | cardio |
| 12 | Yoga Flow | flexibility |

*(4 rows)*

**Explanation:** For each catalogue exercise, the subquery checks whether user 1 has any workout containing it. `NOT EXISTS` is NULL-safe, unlike `NOT IN`.


---

## Q8. Workout count and last activity for every user (LEFT JOIN)

**Business need:** Admin overview of user engagement, including users who have not logged anything yet.  
**Concepts:** LEFT JOIN, COUNT, MAX, GROUP BY

```sql
SELECT u.user_id, u.full_name,
       COUNT(w.workout_id)  AS workouts_logged,
       MAX(w.workout_date)  AS last_workout
FROM users u
LEFT JOIN workouts w ON w.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY workouts_logged DESC, u.user_id;
```

**Output:**

| user_id | full_name | workouts_logged | last_workout |
|---|---|---|---|
| 1 | Sarthak Jaiswal | 8 | 2026-11-12 |
| 2 | Aarav Mehta | 3 | 2026-11-15 |
| 3 | Priya Nair | 3 | 2026-11-17 |
| 4 | Rohan Singh | 0 | NULL |

*(4 rows)*

**Explanation:** A plain INNER JOIN would drop Rohan (no workouts). `LEFT JOIN` keeps him with a count of 0 and a NULL last date.


---

## Q9. Goal progress (CTE + JOIN)

**Business need:** The 'Goals' screen shows target vs. best lifted weight and percentage completed.  
**Concepts:** CTE (WITH), JOIN, ROUND, derived percentage

```sql
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
```

**Output:**

| full_name | exercise | target_weight_kg | target_date | status | best_weight_kg | pct_complete |
|---|---|---|---|---|---|---|
| Sarthak Jaiswal | Squat | 90 | 2026-11-01 | achieved | 95 | 105.6 |
| Sarthak Jaiswal | Deadlift | 140 | 2026-12-15 | active | 125 | 89.3 |
| Sarthak Jaiswal | Bench Press | 80 | 2026-12-31 | active | 75 | 93.8 |
| Aarav Mehta | Squat | 100 | 2027-01-31 | active | 75 | 75 |

*(4 rows)*

**Explanation:** The CTE `best` precomputes each user's maximum weight per exercise once, then goals are joined to it.


---

## Q10. Body-weight change since previous check-in (window function)

**Business need:** The 'Progress' chart shows body-weight change between consecutive measurements.  
**Concepts:** Window function LAG() OVER (PARTITION BY ... ORDER BY ...)

```sql
SELECT u.full_name, bm.measured_on, bm.body_weight_kg,
       ROUND(bm.body_weight_kg - LAG(bm.body_weight_kg) OVER (
                 PARTITION BY bm.user_id ORDER BY bm.measured_on), 1) AS change_kg
FROM body_measurements bm
JOIN users u ON u.user_id = bm.user_id
ORDER BY u.user_id, bm.measured_on;
```

**Output:**

| full_name | measured_on | body_weight_kg | change_kg |
|---|---|---|---|
| Sarthak Jaiswal | 2026-10-26 | 78.5 | NULL |
| Sarthak Jaiswal | 2026-11-02 | 78 | -0.5 |
| Sarthak Jaiswal | 2026-11-09 | 77.4 | -0.6 |
| Sarthak Jaiswal | 2026-11-16 | 77.6 | 0.2 |
| Aarav Mehta | 2026-11-03 | 82 | NULL |
| Aarav Mehta | 2026-11-17 | 81.2 | -0.8 |
| Priya Nair | 2026-11-05 | 58.4 | NULL |
| Priya Nair | 2026-11-19 | 58 | -0.4 |

*(8 rows)*

**Explanation:** `LAG` looks at the previous row *within the same user*. The first measurement per user has no previous value, so `change_kg` is NULL.


---

## Q11. INSERT: log a new workout with an exercise and sets

**Business need:** User submits the 'Log Workout' form; the app saves the session, its exercise and its sets.  
**Concepts:** INSERT (single and multi-row), sub-select for generated keys

```sql
INSERT INTO workouts (user_id, title, workout_date, duration_min, notes)
VALUES (1, 'Push Day', '2026-11-19', 68, 'Chasing the bench goal');
```

*Command tag:* `INSERT 0 1`

```sql
INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order)
VALUES ((SELECT MAX(workout_id) FROM workouts), 1, 1);
```

*Command tag:* `INSERT 0 1`

```sql
INSERT INTO exercise_sets (workout_exercise_id, set_number, reps, weight_kg)
VALUES ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 1, 10, 67.5),
       ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 2,  8, 72.5),
       ((SELECT MAX(workout_exercise_id) FROM workout_exercises), 3,  5, 77.5);
```

*Command tag:* `INSERT 0 3`

```sql
-- Verify
SELECT w.workout_id, w.title, e.name AS exercise, es.set_number, es.reps, es.weight_kg
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.workout_id
JOIN exercises e          ON e.exercise_id = we.exercise_id
JOIN exercise_sets es     ON es.workout_exercise_id = we.workout_exercise_id
WHERE w.workout_id = (SELECT MAX(workout_id) FROM workouts)
ORDER BY es.set_number;
```

**Output:**

| workout_id | title | exercise | set_number | reps | weight_kg |
|---|---|---|---|---|---|
| 15 | Push Day | Bench Press | 1 | 10 | 67.5 |
| 15 | Push Day | Bench Press | 2 | 8 | 72.5 |
| 15 | Push Day | Bench Press | 3 | 5 | 77.5 |

*(3 rows)*

**Explanation:** Three dependent inserts. In the application these run inside one transaction and use `RETURNING workout_id` instead of `MAX()` (see `integration/src/routes/workouts.js`).


---

## Q12. UPDATE: correct a mistyped set

**Business need:** User edits a set after realising they entered the wrong weight.  
**Concepts:** UPDATE with WHERE and sub-select

```sql
UPDATE exercise_sets
SET weight_kg = 75
WHERE workout_exercise_id = (SELECT MAX(workout_exercise_id) FROM workout_exercises)
  AND set_number = 3;
```

*Command tag:* `UPDATE 1`

```sql
-- Verify
SELECT set_number, reps, weight_kg
FROM exercise_sets
WHERE workout_exercise_id = (SELECT MAX(workout_exercise_id) FROM workout_exercises)
ORDER BY set_number;
```

**Output:**

| set_number | reps | weight_kg |
|---|---|---|
| 1 | 10 | 67.5 |
| 2 | 8 | 72.5 |
| 3 | 5 | 75 |

*(3 rows)*

**Explanation:** Only set 3 of the newest exercise changes (77.5 → 75). The `WHERE` clause is essential; without it every set would be updated.


---

## Q13. DELETE: remove a workout (cascading)

**Business need:** User deletes a workout entry; its exercises and sets must disappear with it.  
**Concepts:** DELETE, ON DELETE CASCADE, COUNT for verification

```sql
-- Before
SELECT (SELECT COUNT(*) FROM workouts           WHERE workout_id = 13) AS workouts,
       (SELECT COUNT(*) FROM workout_exercises  WHERE workout_id = 13) AS exercises,
       (SELECT COUNT(*) FROM exercise_sets es
          JOIN workout_exercises we ON we.workout_exercise_id = es.workout_exercise_id
         WHERE we.workout_id = 13)                                    AS sets;
```

**Output:**

| workouts | exercises | sets |
|---|---|---|
| 1 | 1 | 1 |

*(1 row)*

```sql
DELETE FROM workouts WHERE workout_id = 13;
```

*Command tag:* `DELETE 1`

```sql
-- After
SELECT (SELECT COUNT(*) FROM workouts           WHERE workout_id = 13) AS workouts,
       (SELECT COUNT(*) FROM workout_exercises  WHERE workout_id = 13) AS exercises,
       (SELECT COUNT(*) FROM exercise_sets es
          JOIN workout_exercises we ON we.workout_exercise_id = es.workout_exercise_id
         WHERE we.workout_id = 13)                                    AS sets;
```

**Output:**

| workouts | exercises | sets |
|---|---|---|
| 0 | 0 | 0 |

*(1 row)*

**Explanation:** Only the `workouts` row is deleted explicitly. `ON DELETE CASCADE` on `workout_exercises` and `exercise_sets` removes the children, so no orphan rows are left.
