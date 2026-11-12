
const stats = [
  {
    title: "Total Workouts",
    value: "24",
    change: "+12%",
    icon: "◈",
  },
  {
    title: "Total Volume",
    value: "12,450",
    unit: "kg",
    change: "+8.5%",
    icon: "↗",
  },
  {
    title: "Workout Time",
    value: "18.5",
    unit: "hrs",
    change: "+5%",
    icon: "◷",
  },
  {
    title: "Current Streak",
    value: "7",
    unit: "days",
    change: "Keep going!",
    icon: "🔥",
  },
];

const recentWorkouts = [
  {
    name: "Push Day",
    date: "Today",
    duration: "65 min",
    exercises: 5,
    volume: "3,250 kg",
  },
  {
    name: "Pull Day",
    date: "Yesterday",
    duration: "58 min",
    exercises: 6,
    volume: "2,850 kg",
  },
  {
    name: "Leg Day",
    date: "10 Nov",
    duration: "72 min",
    exercises: 5,
    volume: "4,100 kg",
  },
];

const personalRecords = [
  { exercise: "Bench Press", value: "80 kg", date: "Today" },
  { exercise: "Squat", value: "100 kg", date: "Yesterday" },
  { exercise: "Deadlift", value: "120 kg", date: "8 Nov" },
];

const weeklyActivity = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 85 },
  { day: "Wed", value: 40 },
  { day: "Thu", value: 100 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 75 },
  { day: "Sun", value: 15 },
];

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Welcome back, Athlete!</h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your fitness journey.
          </p>
        </div>

        <div className="dashboard-date">
          <span>◷</span>
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <section className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-change">{stat.change}</span>
            </div>

            <p className="stat-title">{stat.title}</p>

            <h2>
              {stat.value}
              {stat.unit && <span>{stat.unit}</span>}
            </h2>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">

        <div className="dashboard-card activity-card">
          <div className="card-header">
            <div>
              <h3>Weekly Activity</h3>
              <p>Your training consistency this week</p>
            </div>
            <span className="card-badge">This Week</span>
          </div>

          <div className="activity-chart">
            {weeklyActivity.map((item) => (
              <div className="activity-column" key={item.day}>
                <div className="activity-bar-container">
                  <div
                    className="activity-bar"
                    style={{ height: `${item.value}%` }}
                    title={`${item.value}% activity`}
                  />
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card records-card">
          <div className="card-header">
            <div>
              <h3>Personal Records</h3>
              <p>Your latest achievements</p>
            </div>
            <span className="record-trophy">🏆</span>
          </div>

          <div className="records-list">
            {personalRecords.map((record) => (
              <div className="record-item" key={record.exercise}>
                <div>
                  <strong>{record.exercise}</strong>
                  <span>{record.date}</span>
                </div>
                <h4>{record.value}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card recent-card">
          <div className="card-header">
            <div>
              <h3>Recent Workouts</h3>
              <p>Your latest training sessions</p>
            </div>
          </div>

          <div className="workout-table">
            <div className="workout-table-header">
              <span>WORKOUT</span>
              <span>EXERCISES</span>
              <span>DURATION</span>
              <span>VOLUME</span>
            </div>

            {recentWorkouts.map((workout) => (
              <div className="workout-row" key={workout.name}>
                <div className="workout-name">
                  <strong>{workout.name}</strong>
                  <span>{workout.date}</span>
                </div>
                <span>{workout.exercises}</span>
                <span>{workout.duration}</span>
                <strong>{workout.volume}</strong>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;
