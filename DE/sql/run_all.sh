#!/usr/bin/env bash
# Usage:  ./run_all.sh [database_name]     (default: workout_tracker)
# Creates the database if needed, then builds schema, loads data, runs queries.
set -e
DB="${1:-workout_tracker}"
cd "$(dirname "$0")"
createdb "$DB" 2>/dev/null || echo "(database $DB already exists)"
psql -d "$DB" -v ON_ERROR_STOP=1 -f 01_schema.sql
psql -d "$DB" -v ON_ERROR_STOP=1 -f 02_seed.sql
psql -d "$DB" -f 03_queries.sql | tee ../evidence/queries_output.txt
psql -d "$DB" -f 04_integrity_tests.sql 2>&1 | tee ../evidence/integrity_tests_output.txt
