# 04 – Final Database Schema (PostgreSQL)

The complete executable DDL is in [`sql/01_schema.sql`](sql/01_schema.sql). Summary:

## Tables

### `users`
| Column | Type | Constraints |
|---|---|---|
| user_id | INTEGER | PK, identity |
| full_name | VARCHAR(100) | NOT NULL, not blank |
| email | VARCHAR(150) | NOT NULL, UNIQUE, lower-case, pattern check |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default `NOW()` |

### `user_profiles` (1:1)
| Column | Type | Constraints |
|---|---|---|
| user_id | INTEGER | PK, FK → users (CASCADE) |
| date_of_birth | DATE | – |
| gender | VARCHAR(10) | `male / female / other` |
| height_cm | NUMERIC(5,1) | 50–260 |
| fitness_level | VARCHAR(12) | NOT NULL, default `beginner`, `beginner / intermediate / advanced` |
| preferred_unit | VARCHAR(2) | NOT NULL, default `kg`, `kg / lb` |

### `muscle_groups`
| Column | Type | Constraints |
|---|---|---|
| muscle_group_id | INTEGER | PK, identity |
| name | VARCHAR(50) | NOT NULL, UNIQUE |

### `exercises`
| Column | Type | Constraints |
|---|---|---|
| exercise_id | INTEGER | PK, identity |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| category | VARCHAR(12) | NOT NULL, `strength / cardio / flexibility` |
| muscle_group_id | INTEGER | NOT NULL, FK → muscle_groups (RESTRICT) |

### `workouts`
| Column | Type | Constraints |
|---|---|---|
| workout_id | INTEGER | PK, identity |
| user_id | INTEGER | NOT NULL, FK → users (CASCADE) |
| title | VARCHAR(100) | NOT NULL |
| workout_date | DATE | NOT NULL |
| duration_min | INTEGER | NULL or 1–600 |
| notes | TEXT | – |
| created_at | TIMESTAMPTZ | NOT NULL, default `NOW()` |

### `workout_exercises` (M:N bridge)
| Column | Type | Constraints |
|---|---|---|
| workout_exercise_id | INTEGER | PK, identity |
| workout_id | INTEGER | NOT NULL, FK → workouts (CASCADE) |
| exercise_id | INTEGER | NOT NULL, FK → exercises (RESTRICT) |
| exercise_order | SMALLINT | NOT NULL, default 1, > 0 |
| | | UNIQUE (workout_id, exercise_id) |

### `exercise_sets`
| Column | Type | Constraints |
|---|---|---|
| set_id | BIGINT | PK, identity |
| workout_exercise_id | INTEGER | NOT NULL, FK → workout_exercises (CASCADE) |
| set_number | SMALLINT | NOT NULL, > 0 |
| reps | SMALLINT | NULL or > 0 |
| weight_kg | NUMERIC(6,2) | NULL or ≥ 0 |
| duration_sec | INTEGER | NULL or > 0 |
| distance_km | NUMERIC(6,2) | NULL or ≥ 0 |
| | | UNIQUE (workout_exercise_id, set_number); CHECK (reps IS NOT NULL OR duration_sec IS NOT NULL) |

### `goals`
| Column | Type | Constraints |
|---|---|---|
| goal_id | INTEGER | PK, identity |
| user_id | INTEGER | NOT NULL, FK → users (CASCADE) |
| exercise_id | INTEGER | NOT NULL, FK → exercises (RESTRICT) |
| target_weight_kg | NUMERIC(6,2) | NOT NULL, > 0 |
| target_date | DATE | NOT NULL |
| status | VARCHAR(10) | NOT NULL, default `active`, `active / achieved / abandoned` |
| created_at | TIMESTAMPTZ | NOT NULL, default `NOW()` |

### `body_measurements`
| Column | Type | Constraints |
|---|---|---|
| measurement_id | INTEGER | PK, identity |
| user_id | INTEGER | NOT NULL, FK → users (CASCADE) |
| measured_on | DATE | NOT NULL |
| body_weight_kg | NUMERIC(5,1) | NOT NULL, 20–400 |
| | | UNIQUE (user_id, measured_on) |

## Referential actions
| FK | On delete | Reason |
|---|---|---|
| user_profiles / workouts / goals / body_measurements → users | CASCADE | Deleting an account removes its personal data |
| workout_exercises → workouts, exercise_sets → workout_exercises | CASCADE | A set or exercise-in-workout cannot exist without its parent |
| workout_exercises / goals → exercises | RESTRICT | A catalogue exercise that has history must not be deleted |
| exercises → muscle_groups | RESTRICT | Same reason |

## Indexes
| Index | Columns | Purpose |
|---|---|---|
| `idx_workouts_user_date` | `workouts(user_id, workout_date DESC)` | History screen, date-range filters |
| `idx_we_exercise` | `workout_exercises(exercise_id)` | Personal records / "which workouts used this exercise" |
| `idx_exercises_muscle` | `exercises(muscle_group_id)` | Muscle-group statistics |
| `idx_exercises_category` | `exercises(category)` | Catalogue filter |
| `idx_goals_user_exercise` | `goals(user_id, exercise_id)` | Goal progress join |
| `idx_goals_active` | `goals(user_id) WHERE status='active'` (partial) | Fast "my active goals" |
| *(automatic)* | every PK and UNIQUE constraint | e.g. `uq_we_workout_exercise` and `uq_sets_we_number` also serve as FK-lookup indexes |
