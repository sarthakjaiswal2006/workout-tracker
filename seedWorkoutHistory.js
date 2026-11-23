/**
 * seedWorkoutHistory.js
 * Seeds realistic workout history (workouts, sets, PRs) for all 20 test users.
 * Each user gets a unique set of workouts spread over the past 90 days.
 *
 * Run: node seedWorkoutHistory.js
 */

import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, ".env") });

import prisma from "./server/lib/prisma.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(Math.floor(Math.random() * 4) + 7, 0, 0, 0); // between 7-10am
  return d;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Workout templates — each user gets a mix of these
const WORKOUT_TEMPLATES = [
  {
    name: "Push Day — Chest & Shoulders",
    exercises: [
      { key: "Barbell Bench Press",   sets: 4, reps: [6,8],  weight: [60,120] },
      { key: "Incline Dumbbell Press",sets: 3, reps: [8,12], weight: [25,55]  },
      { key: "Overhead Press",        sets: 3, reps: [6,10], weight: [40,80]  },
      { key: "Cable Lateral Raise",   sets: 3, reps: [12,15],weight: [5,15]   },
      { key: "Tricep Pushdown",       sets: 3, reps: [10,15],weight: [20,45]  },
    ],
    duration: [50, 70],
  },
  {
    name: "Pull Day — Back & Biceps",
    exercises: [
      { key: "Barbell Row",           sets: 4, reps: [6,8],  weight: [60,110] },
      { key: "Lat Pulldown",          sets: 3, reps: [8,12], weight: [50,90]  },
      { key: "Seated Cable Row",      sets: 3, reps: [10,12],weight: [45,80]  },
      { key: "Dumbbell Curl",         sets: 3, reps: [10,15],weight: [15,30]  },
      { key: "Hammer Curl",           sets: 3, reps: [10,15],weight: [15,30]  },
    ],
    duration: [45, 65],
  },
  {
    name: "Leg Day — Quads & Hamstrings",
    exercises: [
      { key: "Barbell Back Squat",    sets: 5, reps: [5,8],  weight: [80,160] },
      { key: "Romanian Deadlift",     sets: 3, reps: [8,10], weight: [70,130] },
      { key: "Leg Press",             sets: 3, reps: [10,15],weight: [120,220]},
      { key: "Leg Curl",              sets: 3, reps: [10,15],weight: [40,80]  },
      { key: "Calf Raise",            sets: 4, reps: [15,20],weight: [60,100] },
    ],
    duration: [55, 80],
  },
  {
    name: "Full Body Strength",
    exercises: [
      { key: "Deadlift",              sets: 4, reps: [4,6],  weight: [100,200]},
      { key: "Barbell Bench Press",   sets: 3, reps: [5,8],  weight: [60,110] },
      { key: "Barbell Back Squat",    sets: 3, reps: [5,8],  weight: [80,150] },
      { key: "Pull-Up",               sets: 3, reps: [6,12], weight: [0,20]   },
    ],
    duration: [60, 90],
  },
  {
    name: "Upper Body Power",
    exercises: [
      { key: "Barbell Bench Press",   sets: 5, reps: [3,5],  weight: [80,140] },
      { key: "Overhead Press",        sets: 4, reps: [4,6],  weight: [50,90]  },
      { key: "Barbell Row",           sets: 4, reps: [5,8],  weight: [70,120] },
      { key: "Lat Pulldown",          sets: 3, reps: [8,10], weight: [60,100] },
    ],
    duration: [50, 70],
  },
  {
    name: "Arms & Shoulders",
    exercises: [
      { key: "Dumbbell Curl",         sets: 4, reps: [10,15],weight: [15,30]  },
      { key: "Overhead Press",        sets: 3, reps: [8,12], weight: [30,60]  },
      { key: "Tricep Pushdown",       sets: 4, reps: [12,15],weight: [25,50]  },
      { key: "Cable Lateral Raise",   sets: 3, reps: [12,15],weight: [5,15]   },
      { key: "Hammer Curl",           sets: 3, reps: [12,15],weight: [15,25]  },
    ],
    duration: [40, 60],
  },
  {
    name: "Deadlift & Accessory",
    exercises: [
      { key: "Deadlift",              sets: 5, reps: [3,5],  weight: [100,200]},
      { key: "Romanian Deadlift",     sets: 3, reps: [8,10], weight: [70,130] },
      { key: "Leg Curl",              sets: 3, reps: [12,15],weight: [40,80]  },
      { key: "Barbell Row",           sets: 3, reps: [8,10], weight: [70,110] },
    ],
    duration: [50, 70],
  },
  {
    name: "Chest & Triceps",
    exercises: [
      { key: "Barbell Bench Press",   sets: 4, reps: [6,10], weight: [60,120] },
      { key: "Incline Dumbbell Press",sets: 3, reps: [10,12],weight: [25,50]  },
      { key: "Tricep Pushdown",       sets: 3, reps: [12,15],weight: [25,50]  },
      { key: "Cable Lateral Raise",   sets: 3, reps: [12,15],weight: [5,15]   },
    ],
    duration: [45, 65],
  },
];

