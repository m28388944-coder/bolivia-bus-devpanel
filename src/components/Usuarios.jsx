import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Shield, User, Bus, Terminal, Search, CheckCircle, XCircle } from "lucide-react";
import api from "../api/client";

const ROL_CONFIG = {
  developer: { color: "#D4AF37", bg: "rgba(212,175,55,0.1)", border: "rgba(212,175,55,0.25)", icon: Terminal, label: "Developer" },
  admin:     { color: "#A855F7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)", icon: Shield,   label: "Admin" },
  chofer:    { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", icon: Bus,      label: "Chofer" },
  pasajero:  { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", icon: User,     label: "Pasajero" },
};

export default function Usuarios() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(null);
  const [filtro, setFiltro]   = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const cargar = async () => {
    setLoading(true);
    try { const res = await api.get("/dev/users"); setUsers(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const cambiarRol = async (userId, nuevoRol) => {
    setSaving(userId);
    try {
      await api.patch(`/dev/users/${userId}/rol`, { rol: nuevoRol });
      setUsers(us => us.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
    } catch {} finally { setSaving(null); }
  };

  const toggleActivo = async (userId, activo) => {
    setSaving(userId);
    try {
      await api.patch(`/dev/users/${userId}/activo`, { activo });
      setUsers(us => us.map(u => u.id === userId ? { ...u, activo } : u));
    } catch {} finally { setSaving(null); }
  };

  const filtrados = users.filter(u =>
    (!filtroRol || u.rol === filtroRol) &&
    (!filtro || u.nombre?.toLowerCase().includes(filtro.toLowerCase()) || u.email?.toLowerCase().includes(filtro.toLowerCase()))
  );

  const conteos = Object.keys(ROL_CONFIG).reduce((acc, rol) => {
    acc[rol] = users.filter(u => u.rol === rol).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ENCABEZADO ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: "#D4AF37", borderRadius: 4 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.3px" }}>
              Gestión de Usuarios
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: 14, marginLeft: 14 }}>
            {users.length} usuarios registrados en el sistema
          </p>
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

      {/* ── TARJETAS POR ROL ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {Object.entries(ROL_CONFIG).map(([rol, cfg], i) => {
          const Icon = cfg.icon;
          return (
            <motion.button key={rol}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setFiltroRol(filtroRol === rol ? "" : rol)}
              style={{
                background: filtroRol === rol ? cfg.bg : "rgba(27,42,107,0.15)",
                border: `1px solid ${filtroRol === rol ? cfg.border : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                transition: "all 0.18s"
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={20} color={cfg.color} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
                  {conteos[rol]}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: 500 }}>
                  {cfg.label}s
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── BUSCADOR ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(27,42,107,0.2)", border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 12, padding: "12px 18px", marginBottom: 20
      }}>
        <Search size={16} color="#64748B" />
        <input
          value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder="Buscar por nombre o email..."
          style={{
            background: "transparent", border: "none", outline: "none",
            color: "#E2E8F0", fontSize: 14, flex: 1
          }}
        />
        {filtroRol && (
          <span style={{
            background: ROL_CONFIG[filtroRol]?.bg,
            border: `1px solid ${ROL_CONFIG[filtroRol]?.border}`,
            color: ROL_CONFIG[filtroRol]?.color,
            borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700
          }}>
            {filtroRol}
          </span>
        )}
        <span style={{ color: "#475569", fontSize: 13 }}>{filtrados.length} resultados</span>
      </div>

      {/* ── LISTA ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtrados.map((u, i) => {
          const cfg = ROL_CONFIG[u.rol] || ROL_CONFIG.pasajero;
          const Icon = cfg.icon;
          const isSaving = saving === u.id;
          return (
            <motion.div key={u.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{
                background: u.activo ? "rgba(27,42,107,0.2)" : "rgba(100,116,139,0.06)",
                border: `1px solid ${u.activo ? "rgba(212,175,55,0.12)" : "rgba(100,116,139,0.15)"}`,
                borderRadius: 16, padding: "16px 22px",
                display: "flex", alignItems: "center", gap: 16,
                opacity: u.activo ? 1 : 0.6, transition: "all 0.2s"
              }}>

              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={22} color={cfg.color} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                  {u.nombre}
                </div>
                <div style={{ color: "#64748B", fontFamily: "monospace", fontSize: 13 }}>
                  {u.email}
                </div>
              </div>

              {/* Badge rol */}
              <div style={{
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 99, padding: "5px 14px",
                color: cfg.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.5px"
              }}>
                {u.rol}
              </div>

              {/* Selector rol */}
              <select
                value={u.rol}
                onChange={e => cambiarRol(u.id, e.target.value)}
                disabled={isSaving}
                style={{
                  background: "rgba(27,42,107,0.4)", border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: 10, padding: "8px 14px", color: "#D4AF37",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", outline: "none"
                }}>
                <option value="pasajero">Pasajero</option>
                <option value="chofer">Chofer</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
              </select>

              {/* Toggle activo */}
              <button
                onClick={() => toggleActivo(u.id, !u.activo)}
                disabled={isSaving}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: u.activo ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${u.activo ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                  borderRadius: 10, padding: "8px 16px", cursor: "pointer",
                  color: u.activo ? "#22C55E" : "#EF4444",
                  fontSize: 14, fontWeight: 700, transition: "all 0.18s"
                }}>
                {u.activo
                  ? <><CheckCircle size={15} /> Activo</>
                  : <><XCircle size={15} /> Inactivo</>}
              </button>
            </motion.div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
