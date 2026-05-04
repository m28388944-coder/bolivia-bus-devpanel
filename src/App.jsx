import { useState, useEffect } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Monitor from "./components/Monitor";
import Stats from "./components/Stats";
import Sistemas from "./components/Sistemas";
import Usuarios from "./components/Usuarios";
import Logs from "./components/Logs";
import Soporte from "./components/Soporte";
import Notificaciones from "./components/Notificaciones";
import SqlStudio from "./components/SqlStudio";

const PAGES = {
  monitor:  Monitor,
  stats:    Stats,
  sistemas: Sistemas,
  usuarios: Usuarios,
  logs:     Logs,
  soporte:  Soporte,
  notificaciones: Notificaciones,
  sql:      SqlStudio,
};

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; }

  .main-content { font-size: 16px; }

  .main-content div,
  .main-content span,
  .main-content p,
  .main-content button,
  .main-content input,
  .main-content select,
  .main-content textarea,
  .main-content a,
  .main-content td,
  .main-content th {
    font-size: inherit;
  }

  /* Forzar tamaños mínimos legibles */
  .main-content [style*="font-size: 9"],
  .main-content [style*="font-size: 10"],
  .main-content [style*="font-size: 11"] {
    font-size: 13px !important;
  }
  .main-content [style*="font-size: 12"] {
    font-size: 14px !important;
  }
  .main-content [style*="font-size: 13"] {
    font-size: 15px !important;
  }
  .main-content [style*="font-size: 14"] {
    font-size: 16px !important;
  }
  .main-content [style*="font-size: 15"] {
    font-size: 17px !important;
  }
  .main-content [style*="font-size: 16"] {
    font-size: 18px !important;
  }
  .main-content [style*="font-size: 22"],
  .main-content [style*="font-size: 26"] {
    font-size: 28px !important;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function App() {
  const [page, setPage] = useState("monitor");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("dev_user");
    const t = localStorage.getItem("dev_token");
    if (u && t) setUser(JSON.parse(u));
  }, []);

  const handleLogin  = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("dev_token");
    localStorage.removeItem("dev_user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin}/>;

  const PageComponent = PAGES[page] || Monitor;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        display: "flex",
        background: "#0a1128",
        minHeight: "100vh",
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}>
        <Sidebar active={page} onNav={setPage} user={user} onLogout={handleLogout}/>
        <main className="main-content" style={{
          marginLeft: 280,
          flex: 1,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0a1128 0%, #0d1a3a 50%, #0a1128 100%)",
          overflow: "auto",
          padding: "40px 48px",
          fontSize: 16,
        }}>
          <PageComponent/>
        </main>
      </div>
    </>
  );
}