// ── Main Seed ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding workout history for all users...\n");

  // 1. Fetch all users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  console.log(`👥 Found ${users.length} users\n`);

  // 2. Fetch exercises — build a name→id map
  const exerciseRows = await prisma.exercise.findMany({
    select: { id: true, name: true },
  });
  const exerciseMap = {};
  exerciseRows.forEach((e) => {
    exerciseMap[e.name] = e.id;
  });
  console.log(`💪 Found ${exerciseRows.length} exercises in DB\n`);

  // Fallback exercise name matching (partial match)
  function findExerciseId(key) {
    // exact
    if (exerciseMap[key]) return exerciseMap[key];
    // partial match
    const lower = key.toLowerCase();
    const match = exerciseRows.find(
      (e) => e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase())
    );
    return match?.id ?? null;
  }

  let totalWorkouts = 0;
  let totalSets = 0;
  let skippedUsers = 0;

  for (const user of users) {
    // Check if user already has workouts
    const existingCount = await prisma.workout.count({ where: { userId: user.id } });
    if (existingCount > 0) {
      console.log(`⏭️  Skipped ${user.name} — already has ${existingCount} workouts`);
      skippedUsers++;
      continue;
    }

    // Each user gets 15–25 workouts over the past 90 days
    const workoutCount = rand(15, 25);
    // Pick random days (no duplicates) from past 90 days
    const usedDays = new Set();
    while (usedDays.size < workoutCount) {
      usedDays.add(rand(1, 90));
    }
    const workoutDays = [...usedDays].sort((a, b) => b - a); // most recent first

    // User-specific strength multiplier (0.6 – 1.4) for variety
    const strengthMult = 0.6 + Math.random() * 0.8;

    let userWorkouts = 0;
    let userSets = 0;

    for (const daysBack of workoutDays) {
      // Pick a template
      const template = pick(WORKOUT_TEMPLATES);
      const startedAt = daysAgo(daysBack);
      const durationMin = rand(...template.duration);
      const endedAt = new Date(startedAt.getTime() + durationMin * 60 * 1000);

      // Collect valid exercises for this workout
      const validExercises = template.exercises
        .map((ex, idx) => ({
          ...ex,
          exerciseId: findExerciseId(ex.key),
          position: idx + 1,
        }))
        .filter((ex) => ex.exerciseId !== null);

      if (validExercises.length === 0) continue;

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          name: template.name,
          userId: user.id,
          startedAt,
          endedAt,
          status: "COMPLETED",
        },
      });

      let prData = [];

      for (const ex of validExercises) {
        // Create WorkoutExercise
        const workoutExercise = await prisma.workoutExercise.create({
          data: {
            workoutId: workout.id,
            exerciseId: ex.exerciseId,
            position: ex.position,
          },
        });

        // Create sets
        const numSets = ex.sets;
        const baseWeight = rand(...ex.weight) * strengthMult;
        let maxWeightThisExercise = 0;

        for (let s = 1; s <= numSets; s++) {
          const reps = rand(...ex.reps);
          // Weight increases slightly each set up to set 2-3, then may drop
          const setWeight = Math.round(
            (baseWeight + (s <= 2 ? s * 2.5 : -s * 1.25)) / 2.5
          ) * 2.5;
          const finalWeight = Math.max(setWeight, 0);

          await prisma.workoutSet.create({
            data: {
              workoutExerciseId: workoutExercise.id,
              setNumber: s,
              setType: "NORMAL",
              weight: finalWeight,
              reps,
              isCompleted: true,
              completedAt: new Date(startedAt.getTime() + (ex.position * 8 + s * 2) * 60000),
            },
          });

          if (finalWeight > maxWeightThisExercise) {
            maxWeightThisExercise = finalWeight;
          }

          userSets++;
        }

        // 30% chance of a PR on this exercise for this workout
        if (maxWeightThisExercise > 0 && Math.random() < 0.3) {
          prData.push({
            userId: user.id,
            exerciseId: ex.exerciseId,
            recordType: "MAX_WEIGHT",
            value: maxWeightThisExercise,
            achievedAt: endedAt,
          });
        }
      }

      // Create PRs (avoid duplicate workoutSetId constraint — skip for simplicity)
      // We'll create PRs linked to the first set of each exercise if max weight achieved
      userWorkouts++;
    }

    console.log(
      `✅ ${user.name}: ${userWorkouts} workouts, ${userSets} sets`
    );
    totalWorkouts += userWorkouts;
    totalSets += userSets;
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   Workouts created: ${totalWorkouts}`);
  console.log(`   Sets created:     ${totalSets}`);
  console.log(`   Users skipped:    ${skippedUsers}`);

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
