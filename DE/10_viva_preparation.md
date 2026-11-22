# 10 – Viva Preparation (every team member should be able to answer these)

**Why PostgreSQL and not MongoDB?**
The data is structured and heavily related (user → workout → exercise → set). Our core features are cross-table calculations (personal records, volume per muscle group), which are JOINs and aggregates in SQL. Constraints such as `reps > 0` and unique e-mails are enforced in the database itself.

**Where is the many-to-many relationship?**
Between `workouts` and `exercises`. A workout contains many exercises and an exercise appears in many workouts. It is resolved by the bridge table `workout_exercises`.

**Where is the one-to-one relationship?**
`users` – `user_profiles`. The profile's primary key is also a foreign key to `users`.

**Explain 1NF, 2NF, 3NF using your project.**
1NF: the log had several exercises and sets in one cell → one row per set. 2NF: workout and exercise details depended on only part of the key `(workout_id, exercise_id, set_number)` → separate `workouts`, `exercises`, `workout_exercises` tables. 3NF: `user_name` depended on `user_id`, not on `workout_id`, and the muscle-group name depended on `muscle_group_id` → `users` and `muscle_groups` tables.

**What is a functional dependency? Give one.**
`A → B` if each value of A determines exactly one value of B. Example: `exercise_id → name, category, muscle_group_id`.

**Why `ON DELETE CASCADE` on `exercise_sets` but `RESTRICT` on `exercises`?**
Sets belong to a workout and have no meaning alone. Exercises are a shared catalogue; deleting one that has history would damage other users' data.

**What happens if the server crashes while saving a workout?**
The save runs in a transaction. Without `COMMIT`, PostgreSQL discards the partial work, so there is never a half-saved workout.

**What is the difference between `WHERE` and `HAVING`?**
`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation (Q4: muscle groups with at least 9 sets).

**Why `LEFT JOIN` in Q8?**
To include users with no workouts. An `INNER JOIN` would drop them.

**`NOT IN` vs `NOT EXISTS`?**
`NOT IN` returns nothing if the subquery contains a NULL; `NOT EXISTS` is NULL-safe (Q7).

**How do you prevent SQL injection?**
Parameterised queries: values go in `$1, $2…` and are never concatenated into SQL text.

**Which indexes did you add and why?**
`(user_id, workout_date DESC)` for the history list; `exercise_id` on the bridge table for record lookups; a partial index for active goals. PK/UNIQUE constraints already create indexes, including those that serve FK joins.

**How does it scale?**
Pooling, indexes, pagination, materialized views for dashboards, partitioning `exercise_sets` by date if it becomes huge, read replicas.

**Live demo checklist**
1. Show tables: `\dt` and `\d exercise_sets` in `psql`.
2. Run 2–3 queries from `sql/03_queries.sql` and explain the output.
3. Create a workout from the app/API, then `SELECT` it in `psql`.
4. Trigger a constraint error (e.g. negative weight) and show the 400 response.
5. Delete a workout and show the cascade.
