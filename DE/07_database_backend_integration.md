# 07 – Database ↔ Backend Integration

## 1. How the backend talks to the database

```
React / HTML front-end ──HTTP+JSON──▶ Express routes ──SQL (parameterised)──▶ pg Connection Pool ──TCP 5432──▶ PostgreSQL
        ◀────────────JSON───────────        ◀──────────── rows ────────────          ◀───────────────────────
```

| Layer | File | Responsibility |
|---|---|---|
| Connection | [`integration/src/db.js`](integration/src/db.js) | One shared `pg.Pool` (max 10 connections); `query()` helper; `withTransaction()` helper (BEGIN / COMMIT / ROLLBACK) |
| Routes | [`integration/src/routes/*.js`](integration/src/routes) | Validate input, run SQL, return JSON |
| Errors | [`integration/src/errors.js`](integration/src/errors.js) | Converts PostgreSQL error codes (23505, 23514, …) into HTTP 409 / 400 |
| Entry | [`integration/src/server.js`](integration/src/server.js) | Starts Express, mounts routes, `/api/health` checks DB connectivity |

The integration uses the **raw `pg` driver with hand-written SQL** (no ORM), so every database operation is visible and explainable. All values are passed as **parameters (`$1, $2, …`)**, never concatenated into the SQL text; this prevents SQL injection.

## 2. Feature → database operation map

| App feature | HTTP endpoint | SQL operation | Tables |
|---|---|---|---|
| Sign up | `POST /api/users/register` | `INSERT` ×2 in a transaction (user + profile) | users, user_profiles |
| View / edit profile | `GET /api/users/:id`, `PATCH /api/users/:id/profile` | `SELECT … LEFT JOIN`, `UPDATE … COALESCE` | users, user_profiles |
| Pick an exercise | `GET /api/exercises?category=` | `SELECT … JOIN … WHERE … ORDER BY` | exercises, muscle_groups |
| **Log a workout** | `POST /api/workouts` | `INSERT` ×(1 + n + m) in **one transaction** | workouts, workout_exercises, exercise_sets |
| History list | `GET /api/workouts?userId&from&to` | `SELECT … WHERE … ORDER BY … LIMIT/OFFSET` (Q1) | workouts |
| Workout detail | `GET /api/workouts/:id` | 4-table `JOIN` (Q2) | all workout tables |
| Edit workout / set | `PATCH /api/workouts/:id`, `PATCH /api/workouts/sets/:setId` | `UPDATE … WHERE` (Q12) | workouts, exercise_sets |
| Delete workout | `DELETE /api/workouts/:id` | `DELETE` + `CASCADE` (Q13) | workouts → children |
| Dashboard charts | `GET /api/stats/:userId/volume`, `/muscle-groups` | `SUM / COUNT / GROUP BY / HAVING` (Q3, Q4) | workouts, sets, exercises |
| Personal records | `GET /api/stats/:userId/records` | `MAX … GROUP BY` (Q5) | workouts, sets, exercises |
| Goals | `GET /api/stats/:userId/goals` | CTE + `JOIN` (Q9) | goals, sets |
| Body-weight log | `POST/GET /api/stats/:userId/body-weight` | `INSERT … ON CONFLICT DO UPDATE` (UPSERT), `LAG()` window (Q10) | body_measurements |

## 3. The transaction behind "Log a workout"

```js
await withTransaction(async (db) => {
  const w  = await db.query('INSERT INTO workouts ... RETURNING workout_id', [...]);
  for each exercise:
      const we = await db.query('INSERT INTO workout_exercises ... RETURNING workout_exercise_id', [...]);
      for each set:
          await db.query('INSERT INTO exercise_sets ...', [...]);
});   // COMMIT here; any error above => ROLLBACK, nothing is saved
```
If the 5th set violates a `CHECK` constraint, the workout, the exercises and the first four sets are all rolled back, so the database never contains a half-saved workout.

## 4. Running the integration

```bash
# 1. database
cd sql && ./run_all.sh workout_tracker          # or run the 4 .sql files manually with psql -f

# 2. backend
cd ../integration
cp .env.example .env                            # set DATABASE_URL
npm install
npm start                                       # http://localhost:5000

# 3. test (examples) - the IDs 15 / 74 below assume a freshly seeded DB; use the id returned by the POST call
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/workouts -H "Content-Type: application/json" -d '{
  "userId": 1, "title": "Push Day", "workoutDate": "2026-11-20", "durationMin": 60,
  "exercises": [ { "exerciseId": 1, "sets": [
        {"reps":10,"weightKg":65}, {"reps":8,"weightKg":70}, {"reps":6,"weightKg":75} ] } ] }'

curl "http://localhost:5000/api/workouts?userId=1&from=2026-11-01"
curl http://localhost:5000/api/workouts/15
curl -X PATCH http://localhost:5000/api/workouts/sets/74 -H "Content-Type: application/json" -d '{"weightKg":77.5}'
curl -X DELETE http://localhost:5000/api/workouts/15
curl http://localhost:5000/api/stats/1/records
```

Verify in the database after each call (this is the "data entered through the app is reflected in the DB" proof):
```sql
SELECT * FROM workouts ORDER BY workout_id DESC LIMIT 3;
SELECT * FROM exercise_sets ORDER BY set_id DESC LIMIT 5;
```

## 5. Evidence to collect (put in `evidence/`)
See [`evidence/README.md`](evidence/README.md): screenshots of the app screen → API response → `psql` rows, for Create, Read, Update and Delete.

## 6. Adapting to your existing backend
If your project already has a backend in another stack (Spring Boot, Django, Flask, …), keep the **SQL in this folder unchanged** and replace only `integration/src/*`. The mapping table in section 2 tells you which query each endpoint needs.
