import { useState } from "react";
import { ExternalLink, Monitor } from "lucide-react";

const SISTEMAS = [
  { id: "pasajero", label: "App Pasajero",  url: "http://localhost:5173", color: "#3B82F6",  bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  desc: "Compra de pasajes" },
  { id: "admin",    label: "Panel Admin",   url: "http://localhost:5174", color: "#A855F7",  bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  desc: "Administración" },
  { id: "chofer",   label: "App Chofer",    url: "http://localhost:5175", color: "#F59E0B",  bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  desc: "Panel del conductor" },
];

export default function Sistemas() {
  const [activo, setActivo] = useState("pasajero");
  const sistema = SISTEMAS.find(s => s.id === activo);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ENCABEZADO ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: "#D4AF37", borderRadius: 4 }} />
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.3px" }}>
              Vista de Sistemas
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: 16, marginLeft: 14 }}>
            Inspección en tiempo real de cada panel
          </p>
        </div>
        <a href={sistema.url} target="_blank" rel="noreferrer" style={{
          background: "#1B2A6B", border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 12, padding: "12px 22px", color: "#D4AF37",
          fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 8
        }}>
          <ExternalLink size={17} /> Abrir en nueva pestaña
        </a>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {SISTEMAS.map(s => (
          <button key={s.id} onClick={() => setActivo(s.id)} style={{
            padding: "12px 24px", borderRadius: 14, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 15, transition: "all 0.18s",
            background: activo === s.id ? s.bg : "rgba(27,42,107,0.2)",
            color: activo === s.id ? s.color : "#64748B",
            outline: activo === s.id ? `1px solid ${s.border}` : "1px solid rgba(255,255,255,0.06)",
          }}>
            {s.label}
            <span style={{ fontSize: 13, marginLeft: 8, opacity: 0.7 }}>{s.url.split("//")[1]}</span>
          </button>
        ))}
      </div>

      {/* ── IFRAME ── */}
      <div style={{
        background: "rgba(27,42,107,0.15)",
        border: `1px solid ${sistema.border}`,
        borderRadius: 18, overflow: "hidden"
      }}>
        {/* Barra navegador */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px",
          background: "rgba(27,42,107,0.4)",
          borderBottom: `1px solid ${sistema.border}`
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#22C55E" }} />
          </div>
          <div style={{
            flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8,
            padding: "6px 14px", display: "flex", alignItems: "center", gap: 8
          }}>
            <Monitor size={13} color="#64748B" />
            <span style={{ color: "#94A3B8", fontSize: 14, fontFamily: "monospace" }}>{sistema.url}</span>
          </div>
          <div style={{
            background: sistema.bg, border: `1px solid ${sistema.border}`,
            borderRadius: 8, padding: "4px 14px",
            color: sistema.color, fontSize: 13, fontWeight: 700
          }}>
            {sistema.desc}
          </div>
        </div>
        <iframe
          src={sistema.url}
          style={{ width: "100%", height: "calc(100vh - 320px)", border: "none", display: "block" }}
          title={sistema.label}
        />
      </div>
    </div>
  );
}
