-- =====================================================================
-- 02_seed.sql : sample data (IDs are generated in insert order, 1,2,3...)
-- Run AFTER 01_schema.sql on an empty database.
-- =====================================================================

INSERT INTO users (full_name, email, password_hash) VALUES
 ('Sarthak Jaiswal', 'sarthak@example.com', '$2b$10$sampleHashForSarthak0000000000000000000000000000'),   -- 1
 ('Aarav Mehta',     'aarav@example.com',   '$2b$10$sampleHashForAarav000000000000000000000000000000'),   -- 2
 ('Priya Nair',      'priya@example.com',   '$2b$10$sampleHashForPriya000000000000000000000000000000'),   -- 3
 ('Rohan Singh',     'rohan@example.com',   '$2b$10$sampleHashForRohan000000000000000000000000000000');   -- 4 (new user, no data yet)

INSERT INTO user_profiles (user_id, date_of_birth, gender, height_cm, fitness_level, preferred_unit) VALUES
 (1, '2004-03-12', 'male',   175.0, 'intermediate', 'kg'),
 (2, '1999-07-21', 'male',   180.5, 'beginner',     'kg'),
 (3, '2001-11-02', 'female', 162.0, 'advanced',     'kg');

INSERT INTO muscle_groups (name) VALUES
 ('Chest'),      -- 1
 ('Back'),       -- 2
 ('Legs'),       -- 3
 ('Shoulders'),  -- 4
 ('Arms'),       -- 5
 ('Core'),       -- 6
 ('Cardio');     -- 7

INSERT INTO exercises (name, category, muscle_group_id) VALUES
 ('Bench Press',           'strength',    1),  -- 1
 ('Incline Dumbbell Press','strength',    1),  -- 2
 ('Deadlift',              'strength',    2),  -- 3
 ('Pull-Up',               'strength',    2),  -- 4
 ('Squat',                 'strength',    3),  -- 5
 ('Leg Press',             'strength',    3),  -- 6
 ('Overhead Press',        'strength',    4),  -- 7
 ('Bicep Curl',            'strength',    5),  -- 8
 ('Plank',                 'strength',    6),  -- 9
 ('Running',               'cardio',      7),  -- 10
 ('Cycling',               'cardio',      7),  -- 11
 ('Yoga Flow',             'flexibility', 6),  -- 12
 ('Rowing Machine',        'cardio',      7),  -- 13 (never logged yet)
 ('Lunges',                'strength',    3);  -- 14 (never logged yet)

INSERT INTO workouts (user_id, title, workout_date, duration_min, notes) VALUES
 (1, 'Push Day',    '2026-10-26', 60, 'Felt strong'),            -- 1
 (1, 'Pull Day',    '2026-10-28', 55, NULL),                     -- 2
 (1, 'Leg Day',     '2026-10-30', 70, 'Heavy squats'),           -- 3
 (1, 'Push Day',    '2026-11-02', 62, NULL),                     -- 4
 (1, 'Morning Run', '2026-11-04', 35, 'Easy pace'),              -- 5
 (1, 'Pull Day',    '2026-11-06', 58, NULL),                     -- 6
 (1, 'Leg Day',     '2026-11-09', 72, 'New squat PR'),           -- 7
 (1, 'Push Day',    '2026-11-12', 65, 'Bench PR'),               -- 8
 (2, 'Full Body',   '2026-11-03', 50, 'First week at the gym'),  -- 9
 (2, 'Cycling',     '2026-11-08', 45, NULL),                     -- 10
 (2, 'Full Body',   '2026-11-15', 55, NULL),                     -- 11
 (3, 'Yoga & Core', '2026-11-05', 40, NULL),                     -- 12
 (3, 'Morning Run', '2026-11-10', 30, NULL),                     -- 13
 (3, 'Yoga & Core', '2026-11-17', 40, NULL);                     -- 14

INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES
 (1, 1, 1), (1, 2, 2), (1, 7, 3),      -- we 1,2,3   (w1 Bench, Incline, OHP)
 (2, 3, 1), (2, 4, 2), (2, 8, 3),      -- we 4,5,6   (w2 Deadlift, Pull-Up, Curl)
 (3, 5, 1), (3, 6, 2), (3, 9, 3),      -- we 7,8,9   (w3 Squat, Leg Press, Plank)
 (4, 1, 1), (4, 7, 2), (4, 2, 3),      -- we 10,11,12 (w4 Bench, OHP, Incline)
 (5, 10, 1),                           -- we 13      (w5 Running)
 (6, 3, 1), (6, 4, 2), (6, 8, 3),      -- we 14,15,16 (w6 Deadlift, Pull-Up, Curl)
 (7, 5, 1), (7, 6, 2),                 -- we 17,18   (w7 Squat, Leg Press)
 (8, 1, 1), (8, 2, 2), (8, 7, 3),      -- we 19,20,21 (w8 Bench, Incline, OHP)
 (9, 5, 1), (9, 1, 2), (9, 4, 3),      -- we 22,23,24 (w9 Squat, Bench, Pull-Up)
 (10, 11, 1),                          -- we 25      (w10 Cycling)
 (11, 5, 1), (11, 1, 2), (11, 3, 3),   -- we 26,27,28 (w11 Squat, Bench, Deadlift)
 (12, 12, 1), (12, 9, 2),              -- we 29,30   (w12 Yoga, Plank)
 (13, 10, 1),                          -- we 31      (w13 Running)
 (14, 12, 1), (14, 9, 2);              -- we 32,33   (w14 Yoga, Plank)

-- Strength sets: (workout_exercise_id, set_number, reps, weight_kg)
INSERT INTO exercise_sets (workout_exercise_id, set_number, reps, weight_kg) VALUES
 (1,1,10,60),(1,2,8,65),(1,3,6,70),
 (2,1,10,22.5),(2,2,10,22.5),(2,3,8,25),
 (3,1,10,35),(3,2,8,37.5),(3,3,8,37.5),
 (4,1,5,100),(4,2,5,110),(4,3,3,120),
 (5,1,8,0),(5,2,7,0),(5,3,6,0),
 (6,1,12,12.5),(6,2,10,15),
 (7,1,8,80),(7,2,8,85),(7,3,6,90),
 (8,1,12,140),(8,2,10,160),
 (10,1,10,62.5),(10,2,8,67.5),(10,3,6,72.5),
 (11,1,10,37.5),(11,2,8,40),
 (12,1,10,25),(12,2,8,27.5),
 (14,1,5,110),(14,2,5,120),(14,3,3,125),
 (15,1,9,0),(15,2,8,0),(15,3,6,0),
 (16,1,12,15),(16,2,10,15),
 (17,1,8,85),(17,2,8,90),(17,3,5,95),
 (18,1,12,150),(18,2,10,170),
 (19,1,10,65),(19,2,8,70),(19,3,6,75),
 (20,1,10,25),(20,2,10,27.5),
 (21,1,10,40),(21,2,8,42.5),
 (22,1,10,60),(22,2,8,65),
 (23,1,10,50),(23,2,8,55),
 (24,1,5,0),(24,2,4,0),
 (26,1,10,65),(26,2,8,70),(26,3,6,75),
 (27,1,10,55),(27,2,8,57.5),
 (28,1,5,80),(28,2,5,90);

-- Timed / cardio sets: (workout_exercise_id, set_number, duration_sec, distance_km)
INSERT INTO exercise_sets (workout_exercise_id, set_number, duration_sec, distance_km) VALUES
 (9,1,60,NULL),(9,2,75,NULL),            -- Plank
 (13,1,2100,5.2),                        -- Running
 (25,1,2700,18.5),                       -- Cycling
 (29,1,1500,NULL),                       -- Yoga
 (30,1,45,NULL),(30,2,50,NULL),          -- Plank
 (31,1,1800,4.1),                        -- Running
 (32,1,1800,NULL),                       -- Yoga
 (33,1,60,NULL),(33,2,60,NULL);          -- Plank

INSERT INTO goals (user_id, exercise_id, target_weight_kg, target_date, status) VALUES
 (1, 1, 80,  '2026-12-31', 'active'),     -- Bench 80 kg
 (1, 3, 140, '2026-12-15', 'active'),     -- Deadlift 140 kg
 (1, 5, 90,  '2026-11-01', 'achieved'),   -- Squat 90 kg
 (2, 5, 100, '2027-01-31', 'active');     -- Squat 100 kg

INSERT INTO body_measurements (user_id, measured_on, body_weight_kg) VALUES
 (1,'2026-10-26',78.5),(1,'2026-11-02',78.0),(1,'2026-11-09',77.4),(1,'2026-11-16',77.6),
 (2,'2026-11-03',82.0),(2,'2026-11-17',81.2),
 (3,'2026-11-05',58.4),(3,'2026-11-19',58.0);
