# 01 – Database Selection and Justification

## Selected database: **PostgreSQL**

## 1. Nature of the data

The Workout Tracker stores data about **who** trains, **what** they do, and **how much** they do.

| Data | Nature | Example |
|---|---|---|
| Users and profiles | Structured, one record per person, rarely changes | name, email, height, fitness level |
| Exercise catalogue | Structured reference data shared by all users | "Bench Press – strength – Chest" |
| Workouts | Time-based records owned by one user | "Push Day, 12 Nov 2026, 65 min" |
| Exercises inside a workout | **Many-to-many** link between workouts and the catalogue | One workout has many exercises; one exercise appears in many workouts |
| Sets | High-volume, uniform numeric measurements | reps, weight, duration, distance |
| Goals and body measurements | Structured per-user tracking data | "Bench 80 kg by 31 Dec", "77.6 kg on 16 Nov" |

Every entity has a **fixed, well-known set of attributes**, and the entities are **strongly related** to each other.

## 2. Why PostgreSQL fits this project

| Requirement of the application | How PostgreSQL satisfies it |
|---|---|
| Clear relationships (user → workouts → exercises → sets) | Foreign keys enforce them; JOINs retrieve them in one query |
| Many-to-many between workouts and exercises | Resolved with a bridge table `workout_exercises` |
| Data must stay correct (no negative weights, no orphan sets, no duplicate e-mails) | `CHECK`, `UNIQUE`, `NOT NULL`, `FOREIGN KEY ... ON DELETE CASCADE` |
| Logging a workout writes to 3 tables at once | ACID **transactions**: all rows are saved or none are |
| Analytics: weekly volume, personal records, progress trends | `SUM/AVG/MAX`, `GROUP BY/HAVING`, CTEs, **window functions** (`LAG`) |
| Users grow and logs grow every day | Indexes, partitioning, connection pooling, read replicas |
| Exact numbers for weights and distances | `NUMERIC(6,2)` avoids floating-point rounding errors |
| Free, open-source, well supported by Node.js (`pg`), Python, Java | Mature drivers and ORMs |

## 3. Why not MongoDB for this project?

MongoDB is a good choice when documents have varying shapes or when data is almost always read as one block. Here:

- Cross-entity questions are the **core of the product** (e.g. *"best weight per exercise across all workouts"*, *"volume per muscle group"*). In MongoDB these need multi-stage `$lookup` pipelines; in PostgreSQL they are ordinary JOINs.
- The exercise catalogue is **shared** by all users. Embedding it in every workout would duplicate it and make a rename require thousands of updates; referencing it recreates a relational model without the integrity guarantees.
- Strict constraints (`reps > 0`, one e-mail per user, cascade delete) are enforced **inside** the database in PostgreSQL, instead of only in application code.
- The schema is stable, so the schema-flexibility advantage of MongoDB is not needed.

**Conclusion:** the data is structured, highly relational and integrity-sensitive, so a relational DBMS (PostgreSQL) is the most suitable choice.
