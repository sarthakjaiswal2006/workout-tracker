require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const USER_EMAIL = "sarthak.demo@example.com";

const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
];

const exercises = [
  ["Bench Press", "Barbell", "Compound", ["Chest", "Triceps", "Shoulders"]],
  ["Incline Dumbbell Press", "Dumbbell", "Compound", ["Chest", "Shoulders", "Triceps"]],
  ["Chest Fly", "Cable", "Isolation", ["Chest"]],
  ["Push Ups", "Bodyweight", "Compound", ["Chest", "Triceps"]],
  ["Lat Pulldown", "Cable", "Compound", ["Back", "Biceps"]],
  ["Seated Cable Row", "Cable", "Compound", ["Back", "Biceps"]],
  ["Barbell Row", "Barbell", "Compound", ["Back", "Biceps"]],
  ["Deadlift", "Barbell", "Compound", ["Back", "Hamstrings", "Glutes"]],
  ["Shoulder Press", "Dumbbell", "Compound", ["Shoulders", "Triceps"]],
  ["Lateral Raises", "Dumbbell", "Isolation", ["Shoulders"]],
  ["Rear Delt Fly", "Cable", "Isolation", ["Shoulders"]],
  ["Barbell Curl", "Barbell", "Isolation", ["Biceps"]],
  ["Hammer Curl", "Dumbbell", "Isolation", ["Biceps"]],
  ["Triceps Pushdown", "Cable", "Isolation", ["Triceps"]],
  ["Overhead Triceps Extension", "Dumbbell", "Isolation", ["Triceps"]],
  ["Squat", "Barbell", "Compound", ["Quadriceps", "Glutes"]],
  ["Leg Press", "Machine", "Compound", ["Quadriceps", "Glutes"]],
  ["Leg Extension", "Machine", "Isolation", ["Quadriceps"]],
  ["Leg Curl", "Machine", "Isolation", ["Hamstrings"]],
  ["Romanian Deadlift", "Barbell", "Compound", ["Hamstrings", "Glutes"]],
  ["Hip Thrust", "Barbell", "Compound", ["Glutes", "Hamstrings"]],
  ["Walking Lunges", "Dumbbell", "Compound", ["Quadriceps", "Glutes"]],
  ["Calf Raises", "Machine", "Isolation", ["Quadriceps"]],
  ["Pull Ups", "Bodyweight", "Compound", ["Back", "Biceps"]],
];

const workoutPlans = [
  {
    name: "Push Day",
    exercises: [
      ["Bench Press", 3],
      ["Incline Dumbbell Press", 3],
      ["Shoulder Press", 3],
      ["Lateral Raises", 3],
      ["Triceps Pushdown", 3],
    ],
  },
  {
    name: "Pull Day",
    exercises: [
      ["Lat Pulldown", 3],
      ["Seated Cable Row", 3],
      ["Barbell Row", 3],
      ["Barbell Curl", 3],
      ["Hammer Curl", 3],
    ],
  },
  {
    name: "Leg Day",
    exercises: [
      ["Squat", 3],
      ["Leg Press", 3],
      ["Leg Extension", 3],
      ["Leg Curl", 3],
      ["Romanian Deadlift", 3],
    ],
  },
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date;
}

