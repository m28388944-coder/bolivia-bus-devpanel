import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Plus, MessageSquare, AlertCircle, Clock,
  CheckCircle, XCircle, ChevronRight, Send, Lock,
  Filter, Search, User, Calendar, Tag, ArrowLeft,
  MoreHorizontal, Edit3, Trash2, Bell
} from "lucide-react";
import api from "../api/client";

const PRIORIDAD_CONFIG = {
  baja:    { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  label: "Baja" },
  media:   { color: "#D4AF37", bg: "rgba(212,175,55,0.12)",  border: "rgba(212,175,55,0.3)",  label: "Media" },
  alta:    { color: "#F97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.3)",  label: "Alta" },
  critica: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   label: "Critica" },
};

const ESTADO_CONFIG = {
  abierto:    { color: "#22C55E", bg: "rgba(34,197,94,0.12)",   label: "Abierto",    Icon: AlertCircle },
  en_proceso: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label: "En proceso", Icon: Clock },
  resuelto:   { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label: "Resuelto",   Icon: CheckCircle },
  cerrado:    { color: "#64748B", bg: "rgba(100,116,139,0.12)", label: "Cerrado",    Icon: XCircle },
};

const SISTEMAS = ["general","frontend_pasajero","panel_admin","app_chofer","backend","postgres"];

const CARD = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
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
  transition: "border-color 0.2s",
};

const BTN_PRIMARY = {
  background: "linear-gradient(135deg, #D4AF37, #b8941f)",
  border: "none", borderRadius: 10,
  padding: "11px 20px", cursor: "pointer",
  color: "#0a1128", fontWeight: 800, fontSize: 14,
  display: "flex", alignItems: "center", gap: 6,
  fontFamily: "inherit", whiteSpace: "nowrap",
};

const BTN_GHOST = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px",
  cursor: "pointer", color: "#94A3B8",
  display: "flex", alignItems: "center", gap: 6,
  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
};

const fmt = (dt) => {
  if (!dt) return "-";
  const d = new Date(dt);
  const ahora = new Date();
  const diff = (ahora - d) / 1000;
  if (diff < 60) return "Hace un momento";
  const mins = Math.floor(diff/60); const horas = Math.floor(diff/3600);
  if (diff < 3600) return "Hace " + mins + "m";
  if (diff < 86400) return "Hace " + horas + "h";
  return d.toLocaleDateString("es-BO", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
};
function Badge({ tipo, valor }) {
  const c = tipo === "prioridad" ? (PRIORIDAD_CONFIG[valor] || PRIORIDAD_CONFIG.media)
                                 : (ESTADO_CONFIG[valor] || ESTADO_CONFIG.abierto);
  return (
    <span style={{
      background: c.bg,
      border: tipo === "prioridad" ? "1px solid " + c.border : "none",
      borderRadius: 99, padding: "3px 10px",
      color: c.color, fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap",
    }}>{c.label || valor}</span>
  );
}

function TicketCard({ t, activo, onClick }) {
  const ec = ESTADO_CONFIG[t.estado] || ESTADO_CONFIG.abierto;
  const pc = PRIORIDAD_CONFIG[t.prioridad] || PRIORIDAD_CONFIG.media;
  return (
    <motion.button onClick={onClick}
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: activo ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.02)",
        border: activo ? "1px solid rgba(212,175,55,0.25)" : "1px solid rgba(255,255,255,0.05)",
        borderLeft: activo ? "3px solid #D4AF37" : "3px solid transparent",
        borderRadius: 13, padding: "15px 16px",
        transition: "all 0.18s", marginBottom: 6,
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <span style={{ color: "#F1F5F9", fontWeight: 700, fontSize: 14, lineHeight: 1.4, flex: 1 }}>
          {t.titulo}
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: ec.color, flexShrink: 0, marginTop: 5,
          boxShadow: t.estado === "abierto" ? "0 0 6px " + ec.color : "none",
        }} />
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Badge tipo="prioridad" valor={t.prioridad} />
        <Badge tipo="estado" valor={t.estado} />
        <span style={{ color: "#475569", fontSize: 11, marginLeft: "auto" }}>
          {t.total_mensajes} msg · {fmt(t.updated_at || t.created_at)}
        </span>
      </div>
      <div style={{ color: "#475569", fontSize: 11, marginTop: 6 }}>
        {t.user_nombre} · {t.sistema}
      </div>
    </motion.button>
  );
}

