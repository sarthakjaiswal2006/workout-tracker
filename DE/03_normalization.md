# 03 – Database Normalization (UNF → 1NF → 2NF → 3NF)

Notation: `A → B` means *A functionally determines B* (knowing A gives exactly one B).

## 0. Starting point: the unnormalized "workout log"

A first idea is to record everything in one big sheet, one row per workout:

| user_id | user_name | user_email | workout_id | title | date | duration | exercises (name, category, muscle group, sets) |
|---|---|---|---|---|---|---|---|
| 1 | Sarthak Jaiswal | sarthak@example.com | 8 | Push Day | 2026-11-12 | 65 | Bench Press, strength, Chest, {(1,10,65), (2,8,70), (3,6,75)}; Overhead Press, strength, Shoulders, {(1,10,40), (2,8,42.5)} |
| 1 | Sarthak Jaiswal | sarthak@example.com | 7 | Leg Day | 2026-11-09 | 72 | Squat, strength, Legs, {(1,8,85), (2,8,90), (3,5,95)}; Leg Press, strength, Legs, {...} |

### Problems (anomalies) in this design
| Anomaly | Example |
|---|---|
| **Redundancy** | User name and e-mail are repeated in every workout row; "Bench Press – Chest" is repeated in every workout that contains it |
| **Update anomaly** | A user changes e-mail → every one of their rows must be edited, otherwise the data is inconsistent |
| **Insert anomaly** | A new exercise ("Lunges") cannot be added to the catalogue until someone performs it in a workout |
| **Delete anomaly** | Deleting the only workout that contains "Rowing Machine" also destroys the knowledge that this exercise exists |
| **Repeating groups** | A single cell holds several exercises and several sets |

## 1. First Normal Form (1NF)

**Rule:** every cell holds one atomic value; there are no repeating groups; every row is uniquely identifiable.

**Transformation:** the multi-valued `exercises` column is split so that there is **one row per set**.

```
LOG_1NF (workout_id, exercise_id, set_number,
         user_id, user_name, user_email,
         title, date, duration,
         exercise_name, category, muscle_group,
         reps, weight_kg, duration_sec, distance_km)
PK = (workout_id, exercise_id, set_number)
```

| workout_id | exercise_id | set_number | user_id | user_name | title | exercise_name | muscle_group | reps | weight_kg |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 1 | 1 | 1 | Sarthak Jaiswal | Push Day | Bench Press | Chest | 10 | 65 |
| 8 | 1 | 2 | 1 | Sarthak Jaiswal | Push Day | Bench Press | Chest | 8 | 70 |
| 8 | 1 | 3 | 1 | Sarthak Jaiswal | Push Day | Bench Press | Chest | 6 | 75 |
| 8 | 7 | 1 | 1 | Sarthak Jaiswal | Push Day | Overhead Press | Shoulders | 10 | 40 |

### Functional dependencies identified
| # | Functional dependency | Type |
|---|---|---|
| FD1 | `(workout_id, exercise_id, set_number) → reps, weight_kg, duration_sec, distance_km` | Full dependency on the key |
| FD2 | `workout_id → user_id, title, date, duration` | **Partial** (part of the key) |
| FD3 | `exercise_id → exercise_name, category, muscle_group` | **Partial** (part of the key) |
| FD4 | `(workout_id, exercise_id) → exercise_order` | **Partial** (part of the key) |
| FD5 | `user_id → user_name, user_email` | Transitive (via `workout_id`) |
| FD6 | `muscle_group` is determined by the exercise, and the group has its own identity | Transitive (via `exercise_id`) |

## 2. Second Normal Form (2NF)

**Rule:** be in 1NF **and** have no *partial* dependency, i.e. no non-key attribute may depend on only part of a composite key.

FD2, FD3 and FD4 violate this because the key is `(workout_id, exercise_id, set_number)` but these attributes depend on only `workout_id`, only `exercise_id`, or only `(workout_id, exercise_id)`.

**Transformation:** move each partially dependent group into a relation whose key is exactly its determinant.