function roundWeight(value) {
  return Math.round(value * 2) / 2;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
  });

  if (!user) {
    throw new Error(
      `User not found for ${USER_EMAIL}. Check your existing database user.`
    );
  }

  console.log(`Seeding data for ${user.name}...`);

  // Create or reuse muscle groups.
  const muscleGroupMap = {};

  for (const name of muscleGroups) {
    const group = await prisma.muscleGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    muscleGroupMap[name] = group.id;
  }

  // Create or reuse exercises and their muscle-group assignments.
  const exerciseMap = {};

  for (const [name, equipment, category, muscles] of exercises) {
    const exercise = await prisma.exercise.upsert({
      where: { id: `00000000-0000-4000-8000-${String(exercises.findIndex(e => e[0] === name) + 1).padStart(12, "0")}` },
      update: { name, equipment, category },
      create: {
        id: `00000000-0000-4000-8000-${String(exercises.findIndex(e => e[0] === name) + 1).padStart(12, "0")}`,
        name,
        equipment,
        category,
      },
    });

    exerciseMap[name] = exercise.id;

    for (const [index, muscle] of muscles.entries()) {
      await prisma.exerciseMuscleGroup.upsert({
        where: {
          exerciseId_muscleGroupId: {
            exerciseId: exercise.id,
            muscleGroupId: muscleGroupMap[muscle],
          },
        },
        update: { isPrimary: index === 0 },
        create: {
          exerciseId: exercise.id,
          muscleGroupId: muscleGroupMap[muscle],
          isPrimary: index === 0,
        },
      });
    }
  }

  // Remove only the previous demo workouts identified by their names.
  const demoNames = workoutPlans.map((plan) => plan.name);

  await prisma.workout.deleteMany({
    where: {
      userId: user.id,
      name: { in: demoNames },
      notes: "WORKOUT_TRACKER_DEMO",
    },
  });

  // Create 12 completed workouts over 90 days.
  const createdSets = [];

  for (let index = 0; index < 12; index++) {
    const plan = workoutPlans[index % workoutPlans.length];
    const startedAt = daysAgo(90 - index * 7);

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        name: plan.name,
        startedAt,
        endedAt: new Date(startedAt.getTime() + 60 * 60 * 1000),
        status: "COMPLETED",
        notes: "WORKOUT_TRACKER_DEMO",
      },
    });

    for (const [position, [exerciseName, setCount]] of plan.exercises.entries()) {
      const exerciseId = exerciseMap[exerciseName];

      const workoutExercise = await prisma.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId,
          position,
        },
      });

      const baseWeight = {
        "Bench Press": 40,
        "Incline Dumbbell Press": 15,
        "Shoulder Press": 12,
        "Lateral Raises": 6,
        "Triceps Pushdown": 20,
        "Lat Pulldown": 35,
        "Seated Cable Row": 30,
        "Barbell Row": 35,
        "Barbell Curl": 15,
        "Hammer Curl": 8,
        "Squat": 50,
        "Leg Press": 80,
        "Leg Extension": 25,
        "Leg Curl": 20,
        "Romanian Deadlift": 40,
      }[exerciseName] ?? 20;

      for (let setNumber = 1; setNumber <= setCount; setNumber++) {
        const weight = roundWeight(
          baseWeight + index * 0.5 + (setNumber - 1) * 2.5
        );

        const set = await prisma.workoutSet.create({
          data: {
            workoutExerciseId: workoutExercise.id,
            setNumber,
            weight,
            reps: Math.max(6, 12 - setNumber * 2),
            rpe: 7 + (setNumber - 1) * 0.5,
            isCompleted: true,
            completedAt: new Date(
              startedAt.getTime() + setNumber * 5 * 60 * 1000
            ),
          },
        });

        createdSets.push({
          id: set.id,
          exerciseId,
          weight,
          reps: set.reps,
          achievedAt: set.completedAt,
        });
      }
    }
  }

  // Rebuild personal records from demo workouts only.
  // Existing personal records are preserved.
  const records = new Map();

  for (const set of createdSets) {
    const candidates = [
      ["MAX_WEIGHT", set.weight],
      ["MAX_VOLUME", set.weight * set.reps],
      ["ESTIMATED_1RM", set.weight * (1 + set.reps / 30)],
    ];

    for (const [recordType, value] of candidates) {
      const key = `${set.exerciseId}:${recordType}`;
      const previous = records.get(key);

      if (!previous || value > previous.value) {
        records.set(key, {
          userId: user.id,
          exerciseId: set.exerciseId,
          workoutSetId: set.id,
          recordType,
          value: Number(value.toFixed(2)),
          achievedAt: set.achievedAt,
        });
      }
    }
  }

  await prisma.personalRecord.createMany({
    data: Array.from(records.values()),
    skipDuplicates: true,
  });

  console.log("Demo data inserted successfully!");
  console.log("Muscle groups:", muscleGroups.length);
  console.log("Exercises:", exercises.length);
  console.log("Workouts:", 12);
  console.log("Sets:", createdSets.length);
  console.log("New personal record candidates:", records.size);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