function MensajeItem({ m, index }) {
  const isNota = m.es_nota_interna;
  const isDev = m.autor_rol === "developer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: isDev ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}>
      <div style={{ maxWidth: "85%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
          flexDirection: isDev ? "row-reverse" : "row" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: isDev ? "linear-gradient(135deg,#D4AF37,#b8941f)" : "rgba(59,130,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: isDev ? "#0a1128" : "#60A5FA",
          }}>
            {m.autor_nombre?.[0]?.toUpperCase() || "?"}
          </div>
          <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>{m.autor_nombre}</span>
          {isNota && (
            <span style={{ display:"flex", alignItems:"center", gap:3,
              color:"#D4AF37", fontSize:11, background:"rgba(212,175,55,0.1)",
              border:"1px solid rgba(212,175,55,0.2)", borderRadius:99, padding:"2px 7px" }}>
              <Lock size={9}/> Nota interna
            </span>
          )}
          <span style={{ color:"#334155", fontSize:11 }}>{fmt(m.created_at)}</span>
        </div>
        <div style={{
          borderRadius: isDev ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          padding: "11px 15px",
          background: isNota ? "rgba(212,175,55,0.07)"
                    : isDev ? "rgba(27,42,107,0.6)"
                    : "rgba(255,255,255,0.05)",
          border: isNota ? "1px solid rgba(212,175,55,0.18)"
                : isDev ? "1px solid rgba(27,42,107,0.8)"
                : "1px solid rgba(255,255,255,0.07)",
          color: "#CBD5E1", fontSize: 14, lineHeight: 1.6,
        }}>
          {m.mensaje}
        </div>
      </div>
    </motion.div>
  );
}

