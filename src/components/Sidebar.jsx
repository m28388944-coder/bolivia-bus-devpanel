import { useState, useEffect } from "react";

const NAV = [
  {
    grupo: "OPERACIONES",
    items: [
      { id: "monitor",  label: "Monitor",      desc: "Estado en tiempo real",    emoji: "⚡" },
      { id: "stats",    label: "Métricas BD",  desc: "Performance del sistema",  emoji: "📊" },
      { id: "sql",      label: "SQL Studio",   desc: "Consola de base de datos", emoji: "🗄️" },
    ]
  },
  {
    grupo: "ADMINISTRACIÓN",
    items: [
      { id: "usuarios", label: "Usuarios",     desc: "Roles y accesos",          emoji: "👥" },
      { id: "sistemas", label: "Sistemas",     desc: "Paneles integrados",       emoji: "🖥️" },
      { id: "logs",     label: "Registros",    desc: "Eventos del sistema",      emoji: "📋" },
    ]
  },
  {
    grupo: "SOPORTE",
    items: [
      { id: "soporte",  label: "Tickets",      desc: "Gestión de incidencias",   emoji: "🎫" },
      { id: "notificaciones", label: "Notificaciones", desc: "Email, SMS, WhatsApp", emoji: "🔔" },
    ]
  }
];

export default function Sidebar({ active, onNav, user, onLogout }) {
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setFecha(now.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: 280, background: "linear-gradient(180deg, #0f1d56 0%, #1B2A6B 40%, #162260 100%)",
      height: "100vh", display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0, zIndex: 100,
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      boxShadow: "4px 0 32px rgba(0,0,0,0.4)",
      borderRight: "1px solid rgba(212,175,55,0.15)"
    }}>

      {/* ── LOGO ── */}
      <div style={{
        padding: "28px 22px 22px",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
        display: "flex", alignItems: "center", gap: 14
      }}>
        <div style={{
          width: 50, height: 50,
          background: "linear-gradient(135deg, #D4AF37, #b8941f)",
          borderRadius: 14, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24,
          boxShadow: "0 6px 20px rgba(212,175,55,0.4)", flexShrink: 0
        }}>🚌</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>Bolivia Bus</div>
          <div style={{ color: "#D4AF37", fontSize: 11, fontWeight: 700, letterSpacing: "2px", marginTop: 2 }}>DEV PANEL v2.0</div>
        </div>
      </div>

      {/* ── USUARIO ── */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        <div style={{
          background: "rgba(10,18,60,0.6)", borderRadius: 12,
          padding: "12px 14px", border: "1px solid rgba(212,175,55,0.15)",
          display: "flex", alignItems: "center", gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #D4AF37, #b8941f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0
          }}>👨‍💻</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{user?.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}/>
              <span style={{ color: "#86efac", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px" }}>
                DEVELOPER · EN LÍNEA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVEGACIÓN ── */}
      <nav style={{ flex: 1, padding: "12px 14px", overflowY: "auto" }}>
        {NAV.map(grupo => (
          <div key={grupo.grupo} style={{ marginBottom: 8 }}>
            <div style={{
              color: "rgba(212,175,55,0.5)", fontSize: 10, fontWeight: 800,
              letterSpacing: "2px", padding: "10px 10px 6px",
              textTransform: "uppercase"
            }}>{grupo.grupo}</div>
            {grupo.items.map(item => {
              const isActive = active === item.id;
              return (
                <button key={item.id} onClick={() => onNav(item.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 14px", borderRadius: 12, border: "none",
                    cursor: "pointer", marginBottom: 3, transition: "all .18s",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.08))"
                      : "transparent",
                    textAlign: "left",
                    borderLeft: isActive ? "3px solid #D4AF37" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: isActive ? "#D4AF37" : "#c7d2f0",
                      fontSize: 15, fontWeight: isActive ? 700 : 500,
                      lineHeight: 1.2
                    }}>{item.label}</div>
                    <div style={{
                      color: isActive ? "rgba(212,175,55,0.6)" : "rgba(148,163,184,0.6)",
                      fontSize: 11, marginTop: 2
                    }}>{item.desc}</div>
                  </div>
                  {isActive && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#D4AF37", boxShadow: "0 0 8px #D4AF37",
                      flexShrink: 0
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── RELOJ ── */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
        <div style={{
          background: "rgba(10,18,60,0.6)", borderRadius: 12, padding: "12px 16px",
          border: "1px solid rgba(212,175,55,0.12)", marginBottom: 12, textAlign: "center"
        }}>
          <div style={{ color: "#D4AF37", fontSize: 22, fontWeight: 800,
            fontFamily: "monospace", letterSpacing: "3px" }}>{hora}</div>
          <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 11, marginTop: 4,
            textTransform: "capitalize", letterSpacing: "0.3px" }}>{fecha}</div>
        </div>
        <button onClick={onLogout} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, padding: "11px", borderRadius: 12,
          border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)",
          cursor: "pointer", color: "#f87171", fontSize: 14,
          fontWeight: 600, fontFamily: "inherit", transition: "all .18s"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; }}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}

