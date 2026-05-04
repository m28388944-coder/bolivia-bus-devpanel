import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, XCircle, Database, Globe, Wifi, WifiOff, Activity, Server, Clock, Users } from "lucide-react";
import api from "../api/client";

export default function Monitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [tick, setTick] = useState(0);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dev/health");
      setData(res.data);
      setLastUpdate(new Date());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 30000);
    const ticker = setInterval(() => setTick(n => n + 1), 1000);
    return () => { clearInterval(t); clearInterval(ticker); };
  }, []);

  const ICONS = {
    backend: Server,
    postgres: Database,
    frontend_pasajero: Globe,
    panel_admin: Activity,
    app_chofer: Users,
  };
  const LABELS = {
    backend: "Backend API",
    postgres: "PostgreSQL",
    frontend_pasajero: "Pasajero :5173",
    panel_admin: "Admin :5174",
    app_chofer: "Chofer :5175",
  };
  const DESCRIPTIONS = {
    backend: "FastAPI · Puerto 8000",
    postgres: "Base de datos principal",
    frontend_pasajero: "App de compra de pasajes",
    panel_admin: "Panel de administración",
    app_chofer: "App del conductor",
  };

  const ahora = new Date().toLocaleTimeString("es-BO");

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── ENCABEZADO ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div style={{ width: 4, height: 28, background: "#D4AF37", borderRadius: 4 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", margin: 0, letterSpacing: "-0.3px" }}>
              Monitor del Sistema
            </h2>
          </div>
          <p style={{ color: "#94A3B8", fontSize: 13, marginLeft: 12 }}>
            {lastUpdate
              ? `Última actualización: ${lastUpdate.toLocaleTimeString("es-BO")}`
              : "Conectando con los servicios..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div style={{
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 12,
            padding: "6px 14px",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Clock size={13} color="#D4AF37" />
            <span style={{ color: "#D4AF37", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
              {ahora}
            </span>
          </div>
          <button
            onClick={cargar}
            style={{
              background: loading ? "rgba(27,42,107,0.6)" : "#1B2A6B",
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 12,
              padding: "8px 18px",
              color: "#D4AF37",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── TARJETAS RESUMEN ── */}
      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Servicios Online",
                value: data.resumen.online,
                color: "#22C55E",
                bg: "rgba(34,197,94,0.08)",
                border: "rgba(34,197,94,0.2)",
                icon: <Wifi size={18} color="#22C55E" />,
              },
              {
                label: "Servicios Offline",
                value: data.resumen.offline,
                color: data.resumen.offline > 0 ? "#EF4444" : "#475569",
                bg: data.resumen.offline > 0 ? "rgba(239,68,68,0.08)" : "rgba(71,85,105,0.08)",
                border: data.resumen.offline > 0 ? "rgba(239,68,68,0.2)" : "rgba(71,85,105,0.2)",
                icon: <WifiOff size={18} color={data.resumen.offline > 0 ? "#EF4444" : "#475569"} />,
              },
              {
                label: "Total Monitoreados",
                value: data.resumen.total,
                color: "#D4AF37",
                bg: "rgba(212,175,55,0.08)",
                border: "rgba(212,175,55,0.2)",
                icon: <Activity size={18} color="#D4AF37" />,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "flex", alignItems: "center", gap: 16,
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500 }}>
                    {card.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── BARRA DE SALUD GLOBAL ── */}
          <div style={{
            background: "rgba(27,42,107,0.2)",
            border: "1px solid rgba(27,42,107,0.5)",
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
              SALUD GLOBAL
            </span>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((data.resumen.online / data.resumen.total) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: data.resumen.offline === 0
                    ? "linear-gradient(90deg, #22C55E, #16A34A)"
                    : "linear-gradient(90deg, #D4AF37, #F59E0B)",
                }}
              />
            </div>
            <span style={{
              color: data.resumen.offline === 0 ? "#22C55E" : "#D4AF37",
              fontSize: 13, fontWeight: 800, minWidth: 38, textAlign: "right"
            }}>
              {Math.round((data.resumen.online / data.resumen.total) * 100)}%
            </span>
          </div>

          {/* ── LISTA DE SERVICIOS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.servicios).map(([key, val], i) => {
              const Icon = ICONS[key] || Globe;
              const online = val.status === "online";
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: online
                      ? "linear-gradient(135deg, rgba(27,42,107,0.3), rgba(27,42,107,0.15))"
                      : "rgba(239,68,68,0.04)",
                    border: `1px solid ${online ? "rgba(212,175,55,0.15)" : "rgba(239,68,68,0.25)"}`,
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Ícono */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: online ? "rgba(27,42,107,0.6)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${online ? "rgba(212,175,55,0.2)" : "rgba(239,68,68,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={18} color={online ? "#D4AF37" : "#EF4444"} />
                    </div>
                    {/* Info */}
                    <div>
                      <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14 }}>
                        {LABELS[key] || key}
                      </div>
                      <div style={{ color: "#64748B", fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>
                        {val.url || "local"} · {DESCRIPTIONS[key] || ""}
                      </div>
                    </div>
                  </div>

                  {/* Derecha */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {val.users !== undefined && (
                      <div style={{
                        background: "rgba(100,116,139,0.12)",
                        borderRadius: 8, padding: "4px 10px",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <Users size={11} color="#64748B" />
                        <span style={{ color: "#64748B", fontSize: 11, fontWeight: 600 }}>
                          {val.users} usuarios
                        </span>
                      </div>
                    )}
                    {val.code && (
                      <div style={{
                        background: "rgba(100,116,139,0.12)",
                        borderRadius: 8, padding: "4px 10px",
                      }}>
                        <span style={{ color: "#94A3B8", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>
                          HTTP {val.code}
                        </span>
                      </div>
                    )}
                    {/* Badge estado */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 99,
                      background: online ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${online ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                    }}>
                      {online
                        ? <CheckCircle size={12} color="#22C55E" />
                        : <XCircle size={12} color="#EF4444" />}
                      <span style={{
                        fontSize: 11, fontWeight: 800,
                        color: online ? "#22C55E" : "#EF4444",
                        textTransform: "uppercase", letterSpacing: "0.5px"
                      }}>
                        {val.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* ── CARGANDO ── */}
      {loading && !data && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(212,175,55,0.15)",
            borderTopColor: "#D4AF37",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: "#64748B", fontSize: 14 }}>Conectando con los servicios...</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
