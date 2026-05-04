import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mail, MessageSquare, Phone, Search, RefreshCw,
  CheckCircle, XCircle, Clock, User, Hash, ChevronDown,
  Bell, AlertCircle, Plus
} from "lucide-react";
import api from "../api/client";

const CARD = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px 24px",
};

const INPUT = {
  width: "100%",
  background: "rgba(10,18,60,0.5)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "#E2E8F0",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

const BTN_PRIMARY = {
  background: "linear-gradient(135deg,#D4AF37,#b8941f)",
  border: "none", borderRadius: 10,
  padding: "11px 20px", cursor: "pointer",
  color: "#0a1128", fontWeight: 800, fontSize: 14,
  display: "flex", alignItems: "center", gap: 6,
  fontFamily: "inherit",
};

const BTN_GHOST = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  cursor: "pointer", color: "#94A3B8",
  display: "flex", alignItems: "center", gap: 6,
  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
};

const CANALES = [
  { id: "email",     label: "Email",     Icon: Mail,         color: "#3B82F6" },
  { id: "sms",       label: "SMS",       Icon: Phone,        color: "#22C55E" },
  { id: "whatsapp",  label: "WhatsApp",  Icon: MessageSquare, color: "#25D366" },
];

const PLANTILLAS = [
  {
    titulo: "Reserva confirmada",
    mensaje: "Tu reserva ha sido confirmada exitosamente. Presenta tu codigo QR al abordar el bus.",
  },
  {
    titulo: "Recordatorio de viaje",
    mensaje: "Te recordamos que tu viaje es manana. Por favor llega 30 minutos antes de la hora de salida.",
  },
  {
    titulo: "Cambio de horario",
    mensaje: "Informamos que el horario de tu viaje ha sido modificado. Por favor revisa los nuevos detalles.",
  },
  {
    titulo: "Reembolso procesado",
    mensaje: "Tu solicitud de reembolso ha sido procesada. El monto sera acreditado en los proximos 3-5 dias habiles.",
  },
];

function ResultadoCanal({ canal, resultado }) {
  const cfg = CANALES.find(c => c.id === canal) || {};
  const ok = resultado?.ok;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10,
      background: ok ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
      border: ok ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
    }}>
      {cfg.Icon && <cfg.Icon size={14} color={cfg.color}/>}
      <span style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 600, flex: 1 }}>{cfg.label}</span>
      {ok
        ? <CheckCircle size={14} color="#22C55E"/>
        : <XCircle size={14} color="#EF4444"/>
      }
      <span style={{ color: ok ? "#22C55E" : "#EF4444", fontSize: 12 }}>
        {ok ? "Enviado" : (resultado?.error || "Error")}
      </span>
    </div>
  );
}

function HistorialItem({ item, index }) {
  const exitoso = !item.mensaje?.includes("error");
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "14px 18px", borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: 6,
      }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: "rgba(212,175,55,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Bell size={16} color="#D4AF37"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 700,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.user_nombre || "Usuario"}
          </span>
          <span style={{ color: "#475569", fontSize: 11 }}>{item.user_email}</span>
          {item.codigo_reserva && (
            <span style={{ color: "#D4AF37", fontSize: 11, background: "rgba(212,175,55,0.1)",
              borderRadius: 99, padding: "2px 8px" }}>
              #{item.codigo_reserva}
            </span>
          )}
        </div>
        <p style={{ color: "#64748B", fontSize: 12, margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.mensaje}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ color: "#334155", fontSize: 11 }}>
          {item.created_at ? new Date(item.created_at).toLocaleString("es-BO", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
          }) : "-"}
        </div>
        <div style={{ color: item.tipo === "booking" ? "#3B82F6" : "#8B5CF6",
          fontSize: 11, fontWeight: 700, marginTop: 3 }}>
          {item.tipo}
        </div>
      </div>
    </motion.div>
  );
}