export default function Soporte() {
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [ticketActivo, setTicketActivo] = useState(null);
  const [detalle, setDetalle]           = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda]         = useState("");
  const [showNuevo, setShowNuevo]       = useState(false);
  const [nuevoMsg, setNuevoMsg]         = useState("");
  const [esNota, setEsNota]             = useState(false);
  const [enviando, setEnviando]         = useState(false);
  const [editandoNota, setEditandoNota] = useState(false);
  const [notaText, setNotaText]         = useState("");
  const [nuevoTicket, setNuevoTicket]   = useState({
    titulo: "", descripcion: "", sistema: "general", prioridad: "media", mensaje: ""
  });
  const msgEndRef = useRef(null);

  const cargar = async () => {
    setLoading(true);
    try { const r = await api.get("/dev/tickets"); setTickets(r.data); }
    catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const cargarDetalle = async (id) => {
    setLoadingDetalle(true);
    try { const r = await api.get("/dev/tickets/" + id); setDetalle(r.data); setNotaText(r.data.nota_interna || ""); }
    catch(e) { console.error(e); } finally { setLoadingDetalle(false); }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [detalle?.mensajes]);

  const abrirTicket = (t) => { setTicketActivo(t.id); cargarDetalle(t.id); };

  const enviarMensaje = async () => {
    if (!nuevoMsg.trim() || !ticketActivo) return;
    setEnviando(true);
    try {
      await api.post("/dev/tickets/" + ticketActivo + "/mensajes", { mensaje: nuevoMsg, es_nota_interna: esNota });
      setNuevoMsg("");
      await cargarDetalle(ticketActivo);
      await cargar();
    } catch(e) { console.error(e); } finally { setEnviando(false); }
  };

  const cambiarEstado = async (estado) => {
    if (!ticketActivo) return;
    await api.patch("/dev/tickets/" + ticketActivo, { estado });
    await cargar();
    await cargarDetalle(ticketActivo);
  };

  const cambiarPrioridad = async (prioridad) => {
    if (!ticketActivo) return;
    await api.patch("/dev/tickets/" + ticketActivo, { prioridad });
    await cargar();
    await cargarDetalle(ticketActivo);
  };

  const guardarNota = async () => {
    if (!ticketActivo) return;
    await api.patch("/dev/tickets/" + ticketActivo, { nota_interna: notaText });
    await cargarDetalle(ticketActivo);
    setEditandoNota(false);
  };

  const crearTicket = async () => {
    if (!nuevoTicket.titulo || !nuevoTicket.descripcion) return;
    try {
      const r = await api.post("/dev/tickets", nuevoTicket);
      setShowNuevo(false);
      setNuevoTicket({ titulo:"", descripcion:"", sistema:"general", prioridad:"media", mensaje:"" });
      await cargar();
      abrirTicket({ id: r.data.ticket_id });
    } catch(e) { console.error(e); }
  };

  const filtrados = tickets.filter(t => {
    const matchEstado = !filtroEstado || t.estado === filtroEstado;
    const matchBusq = !busqueda || t.titulo.toLowerCase().includes(busqueda.toLowerCase())
                               || t.user_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusq;
  });

  const conteos = Object.fromEntries(
    ["abierto","en_proceso","resuelto","cerrado"].map(e => [e, tickets.filter(t => t.estado === e).length])
  );

  return (
    <div style={{ display:"flex", gap:24, height:"calc(100vh - 80px)", fontFamily:"inherit" }}>

      {/* ── PANEL IZQUIERDO ── */}
      <div style={{ width:340, flexShrink:0, display:"flex", flexDirection:"column", gap:14 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <div style={{ width:3, height:22, background:"#D4AF37", borderRadius:4 }}/>
              <h2 style={{ fontSize:20, fontWeight:800, color:"#F1F5F9", margin:0 }}>Soporte</h2>
            </div>
            <p style={{ color:"#475569", fontSize:12, margin:0, marginLeft:11 }}>
              {tickets.length} tickets · {conteos.abierto || 0} abiertos
            </p>
          </div>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={cargar} style={BTN_GHOST}>
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite":"none" }}/>
            </button>
            <button onClick={() => setShowNuevo(true)} style={BTN_PRIMARY}>
              <Plus size={15}/> Nuevo
            </button>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display:"flex", gap:6 }}>
          {Object.entries(conteos).map(([e,n]) => {
            const ec = ESTADO_CONFIG[e];
            return (
              <button key={e} onClick={() => setFiltroEstado(filtroEstado === e ? "" : e)} style={{
                flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer",
                background: filtroEstado === e ? ec.bg : "rgba(255,255,255,0.03)",
                outline: filtroEstado === e ? "1px solid " + ec.color + "44" : "none",
                transition:"all 0.15s",
              }}>
                <div style={{ color: ec.color, fontWeight:800, fontSize:15 }}>{n}</div>
                <div style={{ color: filtroEstado === e ? ec.color : "#475569", fontSize:10, fontWeight:600 }}>
                  {ec.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Busqueda */}
        <div style={{ position:"relative" }}>
          <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#475569" }}/>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar tickets..." style={{ ...INPUT, paddingLeft:32, fontSize:13 }}/>
        </div>

        {/* Lista */}
        <div style={{ flex:1, overflowY:"auto", paddingRight:4 }}>
          {filtrados.length === 0 && !loading && (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#475569" }}>
              <MessageSquare size={36} style={{ margin:"0 auto 10px", opacity:0.2 }}/>
              <p style={{ fontSize:14 }}>Sin tickets</p>
            </div>
          )}
          {filtrados.map(t => (
            <TicketCard key={t.id} t={t} activo={ticketActivo === t.id} onClick={() => abrirTicket(t)}/>
          ))}
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {!ticketActivo ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"#334155" }}>
            <MessageSquare size={52} style={{ opacity:0.15 }}/>
            <p style={{ fontSize:15, color:"#475569" }}>Selecciona un ticket para ver el detalle</p>
          </div>
        ) : loadingDetalle ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", border:"2px solid rgba(212,175,55,0.15)", borderTopColor:"#D4AF37", animation:"spin 0.8s linear infinite" }}/>
          </div>
        ) : detalle && (
          <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:14 }}>

            {/* Info header */}
            <div style={{ ...CARD, padding:"18px 22px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ color:"#F1F5F9", fontWeight:800, fontSize:17, margin:"0 0 6px",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {detalle.titulo}
                  </h3>
                  <p style={{ color:"#64748B", fontSize:13, margin:"0 0 12px", lineHeight:1.5 }}>{detalle.descripcion}</p>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    {[
                      { icon: User, label: detalle.user_nombre || "Anónimo" },
                      { icon: Tag, label: detalle.sistema },
                      { icon: Calendar, label: fmt(detalle.created_at) },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} style={{ display:"flex", alignItems:"center", gap:5, color:"#64748B", fontSize:12 }}>
                        <Icon size={12}/> {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles estado + prioridad */}
                <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    {Object.entries(ESTADO_CONFIG).map(([e, ec]) => (
                      <button key={e} onClick={() => cambiarEstado(e)} style={{
                        padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer",
                        fontWeight:700, fontSize:11, transition:"all 0.15s",
                        background: detalle.estado === e ? ec.bg : "rgba(255,255,255,0.04)",
                        color: detalle.estado === e ? ec.color : "#475569",
                        outline: detalle.estado === e ? "1px solid " + ec.color + "44" : "none",
                      }}>{ec.label}</button>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    {Object.entries(PRIORIDAD_CONFIG).map(([p, pc]) => (
                      <button key={p} onClick={() => cambiarPrioridad(p)} style={{
                        padding:"5px 10px", borderRadius:8, border:"none", cursor:"pointer",
                        fontWeight:700, fontSize:10, transition:"all 0.15s",
                        background: detalle.prioridad === p ? pc.bg : "rgba(255,255,255,0.04)",
                        color: detalle.prioridad === p ? pc.color : "#475569",
                        outline: detalle.prioridad === p ? "1px solid " + pc.border : "none",
                      }}>{pc.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nota interna */}
              <div style={{ marginTop:14, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <Lock size={12} color="#D4AF37"/>
                  <span style={{ color:"#D4AF37", fontSize:12, fontWeight:700 }}>Nota interna</span>
                  <button onClick={() => setEditandoNota(!editandoNota)} style={{
                    marginLeft:"auto", background:"none", border:"none", cursor:"pointer",
                    color:"#475569", display:"flex", alignItems:"center", gap:4, fontSize:12
                  }}>
                    <Edit3 size={12}/> {editandoNota ? "Cancelar" : "Editar"}
                  </button>
                </div>
                {editandoNota ? (
                  <div style={{ display:"flex", gap:8 }}>
                    <textarea value={notaText} onChange={e => setNotaText(e.target.value)} rows={2}
                      style={{ ...INPUT, flex:1, resize:"none", fontSize:13 }}/>
                    <button onClick={guardarNota} style={{ ...BTN_PRIMARY, padding:"8px 14px" }}>
                      Guardar
                    </button>
                  </div>
                ) : (
                  <p style={{ color: detalle.nota_interna ? "#94A3B8" : "#334155",
                    fontSize:13, margin:0, fontStyle: detalle.nota_interna ? "normal":"italic" }}>
                    {detalle.nota_interna || "Sin notas internas"}
                  </p>
                )}
              </div>
            </div>

            {/* Conversacion */}
            <div style={{ ...CARD, flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)",
                display:"flex", alignItems:"center", gap:8 }}>
                <MessageSquare size={14} color="#D4AF37"/>
                <span style={{ color:"#94A3B8", fontSize:13, fontWeight:700 }}>
                  Conversacion ({detalle.mensajes.length})
                </span>
              </div>

              <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
                {detalle.mensajes.length === 0 && (
                  <div style={{ textAlign:"center", padding:"30px 0", color:"#334155" }}>
                    <p style={{ fontSize:13 }}>Sin mensajes aun</p>
                  </div>
                )}
                {detalle.mensajes.map((m, i) => <MensajeItem key={m.id} m={m} index={i}/>)}
                <div ref={msgEndRef}/>
              </div>

              {/* Responder */}
              <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                  {[
                    { label:"Respuesta", nota:false, icon:null },
                    { label:"Nota interna", nota:true, icon:<Lock size={11}/> }
                  ].map(opt => (
                    <button key={opt.label} onClick={() => setEsNota(opt.nota)} style={{
                      padding:"6px 14px", borderRadius:99, border:"none", cursor:"pointer",
                      fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:5,
                      background: esNota === opt.nota ? (opt.nota ? "rgba(212,175,55,0.12)" : "rgba(27,42,107,0.5)") : "rgba(255,255,255,0.04)",
                      color: esNota === opt.nota ? (opt.nota ? "#D4AF37" : "#60A5FA") : "#475569",
                      outline: esNota === opt.nota ? ("1px solid " + (opt.nota ? "rgba(212,175,55,0.3)" : "rgba(59,130,246,0.3)")) : "none",
                    }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <textarea value={nuevoMsg} onChange={e => setNuevoMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }}}
                    placeholder={esNota ? "Nota solo para el equipo (no visible al pasajero)..." : "Escribe una respuesta... (Enter para enviar)"}
                    rows={2} style={{ ...INPUT, flex:1, resize:"none", fontSize:13,
                      borderColor: esNota ? "rgba(212,175,55,0.3)" : "rgba(59,130,246,0.2)" }}/>
                  <button onClick={enviarMensaje} disabled={enviando || !nuevoMsg.trim()} style={{
                    ...BTN_PRIMARY, padding:"0 18px", opacity: (enviando || !nuevoMsg.trim()) ? 0.4 : 1,
                  }}>
                    <Send size={16}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL NUEVO TICKET ── */}
      <AnimatePresence>
        {showNuevo && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex",
              alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}
            onClick={e => e.target === e.currentTarget && setShowNuevo(false)}>
            <motion.div initial={{ scale:0.94, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.94, opacity:0 }}
              style={{ background:"#0d1a3a", border:"1px solid rgba(212,175,55,0.2)",
                borderRadius:20, padding:30, width:"100%", maxWidth:500 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
                <div style={{ width:3, height:20, background:"#D4AF37", borderRadius:4 }}/>
                <h3 style={{ color:"#F1F5F9", fontWeight:800, fontSize:18, margin:0 }}>Nuevo Ticket</h3>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <input value={nuevoTicket.titulo}
                  onChange={e => setNuevoTicket(f => ({...f, titulo:e.target.value}))}
                  placeholder="Titulo del ticket" style={INPUT}/>
                <textarea value={nuevoTicket.descripcion}
                  onChange={e => setNuevoTicket(f => ({...f, descripcion:e.target.value}))}
                  placeholder="Descripcion del problema" rows={3}
                  style={{ ...INPUT, resize:"none" }}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <select value={nuevoTicket.sistema}
                    onChange={e => setNuevoTicket(f => ({...f, sistema:e.target.value}))} style={INPUT}>
                    {SISTEMAS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={nuevoTicket.prioridad}
                    onChange={e => setNuevoTicket(f => ({...f, prioridad:e.target.value}))} style={INPUT}>
                    {["baja","media","alta","critica"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <textarea value={nuevoTicket.mensaje}
                  onChange={e => setNuevoTicket(f => ({...f, mensaje:e.target.value}))}
                  placeholder="Primer mensaje (opcional)" rows={2}
                  style={{ ...INPUT, resize:"none" }}/>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:22 }}>
                <button onClick={() => setShowNuevo(false)} style={{ ...BTN_GHOST, flex:1, justifyContent:"center", padding:"12px" }}>
                  Cancelar
                </button>
                <button onClick={crearTicket} style={{ ...BTN_PRIMARY, flex:1, justifyContent:"center", padding:"12px" }}>
                  Crear Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}

