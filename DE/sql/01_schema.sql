-- =====================================================================
-- Workout Tracker  |  DE Integrated Project  |  PostgreSQL 14+
-- 01_schema.sql : tables, constraints, indexes (3NF)
-- Run:  psql -d workout_tracker -f 01_schema.sql
-- =====================================================================

DROP TABLE IF EXISTS exercise_sets;
DROP TABLE IF EXISTS workout_exercises;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS body_measurements;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS muscle_groups;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- 1. USERS -------------------------------------------------------------
CREATE TABLE users (
    user_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT chk_users_email   CHECK (email = LOWER(email) AND email LIKE '%_@_%._%'),
    CONSTRAINT chk_users_name    CHECK (LENGTH(TRIM(full_name)) > 0)
);

-- 2. USER_PROFILES  (1 : 1 with users, optional) -------------------------
CREATE TABLE user_profiles (
    user_id        INTEGER PRIMARY KEY,
    date_of_birth  DATE,
    gender         VARCHAR(10),
    height_cm      NUMERIC(5,1),
    fitness_level  VARCHAR(12) NOT NULL DEFAULT 'beginner',
    preferred_unit VARCHAR(2)  NOT NULL DEFAULT 'kg',
    CONSTRAINT fk_profiles_user   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_profiles_gender CHECK (gender IN ('male','female','other')),
    CONSTRAINT chk_profiles_height CHECK (height_cm BETWEEN 50 AND 260),
    CONSTRAINT chk_profiles_level  CHECK (fitness_level IN ('beginner','intermediate','advanced')),
    CONSTRAINT chk_profiles_unit   CHECK (preferred_unit IN ('kg','lb'))
);

-- 3. MUSCLE_GROUPS (lookup) ----------------------------------------------
CREATE TABLE muscle_groups (
    muscle_group_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    CONSTRAINT uq_muscle_groups_name UNIQUE (name)
);

-- 4. EXERCISES (master catalogue) ----------------------------------------
CREATE TABLE exercises (
    exercise_id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    category        VARCHAR(12)  NOT NULL,
    muscle_group_id INTEGER      NOT NULL,
    CONSTRAINT uq_exercises_name   UNIQUE (name),
    CONSTRAINT chk_exercises_cat   CHECK (category IN ('strength','cardio','flexibility')),
    CONSTRAINT fk_exercises_mg     FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(muscle_group_id) ON DELETE RESTRICT
);

-- 5. WORKOUTS (one session logged by a user) -----------------------------
CREATE TABLE workouts (
    workout_id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INTEGER      NOT NULL,
    title         VARCHAR(100) NOT NULL,
    workout_date  DATE         NOT NULL,
    duration_min  INTEGER,
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workouts_user  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_workouts_dur  CHECK (duration_min IS NULL OR duration_min BETWEEN 1 AND 600)
);

-- 6. WORKOUT_EXERCISES  (resolves M:N  workouts <-> exercises) ------------
CREATE TABLE workout_exercises (
    workout_exercise_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_id          INTEGER  NOT NULL,
    exercise_id         INTEGER  NOT NULL,
    exercise_order      SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT uq_we_workout_exercise UNIQUE (workout_id, exercise_id),
    CONSTRAINT chk_we_order           CHECK (exercise_order > 0),
    CONSTRAINT fk_we_workout   FOREIGN KEY (workout_id)  REFERENCES workouts(workout_id)   ON DELETE CASCADE,
    CONSTRAINT fk_we_exercise  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE RESTRICT
);

-- 7. EXERCISE_SETS (strength: reps+weight | cardio/timed: duration+distance)
CREATE TABLE exercise_sets (
    set_id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workout_exercise_id INTEGER  NOT NULL,
    set_number          SMALLINT NOT NULL,
    reps                SMALLINT,
    weight_kg           NUMERIC(6,2),
    duration_sec        INTEGER,
    distance_km         NUMERIC(6,2),
    CONSTRAINT uq_sets_we_number   UNIQUE (workout_exercise_id, set_number),
    CONSTRAINT chk_sets_number     CHECK (set_number > 0),
    CONSTRAINT chk_sets_reps       CHECK (reps IS NULL OR reps > 0),
    CONSTRAINT chk_sets_weight     CHECK (weight_kg IS NULL OR weight_kg >= 0),
    CONSTRAINT chk_sets_duration   CHECK (duration_sec IS NULL OR duration_sec > 0),
    CONSTRAINT chk_sets_distance   CHECK (distance_km IS NULL OR distance_km >= 0),
    CONSTRAINT chk_sets_has_effort CHECK (reps IS NOT NULL OR duration_sec IS NOT NULL),
    CONSTRAINT fk_sets_we FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(workout_exercise_id) ON DELETE CASCADE
);

-- 8. GOALS (target max weight for an exercise) ---------------------------
CREATE TABLE goals (
    goal_id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           INTEGER      NOT NULL,
    exercise_id       INTEGER      NOT NULL,
    target_weight_kg  NUMERIC(6,2) NOT NULL,
    target_date       DATE         NOT NULL,
    status            VARCHAR(10)  NOT NULL DEFAULT 'active',
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_goals_target  CHECK (target_weight_kg > 0),
    CONSTRAINT chk_goals_status  CHECK (status IN ('active','achieved','abandoned')),
    CONSTRAINT fk_goals_user     FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE,
    CONSTRAINT fk_goals_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE RESTRICT
);

-- 9. BODY_MEASUREMENTS (body-weight tracking) ----------------------------
CREATE TABLE body_measurements (
    measurement_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INTEGER      NOT NULL,
    measured_on     DATE         NOT NULL,
    body_weight_kg  NUMERIC(5,1) NOT NULL,
    CONSTRAINT uq_bm_user_date UNIQUE (user_id, measured_on),
    CONSTRAINT chk_bm_weight   CHECK (body_weight_kg BETWEEN 20 AND 400),
    CONSTRAINT fk_bm_user      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- INDEXES  (PK / UNIQUE constraints already create their own indexes,
-- including uq_we_workout_exercise (workout_id,...) and
-- uq_sets_we_number (workout_exercise_id,...) which serve FK lookups.)
-- ---------------------------------------------------------------------
CREATE INDEX idx_workouts_user_date   ON workouts (user_id, workout_date DESC);
CREATE INDEX idx_we_exercise          ON workout_exercises (exercise_id);
CREATE INDEX idx_exercises_muscle     ON exercises (muscle_group_id);
CREATE INDEX idx_exercises_category   ON exercises (category);
CREATE INDEX idx_goals_user_exercise  ON goals (user_id, exercise_id);
CREATE INDEX idx_goals_active         ON goals (user_id) WHERE status = 'active';
