# 02 – ER Diagram and Data Modelling (PostgreSQL)

## 1. Entities, attributes and keys

| Entity (table) | Primary key | Foreign keys | Other key attributes |
|---|---|---|---|
| `users` | `user_id` | – | `email` (UNIQUE), `full_name`, `password_hash`, `created_at` |
| `user_profiles` | `user_id` | `user_id` → `users` | `date_of_birth`, `gender`, `height_cm`, `fitness_level`, `preferred_unit` |
| `muscle_groups` | `muscle_group_id` | – | `name` (UNIQUE) |
| `exercises` | `exercise_id` | `muscle_group_id` → `muscle_groups` | `name` (UNIQUE), `category` |
| `workouts` | `workout_id` | `user_id` → `users` | `title`, `workout_date`, `duration_min`, `notes` |
| `workout_exercises` | `workout_exercise_id` | `workout_id` → `workouts`, `exercise_id` → `exercises` | `exercise_order`; UNIQUE (`workout_id`,`exercise_id`) |
| `exercise_sets` | `set_id` | `workout_exercise_id` → `workout_exercises` | `set_number`, `reps`, `weight_kg`, `duration_sec`, `distance_km` |
| `goals` | `goal_id` | `user_id` → `users`, `exercise_id` → `exercises` | `target_weight_kg`, `target_date`, `status` |
| `body_measurements` | `measurement_id` | `user_id` → `users` | `measured_on`, `body_weight_kg`; UNIQUE (`user_id`,`measured_on`) |

## 2. Relationships

| Relationship | Type | Implemented by |
|---|---|---|
| `users` – `user_profiles` | **One-to-One** (a profile belongs to exactly one user; a user may have no profile yet) | `user_profiles.user_id` is both PK and FK |
| `users` – `workouts` | **One-to-Many** | `workouts.user_id` FK |
| `users` – `goals` | **One-to-Many** | `goals.user_id` FK |
| `users` – `body_measurements` | **One-to-Many** | `body_measurements.user_id` FK |
| `muscle_groups` – `exercises` | **One-to-Many** | `exercises.muscle_group_id` FK |
| `exercises` – `goals` | **One-to-Many** | `goals.exercise_id` FK |
| `workouts` – `exercises` | **Many-to-Many** (a workout has many exercises; an exercise is used in many workouts) | bridge table `workout_exercises` |
| `workout_exercises` – `exercise_sets` | **One-to-Many** | `exercise_sets.workout_exercise_id` FK |

## 3. ER diagram

> GitHub renders this Mermaid diagram automatically. To export an image for slides, paste the code into <https://mermaid.live>.

```mermaid
erDiagram
    USERS ||--o| USER_PROFILES : "has (1:1)"
    USERS ||--o{ WORKOUTS : "logs (1:N)"
    USERS ||--o{ GOALS : "sets (1:N)"
    USERS ||--o{ BODY_MEASUREMENTS : "records (1:N)"
    MUSCLE_GROUPS ||--o{ EXERCISES : "classifies (1:N)"
    EXERCISES ||--o{ GOALS : "target of (1:N)"
    WORKOUTS ||--o{ WORKOUT_EXERCISES : "contains"
    EXERCISES ||--o{ WORKOUT_EXERCISES : "performed in"
    WORKOUT_EXERCISES ||--o{ EXERCISE_SETS : "has (1:N)"

    USERS {
        int user_id PK
        string full_name
        string email UK
        string password_hash
        timestamptz created_at
    }
    USER_PROFILES {
        int user_id PK, FK
        date date_of_birth
        string gender
        decimal height_cm
        string fitness_level
        string preferred_unit
    }
    MUSCLE_GROUPS {
        int muscle_group_id PK
        string name UK
    }
    EXERCISES {
        int exercise_id PK
        string name UK
        string category
        int muscle_group_id FK
    }
    WORKOUTS {
        int workout_id PK
        int user_id FK
        string title
        date workout_date
        int duration_min
        text notes
        timestamptz created_at
    }
    WORKOUT_EXERCISES {
        int workout_exercise_id PK
        int workout_id FK
        int exercise_id FK
        smallint exercise_order
    }
    EXERCISE_SETS {
        bigint set_id PK
        int workout_exercise_id FK
        smallint set_number
        smallint reps
        decimal weight_kg
        int duration_sec
        decimal distance_km
    }
    GOALS {
        int goal_id PK
        int user_id FK
        int exercise_id FK
        decimal target_weight_kg
        date target_date
        string status
        timestamptz created_at
    }
    BODY_MEASUREMENTS {
        int measurement_id PK
        int user_id FK
        date measured_on
        decimal body_weight_kg
    }
```

### Reading the notation
`||--o{` = one-to-many (one on the left, zero-or-many on the right). `||--o|` = one-to-zero-or-one. The M:N relationship between `WORKOUTS` and `EXERCISES` appears as two one-to-many links meeting at `WORKOUT_EXERCISES`.

## 4. Design notes
- **Why a bridge table?** A relational table cannot store a list in one cell. `workout_exercises` stores one row per *exercise in a workout*, and also carries `exercise_order`, an attribute of the relationship itself.
- **Why `exercise_sets` instead of columns like `set1_reps, set2_reps...`?** Repeating columns break 1NF and limit the number of sets. One row per set has no limit and is easy to aggregate.
- **Why nullable `reps/weight_kg/duration_sec/distance_km`?** One table serves strength (reps + weight) and cardio/timed work (duration + distance). A `CHECK` guarantees every set has at least reps or duration.
