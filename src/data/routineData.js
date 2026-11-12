// 7-Day Workout Routine Split Data
// Har din ka target muscle group aur uske particular exercises
export const WEEKLY_ROUTINE = {
  mon: {
    dayKey: "mon",
    dayName: "Monday",
    muscleFocus: "Chest, Shoulders & Triceps",
    tag: "Push Day",
    icon: "⚡",
    isHoliday: false,
    estimatedMinutes: 50,
    description: "Heavy barbell bench press, incline dumbbell pressing, and triceps cable pushdowns.",
    exercises: [
      {
        id: "ex-bench",
        name: "Barbell Bench Press",
        muscle: "Chest (Mid-Pecs)",
        sets: 4,
        reps: "8 - 10",
        targetWeight: "60 kg",
        restSeconds: 90,
        tip: "Keep shoulder blades retracted and elbows tucked at ~45°."
      },
      {
        id: "ex-incline-db",
        name: "Incline Dumbbell Press",
        muscle: "Upper Chest & Front Delts",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "22 kg",
        restSeconds: 90,
        tip: "Set bench at 30° incline for optimal clavicular head activation."
      },
      {
        id: "ex-tricep-pushdown",
        name: "Cable Triceps Rope Pushdown",
        muscle: "Triceps (Lateral Head)",
        sets: 3,
        reps: "12 - 15",
        targetWeight: "25 kg",
        restSeconds: 60,
        tip: "Flare the rope at the bottom for full triceps contraction."
      }
    ]
  },
  tue: {
    dayKey: "tue",
    dayName: "Tuesday",
    muscleFocus: "Back & Biceps",
    tag: "Pull Day",
    icon: "🧗",
    isHoliday: false,
    estimatedMinutes: 50,
    description: "Vertical lat pulldowns, heavy bent-over rows, and incline dumbbell bicep curls.",
    exercises: [
      {
        id: "ex-lat-pull",
        name: "Lat Pulldown",
        muscle: "Lats & Upper Back",
        sets: 4,
        reps: "8 - 12",
        targetWeight: "50 kg",
        restSeconds: 90,
        tip: "Drive elbows down and back, pull bar to upper chest."
      },
      {
        id: "ex-barbell-row",
        name: "Bent Over Barbell Row",
        muscle: "Rhomboids & Mid-Back",
        sets: 3,
        reps: "8 - 10",
        targetWeight: "55 kg",
        restSeconds: 90,
        tip: "Hinge at hips with a flat spine, pull bar to belly button."
      },
      {
        id: "ex-bicep-curl",
        name: "Incline Dumbbell Bicep Curl",
        muscle: "Biceps Brachii",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "14 kg",
        restSeconds: 60,
        tip: "Keep upper arms stationary; do not swing weights."
      }
    ]
  },
  wed: {
    dayKey: "wed",
    dayName: "Wednesday",
    muscleFocus: "Legs & Core Conditioning",
    tag: "Legs & Core",
    icon: "🦵",
    isHoliday: false,
    estimatedMinutes: 60,
    description: "Heavy back squats, romanian deadlifts, machine leg press, and core planks.",
    exercises: [
      {
        id: "ex-squat",
        name: "Barbell Back Squat",
        muscle: "Quadriceps & Glutes",
        sets: 4,
        reps: "8 - 10",
        targetWeight: "80 kg",
        restSeconds: 120,
        tip: "Break at hips and knees together, descend below parallel."
      },
      {
        id: "ex-rdl",
        name: "Romanian Deadlift (RDL)",
        muscle: "Hamstrings & Glutes",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "70 kg",
        restSeconds: 90,
        tip: "Keep slight knee bend, push hips back until hamstrings stretch."
      },
      {
        id: "ex-leg-press",
        name: "Machine Leg Press",
        muscle: "Quads & Glutes",
        sets: 3,
        reps: "12 - 15",
        targetWeight: "120 kg",
        restSeconds: 90,
        tip: "Do not lock knees completely at the top of the press."
      },
      {
        id: "ex-plank",
        name: "Core Isometric Plank",
        muscle: "Rectus Abdominis",
        sets: 3,
        reps: "60 sec",
        targetWeight: "Bodyweight",
        restSeconds: 60,
        tip: "Brace glutes and core; do not let lower back sag."
      }
    ]
  },
  thu: {
    dayKey: "thu",
    dayName: "Thursday",
    muscleFocus: "Shoulders & Upper Chest Focus",
    tag: "Shoulders",
    icon: "🥋",
    isHoliday: false,
    estimatedMinutes: 45,
    description: "Strict overhead barbell pressing, dumbbell lateral raises for 3D delts.",
    exercises: [
      {
        id: "ex-ohp",
        name: "Overhead Barbell Press (OHP)",
        muscle: "Anterior Deltoids & Triceps",
        sets: 4,
        reps: "8 - 10",
        targetWeight: "40 kg",
        restSeconds: 90,
        tip: "Squeeze glutes and core tightly to stabilize your lower back."
      },
      {
        id: "ex-lat-raise",
        name: "Dumbbell Lateral Raise",
        muscle: "Lateral Deltoids (Side Delts)",
        sets: 4,
        reps: "12 - 15",
        targetWeight: "10 kg",
        restSeconds: 60,
        tip: "Lead with elbows, slight forward lean for side delt isolation."
      },
      {
        id: "ex-incline-db-thu",
        name: "Incline Dumbbell Press",
        muscle: "Upper Chest",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "22 kg",
        restSeconds: 90,
        tip: "Control the eccentric lowering phase for 2 seconds."
      }
    ]
  },
  fri: {
    dayKey: "fri",
    dayName: "Friday",
    muscleFocus: "Back Hypertrophy & Arms Blast",
    tag: "Back & Arms",
    icon: "💪",
    isHoliday: false,
    estimatedMinutes: 50,
    description: "Pull-ups, seated cable rows, bicep curls, and triceps rope extensions.",
    exercises: [
      {
        id: "ex-pullup",
        name: "Pull-Up / Lat Pulldown",
        muscle: "Latissimus Dorsi",
        sets: 4,
        reps: "8 - 10",
        targetWeight: "Bodyweight",
        restSeconds: 90,
        tip: "Pull elbows straight down into your back pockets."
      },
      {
        id: "ex-cable-row",
        name: "Seated Cable Row",
        muscle: "Rhomboids & Traps",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "50 kg",
        restSeconds: 90,
        tip: "Do not lean back excessively; squeeze shoulder blades together."
      },
      {
        id: "ex-hammer-curl",
        name: "Dumbbell Hammer Curl",
        muscle: "Brachialis & Biceps",
        sets: 3,
        reps: "12 - 15",
        targetWeight: "14 kg",
        restSeconds: 60,
        tip: "Neutral grip builds arm thickness and forearm stability."
      },
      {
        id: "ex-overhead-tricep",
        name: "Overhead Cable Triceps Extension",
        muscle: "Triceps (Long Head)",
        sets: 3,
        reps: "12 - 15",
        targetWeight: "20 kg",
        restSeconds: 60,
        tip: "Keep elbows pointed forward to stretch the long head."
      }
    ]
  },
  sat: {
    dayKey: "sat",
    dayName: "Saturday",
    muscleFocus: "Lower Body Strength & Power",
    tag: "Legs & Power",
    icon: "🔥",
    isHoliday: false,
    estimatedMinutes: 55,
    description: "Heavy back squats, high volume leg pressing, and core stabilization.",
    exercises: [
      {
        id: "ex-squat-sat",
        name: "Barbell Back Squat",
        muscle: "Quadriceps & Posterior Chain",
        sets: 4,
        reps: "6 - 8",
        targetWeight: "85 kg",
        restSeconds: 120,
        tip: "Focus on explosive drive through mid-foot."
      },
      {
        id: "ex-leg-press-sat",
        name: "Machine Leg Press",
        muscle: "Quads & Adductors",
        sets: 3,
        reps: "10 - 12",
        targetWeight: "130 kg",
        restSeconds: 90,
        tip: "Deep knee bend without lifting lower back from the seat."
      },
      {
        id: "ex-plank-sat",
        name: "Plank & Core Holds",
        muscle: "Core & Abdominals",
        sets: 3,
        reps: "60 sec",
        targetWeight: "Bodyweight",
        restSeconds: 60,
        tip: "Maintain a neutral cervical spine and straight body line."
      }
    ]
  },
  sun: {
    dayKey: "sun",
    dayName: "Sunday",
    muscleFocus: "Rest & Muscle Recovery",
    tag: "Holiday",
    icon: "🏖️",
    isHoliday: true,
    estimatedMinutes: 0,
    description: "Sunday is a holiday! No workouts scheduled. Rest, hydrate, let muscle protein synthesis rebuild your fibers, and prepare for Monday.",
    recoveryTips: [
      { icon: "💤", title: "8+ Hours Sleep", text: "Growth hormone peaks during deep REM sleep to repair muscle tears." },
      { icon: "💧", title: "3-4L Hydration", text: "Drink plenty of water with electrolytes to flush out metabolic waste." },
      { icon: "🥗", title: "High Protein Meals", text: "Ensure 1.6-2.2g of protein per kg of bodyweight for muscle recovery." },
      { icon: "🚶", title: "Light 5K Walk", text: "Promotes blood circulation without inducing central nervous fatigue." }
    ],
    exercises: []
  }
};

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
