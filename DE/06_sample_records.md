# Sample Records – Evidence of Database Implementation

Data loaded by [`sql/02_seed.sql`](sql/02_seed.sql). Row counts and the first rows of every table are shown below (`password_hash` and `created_at` omitted for brevity).

| Table | Rows loaded |
|---|---|
| `users` | 4 |
| `user_profiles` | 3 |
| `muscle_groups` | 7 |
| `exercises` | 14 |
| `workouts` | 14 |
| `workout_exercises` | 33 |
| `exercise_sets` | 73 |
| `goals` | 4 |
| `body_measurements` | 8 |

## `users`  (4 rows, first 4 shown)

| user_id | full_name | email |
|---|---|---|
| 1 | Sarthak Jaiswal | sarthak@example.com |
| 2 | Aarav Mehta | aarav@example.com |
| 3 | Priya Nair | priya@example.com |
| 4 | Rohan Singh | rohan@example.com |

## `user_profiles`  (3 rows, first 3 shown)

| user_id | date_of_birth | gender | height_cm | fitness_level | preferred_unit |
|---|---|---|---|---|---|
| 1 | 2004-03-12 | male | 175 | intermediate | kg |
| 2 | 1999-07-21 | male | 180.5 | beginner | kg |
| 3 | 2001-11-02 | female | 162 | advanced | kg |

## `muscle_groups`  (7 rows, first 7 shown)

| muscle_group_id | name |
|---|---|
| 1 | Chest |
| 2 | Back |
| 3 | Legs |
| 4 | Shoulders |
| 5 | Arms |
| 6 | Core |
| 7 | Cardio |

## `exercises`  (14 rows, first 8 shown)

| exercise_id | name | category | muscle_group_id |
|---|---|---|---|
| 1 | Bench Press | strength | 1 |
| 2 | Incline Dumbbell Press | strength | 1 |
| 3 | Deadlift | strength | 2 |
| 4 | Pull-Up | strength | 2 |
| 5 | Squat | strength | 3 |
| 6 | Leg Press | strength | 3 |
| 7 | Overhead Press | strength | 4 |
| 8 | Bicep Curl | strength | 5 |

## `workouts`  (14 rows, first 8 shown)

| workout_id | user_id | title | workout_date | duration_min | notes |
|---|---|---|---|---|---|
| 1 | 1 | Push Day | 2026-10-26 | 60 | Felt strong |
| 2 | 1 | Pull Day | 2026-10-28 | 55 | NULL |
| 3 | 1 | Leg Day | 2026-10-30 | 70 | Heavy squats |
| 4 | 1 | Push Day | 2026-11-02 | 62 | NULL |
| 5 | 1 | Morning Run | 2026-11-04 | 35 | Easy pace |
| 6 | 1 | Pull Day | 2026-11-06 | 58 | NULL |
| 7 | 1 | Leg Day | 2026-11-09 | 72 | New squat PR |
| 8 | 1 | Push Day | 2026-11-12 | 65 | Bench PR |

## `workout_exercises`  (33 rows, first 8 shown)

| workout_exercise_id | workout_id | exercise_id | exercise_order |
|---|---|---|---|
| 1 | 1 | 1 | 1 |
| 2 | 1 | 2 | 2 |
| 3 | 1 | 7 | 3 |
| 4 | 2 | 3 | 1 |
| 5 | 2 | 4 | 2 |
| 6 | 2 | 8 | 3 |
| 7 | 3 | 5 | 1 |
| 8 | 3 | 6 | 2 |

## `exercise_sets`  (73 rows, first 8 shown)

| set_id | workout_exercise_id | set_number | reps | weight_kg | duration_sec | distance_km |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 10 | 60 | NULL | NULL |
| 2 | 1 | 2 | 8 | 65 | NULL | NULL |
| 3 | 1 | 3 | 6 | 70 | NULL | NULL |
| 4 | 2 | 1 | 10 | 22.5 | NULL | NULL |
| 5 | 2 | 2 | 10 | 22.5 | NULL | NULL |
| 6 | 2 | 3 | 8 | 25 | NULL | NULL |
| 7 | 3 | 1 | 10 | 35 | NULL | NULL |
| 8 | 3 | 2 | 8 | 37.5 | NULL | NULL |

## `goals`  (4 rows, first 4 shown)

| goal_id | user_id | exercise_id | target_weight_kg | target_date | status |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 80 | 2026-12-31 | active |
| 2 | 1 | 3 | 140 | 2026-12-15 | active |
| 3 | 1 | 5 | 90 | 2026-11-01 | achieved |
| 4 | 2 | 5 | 100 | 2027-01-31 | active |

## `body_measurements`  (8 rows, first 8 shown)

| measurement_id | user_id | measured_on | body_weight_kg |
|---|---|---|---|
| 1 | 1 | 2026-10-26 | 78.5 |
| 2 | 1 | 2026-11-02 | 78 |
| 3 | 1 | 2026-11-09 | 77.4 |
| 4 | 1 | 2026-11-16 | 77.6 |
| 5 | 2 | 2026-11-03 | 82 |
| 6 | 2 | 2026-11-17 | 81.2 |
| 7 | 3 | 2026-11-05 | 58.4 |
| 8 | 3 | 2026-11-19 | 58 |
