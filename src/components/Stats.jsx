import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Database, TrendingUp, HardDrive, ShoppingCart } from "lucide-react";
import api from "../api/client";

export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try { const res = await api.get("/dev/stats"); setData(res.data.stats); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const TABLAS = [
    { key: "users", label: "Usuarios", color: "#3B82F6" },
    { key: "companies", label: "Empresas", color: "#8B5CF6" },
    { key: "routes", label: "Rutas", color: "#D4AF37" },
    { key: "buses", label: "Buses", color: "#F59E0B" },
    { key: "seats", label: "Asientos", color: "#10B981" },
    { key: "schedules", label: "Horarios", color: "#06B6D4" },
    { key: "bookings", label: "Reservas", color: "#EF4444" },
    { key: "tickets", label: "Tickets", color: "#D4AF37" },
    { key: "payments", label: "Pagos", color: "#22C55E" },
    { key: "drivers", label: "Choferes", color: "#F97316" },
    { key: "terminals", label: "Terminales", color: "#A855F7" },
    { key: "gps_tracking", label: "GPS Tracking", color: "#14B8A6" },
  ];

  const maxVal = data ? Math.max(...TABLAS.map(t => data[t.key] ?? 0), 1) : 1;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ENCABEZADO ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 28, background: "#D4AF37", borderRadius: 4 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.3px" }}>
              Métricas de la Base de Datos
            </h2>
          </div>
          <p style={{ color: "#64748B", fontSize: 14, marginLeft: 14 }}>Performance y estadísticas en tiempo real</p>
        </div>
        <button onClick={cargar} style={{
          background: "#1B2A6B", border: "1px solid rgba(212,175,55,0.3)",
          borderRadius: 12, padding: "10px 20px", color: "#D4AF37",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
        }}>
          <RefreshCw size={15} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Actualizar
        </button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(212,175,55,0.15)", borderTopColor: "#D4AF37",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#64748B", fontSize: 15 }}>Cargando métricas...</p>
        </div>
      ) : data && (
        <>
          {/* ── TARJETAS RESUMEN ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              {
                label: "Ingresos Pagados",
                value: `Bs. ${data.ingresos_pagados?.toFixed(2) ?? "0.00"}`,
                icon: <TrendingUp size={20} color="#22C55E" />,
                color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)"
              },
              {
                label: "Tamaño de la BD",
                value: data.db_size ?? "—",
                icon: <HardDrive size={20} color="#3B82F6" />,
                color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)"
              },
              {
                label: "Total Reservas",
                value: data.bookings ?? 0,
                icon: <ShoppingCart size={20} color="#D4AF37" />,
                color: "#D4AF37", bg: "rgba(212,175,55,0.08)", border: "rgba(212,175,55,0.2)"
              },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{
                  background: card.bg, border: `1px solid ${card.border}`,
                  borderRadius: 16, padding: "22px 24px",
                  display: "flex", alignItems: "center", gap: 16
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 5, fontWeight: 500 }}>{card.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── TABLA DE CONTEOS ── */}
          <div style={{
            background: "rgba(27,42,107,0.15)", border: "1px solid rgba(212,175,55,0.12)",
            borderRadius: 18, overflow: "hidden", marginBottom: 24
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid rgba(212,175,55,0.1)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <Database size={18} color="#D4AF37" />
              <span style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 16 }}>Registros por tabla</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {TABLAS.map((tabla, i) => {
                const val = data[tabla.key] ?? 0;
                const pct = Math.round((val / maxVal) * 100);
                return (
                  <motion.div key={tabla.key}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{
                      padding: "14px 24px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>{tabla.label}</span>
                      <span style={{ color: "#F1F5F9", fontWeight: 800, fontSize: 15 }}>{val}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.03 }}
                        style={{ height: "100%", borderRadius: 99, background: tabla.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── RESERVAS POR ESTADO ── */}
          {data.bookings_por_estado && (
            <div style={{
              background: "rgba(27,42,107,0.15)", border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 18, padding: "20px 24px"
            }}>
              <h3 style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Reservas por estado</h3>
              <div style={{ display: "flex", gap: 12 }}>
                {Object.entries(data.bookings_por_estado).map(([estado, count]) => {
                  const colors = { pagada: "#22C55E", pendiente: "#D4AF37", cancelada: "#EF4444" };
                  const c = colors[estado] || "#94A3B8";
                  return (
                    <div key={estado} style={{
                      flex: 1, background: `${c}10`, border: `1px solid ${c}30`,
                      borderRadius: 14, padding: "16px 20px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: c }}>{count}</div>
                      <div style={{ color: "#64748B", fontSize: 13, marginTop: 6, textTransform: "capitalize", fontWeight: 500 }}>{estado}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
