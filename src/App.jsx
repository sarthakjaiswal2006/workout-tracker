import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Stats from "./pages/Stats";
import MiniGames from "./pages/MiniGames";
import GamePlayer from "./pages/GamePlayer";
import StartWorkout from "./pages/StartWorkout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./styles/App.css";

// ── Inner app — rendered only when user is authenticated ─────────────────────
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedGame, setSelectedGame] = useState(null);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    setSelectedGame(null);
  };

  const renderPage = () => {
    if (activePage === "mini-games" || activePage === "games") {
      return selectedGame ? (
        <GamePlayer
          slug={selectedGame}
          onBack={() => setSelectedGame(null)}
          onSwitchGame={(newSlug) => setSelectedGame(newSlug)}
        />
      ) : (
        <MiniGames onSelectGame={(slug) => setSelectedGame(slug)} />
      );
    }

    if (activePage === "workout" || activePage === "templates") {
      return <StartWorkout />;
    }

    if (activePage === "exercises") return <ExerciseLibrary />;
    if (activePage === "history") return <History />;
    if (activePage === "stats") return <Stats />;
    if (activePage === "dashboard") return <Dashboard />;
    if (activePage === "settings") return <Settings />;

    return (
      <div>
        <h1>{activePage}</h1>
        <p>Track your workouts. Measure your progress.</p>
      </div>
    );
  };

  return (
    <div className="app">
      <SideBar
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={logout}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

// ── Auth gate — shows Login/Signup until user is authenticated ────────────────
function AuthGate() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState("login"); // "login" | "signup"

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <span className="auth-spinner" />
        <p>Loading your session…</p>
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") {
      return <Signup onSwitchToLogin={() => setAuthView("login")} />;
    }
    return <Login onSwitchToSignup={() => setAuthView("signup")} />;
  }

  return <AuthenticatedApp />;
}

// ── Root App wraps everything in AuthProvider ─────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
