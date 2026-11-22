# DE Integrated Project – Workout Tracker Database

**Subject:** Data Engineering (DE)  **Database:** PostgreSQL 14+  **Backend integration:** Node.js + Express + `pg`

**Team members:** _<add names / roll numbers>_

## What this folder contains

| Deliverable required | Where it is |
|---|---|
| Database selection and justification | [`01_database_selection_and_justification.md`](01_database_selection_and_justification.md) |
| ER diagram | [`02_er_diagram.md`](02_er_diagram.md) (Mermaid, renders on GitHub) |
| Normalization (1NF, 2NF, 3NF) | [`03_normalization.md`](03_normalization.md) |
| Final database schema | [`04_final_schema.md`](04_final_schema.md) · executable DDL: [`sql/01_schema.sql`](sql/01_schema.sql) |
| Sample records | [`06_sample_records.md`](06_sample_records.md) · [`sql/02_seed.sql`](sql/02_seed.sql) |
| ≥ 10 project-specific queries with explanations and outputs | [`05_queries_and_outputs.md`](05_queries_and_outputs.md) (13 queries) · [`sql/03_queries.sql`](sql/03_queries.sql) |
| Evidence of database–backend integration | [`07_database_backend_integration.md`](07_database_backend_integration.md) · code in [`integration/`](integration) · screenshots in [`evidence/`](evidence) |
| Data integrity and performance | [`08_integrity_and_performance.md`](08_integrity_and_performance.md) · [`sql/04_integrity_tests.sql`](sql/04_integrity_tests.sql) |
| Database architecture and decisions | [`09_architecture_and_design_decisions.md`](09_architecture_and_design_decisions.md) |
| Viva preparation | [`10_viva_preparation.md`](10_viva_preparation.md) |

## Database at a glance

9 tables in 3NF: `users`, `user_profiles` (1:1), `muscle_groups`, `exercises`, `workouts`, `workout_exercises` (M:N bridge), `exercise_sets`, `goals`, `body_measurements`.

## Quick start

```bash
# Requires PostgreSQL (psql, createdb on PATH) and Node.js 18+
cd DE/sql
./run_all.sh workout_tracker        # create DB, schema, sample data, run queries + integrity tests

cd ../integration
cp .env.example .env                # edit DATABASE_URL if needed
npm install
npm start                           # API on http://localhost:5000  (try /api/health)
```

No shell script? Run manually: `psql -d workout_tracker -f sql/01_schema.sql`, then `02_seed.sql`, `03_queries.sql`, `04_integrity_tests.sql`.

## Before you submit
1. Run `sql/run_all.sh` on your machine and keep the generated files in `evidence/`.
2. Run the backend and add the screenshots listed in [`evidence/README.md`](evidence/README.md).
3. If your app uses different entities or field names, adjust `sql/` and the docs to match (the mapping table in doc 07 shows which query serves which feature).
4. Fill in the team member names above; every member should read `10_viva_preparation.md`.
