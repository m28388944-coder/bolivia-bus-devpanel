import { useEffect, useState } from "react";
import { RefreshCw, Search, Clock, Hash, User, Tag, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/client";

export default function Logs() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  const cargar = async () => {
    setLoading(true);
    try { const res = await api.get("/dev/logs/recientes"); setEventos(res.data.eventos); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); const t = setInterval(cargar, 15000); return () => clearInterval(t); }, []);

  const filtrados = eventos.filter(e =>
    !filtro || e.codigo?.includes(filtro.toUpperCase()) ||
    e.usuario_email?.includes(filtro) || e.estado?.includes(filtro)
  );

  const fmt = dt => new Date(dt).toLocaleString("es-BO", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const estadoColor = (estado) => {
    if (estado === "pagada") return { bg: "rgba(34,197,94,0.1)", color: "#22C55E", border: "rgba(34,197,94,0.25)" };
    if (estado === "cancelada") return { bg: "rgba(239,68,68,0.1)", color: "#EF4444", border: "rgba(239,68,68,0.25)" };
    return { bg: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "rgba(212,175,55,0.25)" };
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ENCABEZADO ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: "#D4AF37", borderRadius: 4 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.3px" }}>
              Log de Eventos
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: 14, marginLeft: 14 }}>
            Actualización automática cada 15 segundos
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(27,42,107,0.3)", border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12, padding: "10px 16px"
          }}>
            <Search size={15} color="#64748B" />
            <input
              value={filtro} onChange={e => setFiltro(e.target.value)}
              placeholder="Filtrar por código, email o estado..."
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#E2E8F0", fontSize: 14, width: 220,
              }}
            />
          </div>
          <button onClick={cargar} style={{
            background: "#1B2A6B", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 12, padding: "10px 20px", color: "#D4AF37",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── CONTADOR ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, marginBottom: 16
      }}>
        {[
          { label: "Total eventos", value: filtrados.length, color: "#D4AF37" },
          { label: "Pagadas", value: filtrados.filter(e => e.estado === "pagada").length, color: "#22C55E" },
          { label: "Pendientes", value: filtrados.filter(e => e.estado === "pendiente").length, color: "#F59E0B" },
          { label: "Canceladas", value: filtrados.filter(e => e.estado === "cancelada").length, color: "#EF4444" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(27,42,107,0.2)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── TABLA ── */}
      <div style={{
        background: "rgba(27,42,107,0.15)", border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 18, overflow: "hidden"
      }}>
        {/* Cabecera */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.2fr 2fr 2fr 1fr 1.5fr",
          padding: "14px 24px",
          background: "rgba(27,42,107,0.4)",
          borderBottom: "1px solid rgba(212,175,55,0.1)"
        }}>
          {[
            { label: "Código", icon: <Hash size={13} color="#D4AF37" /> },
            { label: "Ruta / Estado", icon: <Tag size={13} color="#D4AF37" /> },
            { label: "Usuario", icon: <User size={13} color="#D4AF37" /> },
            { label: "Monto", icon: <Tag size={13} color="#D4AF37" /> },
            { label: "Fecha", icon: <Calendar size={13} color="#D4AF37" /> },
          ].map((col, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {col.icon}
              <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {col.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filas */}
        {filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#475569", fontSize: 15 }}>
            Sin eventos registrados
          </div>
        ) : (
          filtrados.map((e, i) => {
            const ec = estadoColor(e.estado);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{
                  display: "grid", gridTemplateColumns: "1.2fr 2fr 2fr 1fr 1.5fr",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s",
                  cursor: "default"
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = "rgba(212,175,55,0.04)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
              >
                <span style={{ color: "#D4AF37", fontFamily: "monospace", fontWeight: 700, fontSize: 14 }}>
                  {e.codigo}
                </span>
                <span style={{ color: "#94A3B8", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.estado}
                </span>
                <span style={{ color: "#64748B", fontFamily: "monospace", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.usuario_email}
                </span>
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  background: ec.bg, border: `1px solid ${ec.border}`,
                  borderRadius: 99, padding: "3px 10px", width: "fit-content"
                }}>
                  <span style={{ color: ec.color, fontSize: 13, fontWeight: 700 }}>
                    Bs. {e.monto}
                  </span>
                </div>
                <span style={{ color: "#475569", fontSize: 13 }}>
                  {e.fecha ? fmt(e.fecha) : "—"}
                </span>
              </motion.div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 12, textAlign: "right", color: "#475569", fontSize: 13 }}>
        {filtrados.length} eventos mostrados
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
