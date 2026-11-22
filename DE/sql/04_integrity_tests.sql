-- =====================================================================
-- 04_integrity_tests.sql : every statement below is EXPECTED TO FAIL
-- (except the last one) - this proves the constraints protect the data.
-- Run (do not stop on error):  psql -d workout_tracker -f 04_integrity_tests.sql
-- =====================================================================

-- T1  Duplicate e-mail                      -> unique violation (uq_users_email)
INSERT INTO users (full_name, email, password_hash) VALUES ('Fake Sarthak', 'sarthak@example.com', 'x');

-- T2  Negative weight                       -> check violation (chk_sets_weight)
INSERT INTO exercise_sets (workout_exercise_id, set_number, reps, weight_kg) VALUES (1, 9, 10, -5);

-- T3  Set with neither reps nor duration    -> check violation (chk_sets_has_effort)
INSERT INTO exercise_sets (workout_exercise_id, set_number, weight_kg) VALUES (1, 10, 50);

-- T4  Workout for a non-existent user       -> foreign key violation (fk_workouts_user)
INSERT INTO workouts (user_id, title, workout_date) VALUES (999, 'Ghost Workout', '2026-11-20');

-- T5  Missing mandatory title               -> not-null violation
INSERT INTO workouts (user_id, title, workout_date) VALUES (1, NULL, '2026-11-20');

-- T6  Same exercise twice in one workout    -> unique violation (uq_we_workout_exercise)
INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (1, 1, 9);

-- T7  Delete an exercise that has history   -> foreign key violation (RESTRICT, fk_we_exercise)
DELETE FROM exercises WHERE exercise_id = 1;

-- T8  Invalid goal status                   -> check violation (chk_goals_status)
UPDATE goals SET status = 'paused' WHERE goal_id = 1;

-- T9  Two body-weight entries on one day    -> unique violation (uq_bm_user_date)
INSERT INTO body_measurements (user_id, measured_on, body_weight_kg) VALUES (1, '2026-11-16', 77.0);

-- T10 SAME data handled gracefully with an UPSERT -> succeeds (duplicate resolved, value corrected)
INSERT INTO body_measurements (user_id, measured_on, body_weight_kg) VALUES (1, '2026-11-16', 77.0)
ON CONFLICT (user_id, measured_on) DO UPDATE SET body_weight_kg = EXCLUDED.body_weight_kg;
