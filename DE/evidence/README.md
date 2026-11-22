# Evidence

Add your own screenshots / terminal output here **before submission** (the examiners expect proof that *your* database ran).

| File to add | How to produce it |
|---|---|
| `01_schema_created.png` | `psql -d workout_tracker -c "\dt"` and `\d exercise_sets` |
| `02_sample_data.png` | `SELECT COUNT(*) …` or a few `SELECT * … LIMIT 5` |
| `queries_output.txt` | created automatically by `sql/run_all.sh` |
| `integrity_tests_output.txt` | created automatically by `sql/run_all.sh` |
| `03_app_create_workout.png` | App screen / Postman / curl showing a workout being created |
| `04_db_row_after_create.png` | `SELECT * FROM workouts ORDER BY workout_id DESC LIMIT 3;` showing the same workout |
| `05_app_update.png` + `06_db_after_update.png` | Edit a set in the app, then `SELECT` it in `psql` |
| `07_app_delete.png` + `08_db_after_delete.png` | Delete a workout, show the rows are gone (including its sets) |
| `09_constraint_error.png` | API response (HTTP 400/409) for invalid input |
