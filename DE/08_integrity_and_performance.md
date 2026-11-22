# 08 – Data Integrity and Performance Considerations

## 1. Constraints implemented (full list in `sql/01_schema.sql`)

| Kind | Examples | Protects against |
|---|---|---|
| `PRIMARY KEY` | every table | Duplicate / unidentifiable rows |
| `FOREIGN KEY` | `workouts.user_id`, `exercise_sets.workout_exercise_id`, … | Orphan rows, e.g. a set belonging to a non-existent workout |
| `UNIQUE` | `users.email`, `exercises.name`, `(workout_id, exercise_id)`, `(workout_exercise_id, set_number)`, `(user_id, measured_on)` | Duplicate accounts, duplicate catalogue entries, the same set number twice |
| `NOT NULL` | names, dates, FK columns, `password_hash` | Missing mandatory data |
| `CHECK` | `reps > 0`, `weight_kg >= 0`, `duration_min BETWEEN 1 AND 600`, `category IN (...)`, `status IN (...)`, e-mail format and lower-case, `reps IS NOT NULL OR duration_sec IS NOT NULL` | Invalid values |
| `DEFAULT` | `created_at = NOW()`, `status = 'active'`, `fitness_level = 'beginner'` | Missing optional values |
| Referential actions | `CASCADE` for owned data, `RESTRICT` for shared catalogue | Accidental loss of data |

Proof that these work: [`sql/04_integrity_tests.sql`](sql/04_integrity_tests.sql). Expected PostgreSQL responses:

| Test | Bad input | PostgreSQL response |
|---|---|---|
| T1 | Duplicate e-mail | `duplicate key value violates unique constraint "uq_users_email"` |
| T2 | `weight_kg = -5` | `new row for relation "exercise_sets" violates check constraint "chk_sets_weight"` |
| T3 | Set without reps or duration | `… violates check constraint "chk_sets_has_effort"` |
| T4 | Workout for user 999 | `… violates foreign key constraint "fk_workouts_user"` |
| T5 | `title = NULL` | `null value in column "title" of relation "workouts" violates not-null constraint` |
| T6 | Same exercise twice in a workout | `… violates unique constraint "uq_we_workout_exercise"` |
| T7 | Delete an exercise with history | `update or delete on table "exercises" violates foreign key constraint "fk_we_exercise" …` |
| T8 | Goal status `'paused'` | `… violates check constraint "chk_goals_status"` |
| T9 | Second body-weight entry same day | `… violates unique constraint "uq_bm_user_date"` |
| T10 | Same, using `ON CONFLICT DO UPDATE` | Succeeds; the existing row is corrected |

## 2. Handling duplicate, missing and invalid data

| Problem | Database layer | Application layer |
|---|---|---|
| **Duplicate** | `UNIQUE` constraints; `INSERT … ON CONFLICT DO UPDATE` (UPSERT) for body weight | `errors.js` maps SQLSTATE `23505` to HTTP **409 Conflict** |
| **Missing** | `NOT NULL`, `DEFAULT`; nullable columns only where "not applicable" is meaningful (e.g. `distance_km` for a plank) | Routes check required fields and return **400**; `COALESCE` keeps old values in `PATCH` |
| **Invalid** | `CHECK`, typed columns (`DATE`, `NUMERIC`), FKs | Password length check; `errors.js` maps `23514`, `22P02`, `22007`, `23503` to HTTP **400/409** |

Parameterised queries (`$1, $2 …`) also remove SQL-injection risk.

## 3. Indexing opportunities

| Query pattern | Index | Why |
|---|---|---|
| History: `WHERE user_id = ? [AND workout_date BETWEEN …] ORDER BY workout_date DESC` (Q1) | `idx_workouts_user_date (user_id, workout_date DESC)` | Equality column first, range/sort column second → no separate sort step |
| Joins `workout_exercises → exercise_sets` (Q2, Q3) | `uq_sets_we_number (workout_exercise_id, set_number)` (created by the UNIQUE constraint) | PostgreSQL does **not** auto-index FK columns; this constraint index covers the FK lookup |
| Joins `workouts → workout_exercises` | `uq_we_workout_exercise (workout_id, exercise_id)` | Same reason |
| "Where was this exercise used?" (Q5, Q7) | `idx_we_exercise (exercise_id)` | Second-column lookups need their own index |
| Active goals only | `idx_goals_active (user_id) WHERE status='active'` | **Partial index**: small, only the rows the dashboard needs |
| Login by e-mail | `uq_users_email` (automatic) | Unique lookup |

**How to prove an index helps** (for the demo): 
```sql
EXPLAIN ANALYZE SELECT * FROM workouts WHERE user_id = 1 AND workout_date >= '2026-11-01' ORDER BY workout_date DESC;
-- With the index: "Index Scan using idx_workouts_user_date".  Without it (DROP INDEX): "Seq Scan" + "Sort".
```
(On the tiny sample data PostgreSQL may still choose a sequential scan; load more rows, e.g. with `generate_series`, to see the difference.)

Indexes are deliberately **not** added on every column: each index slows `INSERT/UPDATE` and uses disk, and a workout log is write-heavy.

## 4. Supporting growth in data volume and usage

| Growth concern | Strategy |
|---|---|
| `exercise_sets` is the largest table (≈ 20–50 rows per workout) | `set_id` is already `BIGINT`; if it reaches hundreds of millions of rows, use **declarative partitioning** (e.g. by workout date range) or hash on `user_id` |
| Many concurrent users | Connection **pooling** (`pg.Pool`, or PgBouncer in production); stateless API that can be replicated behind a load balancer |
| Heavy dashboards | **Materialized views** (e.g. weekly volume per user) refreshed periodically; read **replicas** for analytics |
| Long history lists | **Pagination** (`LIMIT/OFFSET` today; keyset pagination `WHERE (workout_date, workout_id) < (?, ?)` for very deep pages) |
| Old data | Archive workouts older than N years to a history table |
| Data safety | Regular `pg_dump` backups, point-in-time recovery (WAL archiving) |
| Maintenance | `VACUUM/ANALYZE` (autovacuum) keeps statistics fresh so the planner chooses good plans |
| Schema evolution | Versioned migration scripts (e.g. `node-pg-migrate`, Flyway) rather than editing the live schema by hand |