export default function Notificaciones() {
  const [tab, setTab]               = useState("enviar");
  const [usuarios, setUsuarios]     = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [busqUser, setBusqUser]     = useState("");
  const [busqBook, setBusqBook]     = useState("");
  const [userSel, setUserSel]       = useState(null);
  const [bookSel, setBookSel]       = useState(null);
  const [canales, setCanales]       = useState(["email", "sms", "whatsapp"]);
  const [titulo, setTitulo]         = useState("");
  const [mensaje, setMensaje]       = useState("");
  const [enviando, setEnviando]     = useState(false);
  const [resultado, setResultado]   = useState(null);
  const [historial, setHistorial]   = useState([]);
  const [loadHist, setLoadHist]     = useState(false);
  const [showPlant, setShowPlant]   = useState(false);

  const buscarUsuarios = async (q) => {
    if (q.length < 2) { setUsuarios([]); return; }
    try {
      const r = await api.get("/notifications/usuarios/buscar?q=" + encodeURIComponent(q));
      setUsuarios(r.data);
    } catch(e) { console.error(e); }
  };

  const buscarBookings = async (q) => {
    if (q.length < 2) { setBookings([]); return; }
    try {
      const r = await api.get("/notifications/bookings/buscar?q=" + encodeURIComponent(q));
      setBookings(r.data);
    } catch(e) { console.error(e); }
  };

  const cargarHistorial = async () => {
    setLoadHist(true);
    try {
      const r = await api.get("/notifications/historial");
      setHistorial(r.data);
    } catch(e) { console.error(e); } finally { setLoadHist(false); }
  };

  useEffect(() => { if (tab === "historial") cargarHistorial(); }, [tab]);

  const toggleCanal = (id) => {
    setCanales(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const enviar = async () => {
    if (!userSel || !titulo || !mensaje || canales.length === 0) return;
    setEnviando(true);
    setResultado(null);
    try {
      const r = await api.post("/notifications/enviar", {
        user_id: userSel.id,
        booking_id: bookSel?.id || null,
        titulo, mensaje, canales,
      });
      setResultado(r.data);
    } catch(e) {
      setResultado({ ok: false, error: e.message });
    } finally { setEnviando(false); }
  };

  const usarPlantilla = (p) => {
    setTitulo(p.titulo);
    setMensaje(p.mensaje);
    setShowPlant(false);
  };

  const canEnviar = userSel && titulo && mensaje && canales.length > 0 && !enviando;

  return (
    <div style={{ fontFamily: "inherit" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 22, background: "#D4AF37", borderRadius: 4 }}/>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", margin: 0 }}>Notificaciones</h2>
          </div>
          <p style={{ color: "#475569", fontSize: 13, margin: 0, marginLeft: 11 }}>
            Email · SMS · WhatsApp — comunicacion multicanal
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["enviar", "historial"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              background: tab === t ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "#D4AF37" : "#64748B",
              outline: tab === t ? "1px solid rgba(212,175,55,0.3)" : "none",
            }}>
              {t === "enviar" ? "Enviar" : "Historial"}
            </button>
          ))}
        </div>
      </div>

      {tab === "enviar" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Columna izquierda — destinatario */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Buscar usuario */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <User size={14} color="#D4AF37"/>
                <span style={{ color: "#D4AF37", fontSize: 13, fontWeight: 700 }}>Destinatario</span>
                {userSel && (
                  <button onClick={() => { setUserSel(null); setBusqUser(""); setUsuarios([]); }}
                    style={{ marginLeft: "auto", background: "none", border: "none",
                      cursor: "pointer", color: "#475569", fontSize: 12 }}>
                    Cambiar
                  </button>
                )}
              </div>

              {userSel ? (
                <div style={{
                  background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: 10, padding: "12px 16px",
                }}>
                  <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14 }}>{userSel.nombre}</div>
                  <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
                    {userSel.email && <span>📧 {userSel.email}</span>}
                    {userSel.telefono && <span style={{ marginLeft: 12 }}>📱 {userSel.telefono}</span>}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#475569" }}/>
                    <input value={busqUser}
                      onChange={e => { setBusqUser(e.target.value); buscarUsuarios(e.target.value); }}
                      placeholder="Buscar por nombre, email o telefono..."
                      style={{ ...INPUT, paddingLeft: 32, fontSize: 13 }}/>
                  </div>
                  {usuarios.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
                      {usuarios.map(u => (
                        <button key={u.id} onClick={() => { setUserSel(u); setUsuarios([]); setBusqUser(""); }}
                          style={{ textAlign: "left", background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8,
                            padding: "10px 12px", cursor: "pointer" }}>
                          <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>{u.nombre}</div>
                          <div style={{ color: "#475569", fontSize: 11 }}>{u.email} {u.telefono && "· " + u.telefono}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Buscar booking (opcional) */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Hash size={14} color="#8B5CF6"/>
                <span style={{ color: "#8B5CF6", fontSize: 13, fontWeight: 700 }}>Reserva (opcional)</span>
                {bookSel && (
                  <button onClick={() => { setBookSel(null); setBusqBook(""); setBookings([]); }}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 12 }}>
                    Quitar
                  </button>
                )}
              </div>
              {bookSel ? (
                <div style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14 }}>#{bookSel.codigo_reserva}</div>
                  <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>{bookSel.ruta} · Bs. {bookSel.precio_total}</div>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#475569" }}/>
                    <input value={busqBook}
                      onChange={e => { setBusqBook(e.target.value); buscarBookings(e.target.value); }}
                      placeholder="Buscar por codigo o nombre..."
                      style={{ ...INPUT, paddingLeft: 32, fontSize: 13 }}/>
                  </div>
                  {bookings.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
                      {bookings.map(b => (
                        <button key={b.id} onClick={() => { setBookSel(b); setBookings([]); setBusqBook(""); if (!userSel) setUserSel({ id: b.user_id, nombre: b.user_nombre, email: b.user_email }); }}
                          style={{ textAlign: "left", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>
                          <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>#{b.codigo_reserva} — {b.ruta}</div>
                          <div style={{ color: "#475569", fontSize: 11 }}>{b.user_nombre} · Bs. {b.precio_total} · {b.estado}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Canales */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Send size={14} color="#D4AF37"/>
                <span style={{ color: "#D4AF37", fontSize: 13, fontWeight: 700 }}>Canales de envio</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CANALES.map(c => {
                  const activo = canales.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCanal(c.id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: activo ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                      outline: activo ? "1px solid " + c.color + "44" : "1px solid rgba(255,255,255,0.06)",
                      textAlign: "left", transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: activo ? c.color + "22" : "rgba(255,255,255,0.04)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <c.Icon size={15} color={activo ? c.color : "#475569"}/>
                      </div>
                      <span style={{ color: activo ? "#F1F5F9" : "#64748B", fontWeight: 600, fontSize: 14, flex: 1 }}>
                        {c.label}
                      </span>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5,
                        background: activo ? c.color : "rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {activo && <CheckCircle size={12} color="#fff"/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna derecha — mensaje */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Mensaje */}
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Bell size={14} color="#D4AF37"/>
                <span style={{ color: "#D4AF37", fontSize: 13, fontWeight: 700 }}>Mensaje</span>
                <button onClick={() => setShowPlant(!showPlant)} style={{
                  marginLeft: "auto", ...BTN_GHOST, padding: "6px 12px", fontSize: 12,
                }}>
                  Plantillas <ChevronDown size={12}/>
                </button>
              </div>

              {/* Plantillas dropdown */}
              <AnimatePresence>
                {showPlant && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    style={{ background: "#0d1a3a", border: "1px solid rgba(212,175,55,0.15)",
                      borderRadius: 12, padding: 8, marginBottom: 12 }}>
                    {PLANTILLAS.map((p, i) => (
                      <button key={i} onClick={() => usarPlantilla(p)} style={{
                        width: "100%", textAlign: "left", background: "none",
                        border: "none", borderRadius: 8, padding: "10px 12px",
                        cursor: "pointer", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.titulo}</div>
                        <div style={{ color: "#475569", fontSize: 11 }}>{p.mensaje.substring(0, 60)}...</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input value={titulo} onChange={e => setTitulo(e.target.value)}
                  placeholder="Titulo de la notificacion" style={INPUT}/>
                <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
                  placeholder="Escribe el mensaje para el pasajero..." rows={5}
                  style={{ ...INPUT, resize: "none" }}/>
              </div>
            </div>

            {/* Preview */}
            {(titulo || mensaje) && (
              <div style={{ ...CARD, background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.12)" }}>
                <div style={{ color: "#D4AF37", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>PREVIEW</div>
                <div style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{titulo}</div>
                <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.6 }}>{mensaje}</div>
                {bookSel && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)",
                    borderRadius: 8, color: "#D4AF37", fontSize: 12, fontWeight: 700 }}>
                    Codigo: #{bookSel.codigo_reserva}
                  </div>
                )}
              </div>
            )}

            {/* Resultado */}
            <AnimatePresence>
              {resultado && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ ...CARD, borderColor: resultado.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    {resultado.ok
                      ? <CheckCircle size={16} color="#22C55E"/>
                      : <XCircle size={16} color="#EF4444"/>
                    }
                    <span style={{ color: resultado.ok ? "#22C55E" : "#EF4444", fontWeight: 700, fontSize: 14 }}>
                      {resultado.ok ? `Enviado en ${resultado.exitosos} canal(es)` : "Error al enviar"}
                    </span>
                  </div>
                  {resultado.resultados && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {Object.entries(resultado.resultados).map(([canal, res]) => (
                        <ResultadoCanal key={canal} canal={canal} resultado={res}/>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boton enviar */}
            <button onClick={enviar} disabled={!canEnviar} style={{
              ...BTN_PRIMARY, justifyContent: "center", padding: "14px",
              opacity: canEnviar ? 1 : 0.4, fontSize: 15,
            }}>
              {enviando
                ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(10,18,60,0.3)", borderTopColor: "#0a1128", animation: "spin 0.8s linear infinite" }}/> Enviando...</>
                : <><Send size={16}/> Enviar notificacion</>
              }
            </button>
          </div>
        </div>
      )}

      {tab === "historial" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={cargarHistorial} style={BTN_GHOST}>
              <RefreshCw size={14} style={{ animation: loadHist ? "spin 1s linear infinite" : "none" }}/> Actualizar
            </button>
          </div>
          {historial.length === 0 && !loadHist && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
              <Bell size={40} style={{ margin: "0 auto 12px", opacity: 0.15 }}/>
              <p style={{ fontSize: 14, color: "#475569" }}>Sin notificaciones enviadas aun</p>
            </div>
          )}
          {historial.map((item, i) => <HistorialItem key={item.id} item={item} index={i}/>)}
        </div>
      )}

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