```
WORKOUT           (workout_id PK, user_id, user_name, user_email, title, date, duration)
EXERCISE          (exercise_id PK, exercise_name, category, muscle_group)
WORKOUT_EXERCISE  (workout_id, exercise_id, exercise_order)        PK = (workout_id, exercise_id)
EXERCISE_SET      (workout_id, exercise_id, set_number,
                   reps, weight_kg, duration_sec, distance_km)     PK = (workout_id, exercise_id, set_number)
```
Every non-key attribute now depends on the **whole** key of its relation. **2NF achieved.**

Note: `WORKOUT_EXERCISE` is the bridge that resolves the many-to-many relationship between workouts and exercises.

## 3. Third Normal Form (3NF)

**Rule:** be in 2NF **and** have no *transitive* dependency, i.e. no non-key attribute may depend on another non-key attribute.

| Violation | Chain | Fix |
|---|---|---|
| In `WORKOUT` | `workout_id → user_id → user_name, user_email` | Create `USER (user_id PK, name, email, ...)`; keep only `user_id` (FK) in `WORKOUT` |
| In `EXERCISE` | `exercise_id → muscle_group_id → muscle_group_name` | Create `MUSCLE_GROUP (muscle_group_id PK, name)`; keep only `muscle_group_id` (FK) in `EXERCISE` |

**Additional design decisions (new entities from requirements, already in 3NF):**
- `GOAL (goal_id PK, user_id FK, exercise_id FK, target_weight, target_date, status)`
- `BODY_MEASUREMENT (measurement_id PK, user_id FK, measured_on, body_weight)` with candidate key `(user_id, measured_on)`
- `USER_PROFILE (user_id PK/FK, date_of_birth, gender, height, fitness_level, unit)`: optional, rarely read attributes of the user, kept in a 1:1 table to keep `users` lean and keep authentication data separate from personal data.

## 4. Surrogate keys in the implementation

The relations `WORKOUT_EXERCISE` and `EXERCISE_SET` use **surrogate keys** (`workout_exercise_id`, `set_id`) so child tables have a single-column foreign key. The original natural keys are **preserved as UNIQUE constraints** so no normalization rule is lost:

| Natural key | Implemented as |
|---|---|
| `(workout_id, exercise_id)` | `UNIQUE (workout_id, exercise_id)` on `workout_exercises` |
| `(workout_exercise_id, set_number)` | `UNIQUE (workout_exercise_id, set_number)` on `exercise_sets` |

## 5. Final normalized relations and their dependencies

| Relation | Functional dependencies (all determinants are candidate keys → also in **BCNF**) |
|---|---|
| `users` | `user_id → full_name, email, password_hash, created_at`; `email → user_id` |
| `user_profiles` | `user_id → date_of_birth, gender, height_cm, fitness_level, preferred_unit` |
| `muscle_groups` | `muscle_group_id → name`; `name → muscle_group_id` |
| `exercises` | `exercise_id → name, category, muscle_group_id`; `name → exercise_id` |
| `workouts` | `workout_id → user_id, title, workout_date, duration_min, notes, created_at` |
| `workout_exercises` | `workout_exercise_id → workout_id, exercise_id, exercise_order`; `(workout_id, exercise_id) → workout_exercise_id` |
| `exercise_sets` | `set_id → workout_exercise_id, set_number, reps, weight_kg, duration_sec, distance_km`; `(workout_exercise_id, set_number) → set_id` |
| `goals` | `goal_id → user_id, exercise_id, target_weight_kg, target_date, status` |
| `body_measurements` | `measurement_id → user_id, measured_on, body_weight_kg`; `(user_id, measured_on) → measurement_id` |

## 6. Anomalies resolved
| Anomaly | How the final schema fixes it |
|---|---|
| Redundancy | User data stored once in `users`; exercise data stored once in `exercises` |
| Update | Change an e-mail or rename "Chest" in **one** row |
| Insert | Add a new exercise or muscle group without any workout existing |
| Delete | Deleting a workout removes only that workout's rows (`CASCADE`); the exercise catalogue is untouched (`RESTRICT` prevents deleting an exercise in use) |

## 7. Intentional design choice on derived data
Values such as *total volume* or *personal record* are **not stored**; they are computed with `SUM`/`MAX` queries (see Q3, Q5). Storing them would create derived data that can go out of sync. If performance ever demands it, a materialized view can be used (see `08_integrity_and_performance.md`).
