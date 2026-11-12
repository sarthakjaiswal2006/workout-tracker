
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gamesRouter from "./routes/games.js";
import prisma from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const DEMO_USER_ID = "c7e535ba-27b2-47f9-bf81-0ba645f36b8f";

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Workout Tracker Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [workouts, personalRecords, sets] = await Promise.all([
      prisma.workout.findMany({
        where: {
          userId: DEMO_USER_ID,
          endedAt: { not: null },
        },
        orderBy: {
          startedAt: "desc",
        },
        include: {
          _count: {
            select: {
              exercises: true,
            },
          },
        },
      }),

      prisma.personalRecord.findMany({
        where: {
          userId: DEMO_USER_ID,
        },
        orderBy: {
          achievedAt: "desc",
        },
        take: 3,
        include: {
          exercise: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.workoutSet.findMany({
        where: {
          isCompleted: true,
          workoutExercise: {
            workout: {
              userId: DEMO_USER_ID,
              endedAt: { not: null },
            },
          },
        },
        select: {
          weight: true,
          reps: true,
        },
      }),
    ]);

    const totalWorkouts = workouts.length;

    const totalVolume = sets.reduce(
      (total, set) => total + Number(set.weight) * set.reps,
      0
    );

    const totalWorkoutMinutes = workouts.reduce((total, workout) => {
      return (
        total +
        (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
      );
    }, 0);

    const workoutHours = Math.round((totalWorkoutMinutes / 60) * 10) / 10;

    const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);

    const workoutDates = [
      ...new Set(workouts.map((workout) => getDateKey(workout.startedAt))),
    ].sort((a, b) => b.localeCompare(a));

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayKey = getDateKey(today);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    let currentStreak = 0;

    if (
      workoutDates[0] === todayKey ||
      workoutDates[0] === yesterdayKey
    ) {
      let expectedDate = new Date(`${workoutDates[0]}T00:00:00.000Z`);

      for (const workoutDate of workoutDates) {
        if (getDateKey(expectedDate) !== workoutDate) {
          break;
        }

        currentStreak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      }
    }

    const weekStart = new Date(today);
    const dayOfWeek = weekStart.getUTCDay();
    weekStart.setUTCDate(
      weekStart.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setUTCDate(date.getUTCDate() + index);

      const dateKey = getDateKey(date);

      return {
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        date: dateKey,
        workouts: workouts.filter(
          (workout) => getDateKey(workout.startedAt) === dateKey
        ).length,
      };
    });

    const recentWorkouts = workouts.slice(0, 5).map((workout) => ({
      id: workout.id,
      name: workout.name,
      date: workout.startedAt,
      exercises: workout._count.exercises,
      duration: Math.round(
        (new Date(workout.endedAt) - new Date(workout.startedAt)) / 60000
      ),
    }));

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        totalVolume: Math.round(totalVolume * 100) / 100,
        workoutTime: workoutHours,
        currentStreak,
      },
      weeklyActivity,
      personalRecords: personalRecords.map((record) => ({
        exercise: record.exercise.name,
        value: Number(record.value),
        recordType: record.recordType,
        date: record.achievedAt,
      })),
      recentWorkouts,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      success: false,
      message: "Could not load dashboard data",
    });
  }
});

app.use("/api/games", gamesRouter);

export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Workout Tracker API Server running on http://localhost:${PORT}`);
  });
}
