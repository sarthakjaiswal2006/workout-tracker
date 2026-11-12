
import { useState } from "react";
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import MiniGames from "./pages/MiniGames";
import GamePlayer from "./pages/GamePlayer";
import "./styles/App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedGame, setSelectedGame] = useState(null);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    setSelectedGame(null);
  };

  const renderPage = () => {
    // Existing Mini Games flow — preserved
    if (activePage === "mini-games" || activePage === "games") {
      return selectedGame ? (
        <GamePlayer
          slug={selectedGame}
          onBack={() => setSelectedGame(null)}
          onSwitchGame={(newSlug) => setSelectedGame(newSlug)}
        />
      ) : (
        <MiniGames
          onSelectGame={(slug) => setSelectedGame(slug)}
        />
      );
    }

    if (activePage === "dashboard") {
      return <Dashboard />;
    }

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
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
