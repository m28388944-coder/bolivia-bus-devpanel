import { useState, useEffect, useRef, useCallback } from "react"

const API = "http://localhost:8000/dev"

const CONSULTAS_RAPIDAS = [
  { label: "👥 Todos los usuarios",     query: "SELECT id, email, rol, activo FROM users;" },
  { label: "🎫 Reservas pendientes",    query: "SELECT * FROM bookings WHERE status = 'pending';" },
  { label: "🚌 Viajes activos hoy",     query: "SELECT * FROM schedules WHERE status = 'in_progress';" },
  { label: "🛣️ Rutas activas",          query: "SELECT * FROM routes WHERE is_active = true;" },
  { label: "🎟️ Tickets sin resolver",   query: "SELECT * FROM support_tickets WHERE status != 'resolved' ORDER BY created_at DESC;" },
  { label: "📊 Reservas por estado",    query: "SELECT status as estado, COUNT(*) as total FROM bookings GROUP BY status ORDER BY total DESC;" },
  { label: "💰 Ingresos del día",       query: "SELECT COALESCE(SUM(total_price), 0) as ingresos_hoy FROM bookings WHERE DATE(created_at) = CURRENT_DATE AND status = 'confirmed';" },
  { label: "📍 Últimas posiciones GPS", query: "SELECT * FROM gps_tracking ORDER BY id DESC LIMIT 20;" },
]

const ACCIONES_SOPORTE = [
  { label: "✅ Confirmar reserva",  query: "UPDATE bookings SET status = 'confirmed' WHERE id = 'PEGAR-UUID-AQUI';" },
  { label: "❌ Cancelar reserva",   query: "UPDATE bookings SET status = 'cancelled' WHERE id = 'PEGAR-UUID-AQUI';" },
  { label: "🔓 Activar usuario",    query: "UPDATE users SET activo = true WHERE email = 'email@ejemplo.com';" },
  { label: "🔒 Desactivar usuario", query: "UPDATE users SET activo = false WHERE email = 'email@ejemplo.com';" },
  { label: "🚌 Iniciar viaje",      query: "UPDATE schedules SET status = 'in_progress' WHERE id = 0;" },
  { label: "✔️ Completar viaje",    query: "UPDATE schedules SET status = 'completed' WHERE id = 0;" },
]

export default function SqlStudio() {
  const token = localStorage.getItem("dev_token")
  const [query, setQuery] = useState("SELECT id, email, rol, activo FROM users;")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tables, setTables] = useState([])
  const [limit, setLimit] = useState(100)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState("datos")
  const [buscarTabla, setBuscarTabla] = useState("")
  const [tablaActiva, setTablaActiva] = useState("")
  const editorRef = useRef(null)

  useEffect(() => { fetchTablas() }, [])

  const fetchTablas = async () => {
    try {
      const r = await fetch(`${API}/sql/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await r.json()
      setTables(Array.isArray(data) ? data : [])
    } catch {}
  }

  const ejecutarQuery = useCallback(async () => {
    if (!query.trim() || loading) return
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query, limit })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.detail || "Error en la consulta")
      setResults(data)
      setHistory(h => [{
        query, filas: data.row_count,
        tiempo: data.execution_time_ms,
        hora: new Date().toLocaleTimeString("es-BO"),
        ok: true
      }, ...h.slice(0, 49)])
      setActiveTab("datos")
    } catch (e) {
      setError(e.message)
      setHistory(h => [{
        query, error: e.message,
        hora: new Date().toLocaleTimeString("es-BO"),
        ok: false
      }, ...h.slice(0, 49)])
      setActiveTab("mensajes")
    } finally { setLoading(false) }
  }, [query, limit, token])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); ejecutarQuery() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [ejecutarQuery])

  const exportarCSV = () => {
    if (!results?.rows?.length) return
    const csv = [results.columns.join(","),
      ...results.rows.map(r => r.map(v => `"${v ?? ""}"`).join(","))].join("\n")
    const a = document.createElement("a")
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    a.download = `boliviabus_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  const exportarJSON = () => {
    if (!results?.rows?.length) return
    const obj = results.rows.map(r => Object.fromEntries(results.columns.map((c,i) => [c, r[i]])))
    const a = document.createElement("a")
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2))
    a.download = `boliviabus_${new Date().toISOString().slice(0,10)}.json`; a.click()
  }

  const colorCelda = (val, col) => {
    if (val === null) return "#94a3b8"
    if (col === "id") return "#1B2A6B"
    if (val === "True" || val === "true" || val === "confirmed") return "#15803d"
    if (val === "False" || val === "false" || val === "cancelled") return "#C8102E"
    if (val === "pending") return "#b45309"
    if (val === "in_progress") return "#1d4ed8"
    if (val === "developer") return "#7c3aed"
    if (val === "admin") return "#1B2A6B"
    if (val === "chofer") return "#0369a1"
    if (val?.match?.(/^\d{4}-\d{2}-\d{2}/)) return "#6d28d9"
    if (!isNaN(val) && val !== "") return "#0369a1"
    return "#1e293b"
  }

  const bgCelda = (val) => {
    if (val === "True" || val === "true" || val === "confirmed") return "#dcfce7"
    if (val === "False" || val === "false" || val === "cancelled") return "#fee2e2"
    if (val === "pending") return "#fef3c7"
    if (val === "in_progress") return "#dbeafe"
    if (val === "developer") return "#f3e8ff"
    if (val === "admin") return "#e0e7ff"
    if (val === "chofer") return "#e0f2fe"
    return "transparent"
  }

  const tablasFiltradas = tables.filter(t =>
    t.name.toLowerCase().includes(buscarTabla.toLowerCase()))

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#f1f5f9",
      fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, color: "#1e293b"
    }}>

      {/* Panel izquierdo */}
      <div style={{
        width: 220, background: "#fff",
        borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column", flexShrink: 0,
        boxShadow: "2px 0 8px #1B2A6B11"
      }}>
        {/* Header */}
        <div style={{
          background: "#1B2A6B", padding: "14px 14px 12px"
        }}>
          <div style={{ color: "#D4AF37", fontSize: 10, fontWeight: 700,
            letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
            🗄️ Base de Datos
          </div>
          <input value={buscarTabla} onChange={e => setBuscarTabla(e.target.value)}
            placeholder="Buscar tabla..."
            style={{
              width: "100%", background: "#142058",
              border: "1px solid #2a3d8f", borderRadius: 7,
              color: "#c7d2f0", fontSize: 11, padding: "6px 10px",
              fontFamily: "inherit", outline: "none", boxSizing: "border-box"
            }} />
        </div>

        {/* Tablas */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {tablasFiltradas.map(t => (
            <div key={t.name}
              onClick={() => {
                setQuery(`SELECT * FROM ${t.name};`)
                setTablaActiva(t.name)
                editorRef.current?.focus()
              }}
              style={{
                padding: "8px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                borderBottom: "1px solid #f1f5f9", transition: "all .1s",
                background: tablaActiva === t.name ? "#eff6ff" : "transparent",
                borderLeft: tablaActiva === t.name ? "3px solid #1B2A6B" : "3px solid transparent"
              }}
              onMouseEnter={e => { if (tablaActiva !== t.name) e.currentTarget.style.background = "#f8fafc" }}
              onMouseLeave={e => { if (tablaActiva !== t.name) e.currentTarget.style.background = "transparent" }}>
              <span style={{ color: "#1B2A6B", fontSize: 13 }}>▦</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", color: tablaActiva === t.name ? "#1B2A6B" : "#475569",
                fontSize: 12, fontWeight: tablaActiva === t.name ? 600 : 400
              }}>{t.name}</span>
              <span style={{
                fontSize: 9, color: t.rows > 0 ? "#1B2A6B" : "#94a3b8",
                background: t.rows > 0 ? "#e0e7ff" : "#f1f5f9",
                padding: "1px 6px", borderRadius: 10, fontWeight: 600
              }}>{t.rows}</span>
            </div>
          ))}
        </div>

        {/* Acciones soporte */}
        <div style={{ borderTop: "2px solid #e2e8f0" }}>
          <div style={{
            background: "#1B2A6B", padding: "8px 14px",
            color: "#D4AF37", fontSize: 9, fontWeight: 700,
            letterSpacing: "1px", textTransform: "uppercase"
          }}>🔧 Acciones de Soporte</div>
          {ACCIONES_SOPORTE.map((a, i) => (
            <div key={i} onClick={() => { setQuery(a.query); editorRef.current?.focus() }}
              style={{
                padding: "7px 14px", cursor: "pointer", fontSize: 11,
                color: "#475569", borderBottom: "1px solid #f1f5f9", transition: "all .1s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#1B2A6B" }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569" }}>
              {a.label}
            </div>
          ))}
        </div>
      </div>

      {/* Area principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header principal */}
        <div style={{
          background: "#1B2A6B", padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          boxShadow: "0 2px 8px #1B2A6B44"
        }}>
          <div style={{ color: "#D4AF37", fontSize: 16, fontWeight: 800,
            letterSpacing: "-0.3px" }}>🗄️ SQL Studio</div>
          <div style={{
            background: "#142058", border: "1px solid #2a3d8f",
            borderRadius: 5, padding: "3px 10px", fontSize: 10,
            color: "#93c5fd", fontWeight: 600, letterSpacing: "0.3px"
          }}>PostgreSQL · boliviabus</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {results && (
              <div style={{
                background: "#142058", border: "1px solid #2a3d8f",
                borderRadius: 6, padding: "4px 12px", fontSize: 11,
                color: "#93c5fd", display: "flex", gap: 10, alignItems: "center"
              }}>
                <span style={{ color: "#86efac" }}>✓ {results.row_count} filas</span>
                <span style={{ color: "#5b72b8" }}>·</span>
                <span>{results.execution_time_ms}ms</span>
                <span style={{ color: "#5b72b8" }}>·</span>
                <span style={{ color: "#D4AF37" }}>{results.query_type}</span>
              </div>
            )}
            {[
              { label: "⬇ Exportar CSV",  fn: exportarCSV },
              { label: "⬇ Exportar JSON", fn: exportarJSON },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} style={{
                background: "#142058", border: "1px solid #2a3d8f",
                borderRadius: 6, padding: "5px 12px", fontSize: 11,
                color: "#93c5fd", cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#2a3d8f"}
                onMouseLeave={e => e.currentTarget.style.background = "#142058"}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Consultas rápidas */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "8px 20px", display: "flex", gap: 6,
          overflowX: "auto", flexShrink: 0, alignItems: "center"
        }}>
          <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.8px", whiteSpace: "nowrap", marginRight: 4,
            textTransform: "uppercase" }}>Consultas rápidas</span>
          {CONSULTAS_RAPIDAS.map((q, i) => (
            <button key={i} onClick={() => { setQuery(q.query); editorRef.current?.focus() }}
              style={{
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 6, padding: "5px 12px", fontSize: 11,
                color: "#475569", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "inherit", transition: "all .12s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#1B2A6B"
                e.currentTarget.style.color = "#fff"
                e.currentTarget.style.borderColor = "#1B2A6B"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8fafc"
                e.currentTarget.style.color = "#475569"
                e.currentTarget.style.borderColor = "#e2e8f0"
              }}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "8px 20px", display: "flex", alignItems: "center",
          gap: 10, flexShrink: 0
        }}>
          <button onClick={ejecutarQuery} disabled={loading} style={{
            background: loading ? "#94a3b8" : "#1B2A6B",
            border: "none", color: "#fff", padding: "7px 20px",
            borderRadius: 8, cursor: loading ? "wait" : "pointer",
            fontWeight: 700, fontSize: 13, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 7,
            boxShadow: loading ? "none" : "0 2px 8px #1B2A6B44",
            transition: "all .15s"
          }}>
            {loading ? "⏳ Ejecutando..." : "▶ Ejecutar consulta"}
          </button>

          <div style={{ width: 1, height: 24, background: "#e2e8f0" }}></div>

          <span style={{ color: "#94a3b8", fontSize: 12 }}>Límite de filas</span>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 6, color: "#1e293b", padding: "5px 8px",
            fontSize: 12, fontFamily: "inherit", outline: "none"
          }}>
            {[50, 100, 500, 1000].map(n => (
              <option key={n} value={n}>{n} filas máximo</option>
            ))}
          </select>

          <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 6, padding: "5px 12px", fontSize: 11, color: "#94a3b8"
          }}>⌨️ Ctrl+Enter para ejecutar</div>

          <button onClick={() => setQuery("")} style={{
            marginLeft: "auto", background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 6, padding: "5px 12px", fontSize: 11,
            color: "#94a3b8", cursor: "pointer", fontFamily: "inherit",
            transition: "all .12s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#C8102E" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8" }}>
            ✕ Limpiar editor
          </button>
        </div>

        {/* Editor SQL */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {loading && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, #1B2A6B, #D4AF37, #1B2A6B)",
              backgroundSize: "200% 100%",
              animation: "deslizar 1.5s linear infinite", zIndex: 10
            }}></div>
          )}
          <textarea ref={editorRef} value={query} onChange={e => setQuery(e.target.value)}
            rows={6} spellCheck={false}
            placeholder={"-- Escribe tu consulta SQL aquí...\n-- Ctrl+Enter para ejecutar\n-- Haz clic en una tabla del panel izquierdo para cargar automáticamente\n\nSELECT * FROM users LIMIT 50;"}
            style={{
              width: "100%", background: "#0f172a",
              borderBottom: "1px solid #1e293b",
              outline: "none", color: "#e2e8f0", border: "none",
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 13, lineHeight: 1.7,
              padding: "14px 20px", resize: "none",
              boxSizing: "border-box", caretColor: "#D4AF37"
            }} />
        </div>

        {/* Tabs */}
        <div style={{
          background: "#fff", borderBottom: "2px solid #e2e8f0",
          display: "flex", padding: "0 20px", flexShrink: 0
        }}>
          {[
            { id: "datos",     label: `📊 Resultados${results ? ` · ${results.row_count} filas` : ""}` },
            { id: "mensajes",  label: `💬 Mensajes${error ? " ⚠️" : results ? " ✓" : ""}` },
            { id: "historial", label: `📋 Historial · ${history.length} consultas` },
          ].map(tab => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 16px", fontSize: 12, cursor: "pointer",
              color: activeTab === tab.id ? "#1B2A6B" : "#94a3b8",
              borderBottom: activeTab === tab.id ? "2px solid #1B2A6B" : "2px solid transparent",
              fontWeight: activeTab === tab.id ? 700 : 400,
              transition: "all .12s", whiteSpace: "nowrap",
              marginBottom: -2
            }}>{tab.label}</div>
          ))}
        </div>

        {/* Resultados */}
        <div style={{ flex: 1, overflow: "auto", background: "#f8fafc" }}>

          {/* DATOS */}
          {activeTab === "datos" && (
            results?.rows?.length ? (
              <div style={{ overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse",
                  fontSize: 12, background: "#fff" }}>
                  <thead>
                    <tr style={{ background: "#1B2A6B" }}>
                      <th style={{
                        padding: "8px 14px", color: "#D4AF37", fontWeight: 700,
                        textAlign: "center", fontSize: 10, width: 40,
                        borderRight: "1px solid #2a3d8f", position: "sticky", top: 0
                      }}>#</th>
                      {results.columns.map(c => (
                        <th key={c} style={{
                          padding: "8px 14px", color: "#c7d2f0", fontWeight: 600,
                          textAlign: "left", borderRight: "1px solid #2a3d8f",
                          position: "sticky", top: 0, whiteSpace: "nowrap",
                          fontSize: 11, letterSpacing: "0.3px", background: "#1B2A6B"
                        }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{results.rows.map((row, i) => (
                    <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f8fafc" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? "#fff" : "#f8fafc"}>
                      <td style={{ padding: "6px 14px", textAlign: "center",
                        color: "#94a3b8", fontSize: 10, borderRight: "1px solid #f1f5f9",
                        borderBottom: "1px solid #f1f5f9" }}>{i+1}</td>
                      {row.map((cell, j) => (
                        <td key={j} style={{
                          padding: "6px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          borderRight: "1px solid #f1f5f9",
                          color: colorCelda(cell, results.columns[j]),
                          fontStyle: cell===null ? "italic" : "normal",
                          whiteSpace: "nowrap", maxWidth: 280,
                          overflow: "hidden", textOverflow: "ellipsis"
                        }} title={cell}>
                          {cell === null ? (
                            <span style={{ color: "#cbd5e1", fontSize: 10 }}>NULO</span>
                          ) : bgCelda(cell) !== "transparent" ? (
                            <span style={{
                              background: bgCelda(cell), color: colorCelda(cell, results.columns[j]),
                              padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600
                            }}>{cell}</span>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : !loading && (
              <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗄️</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                  Listo para ejecutar consultas
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  Escribe SQL en el editor y presiona Ctrl+Enter
                </div>
                <div style={{ fontSize: 12 }}>
                  O haz clic en una tabla del panel izquierdo para cargar automáticamente
                </div>
              </div>
            )
          )}

          {/* MENSAJES */}
          {activeTab === "mensajes" && (
            <div style={{ padding: 24 }}>
              {error ? (
                <div style={{
                  background: "#fff", border: "1px solid #fecaca",
                  borderLeft: "4px solid #C8102E", borderRadius: 10,
                  padding: "20px 24px", boxShadow: "0 2px 8px #C8102E11"
                }}>
                  <div style={{ color: "#C8102E", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                    ❌ Error en la consulta
                  </div>
                  <div style={{
                    background: "#fef2f2", borderRadius: 8, padding: "12px 16px",
                    fontFamily: "monospace", fontSize: 12, color: "#991b1b", lineHeight: 1.7
                  }}>{error}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 12 }}>
                    💡 Verifica la sintaxis. Haz clic en <strong>Historial</strong> para recargar una consulta anterior.
                  </div>
                </div>
              ) : results ? (
                <div style={{
                  background: "#fff", border: "1px solid #bbf7d0",
                  borderLeft: "4px solid #15803d", borderRadius: 10,
                  padding: "20px 24px", boxShadow: "0 2px 8px #15803d11"
                }}>
                  <div style={{ color: "#15803d", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                    ✅ Consulta ejecutada correctamente
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "Filas retornadas",    value: results.row_count,          color: "#1B2A6B", bg: "#eff6ff" },
                      { label: "Tiempo de ejecución", value: `${results.execution_time_ms}ms`, color: "#0369a1", bg: "#e0f2fe" },
                      { label: "Tipo de operación",   value: results.query_type,         color: "#D4AF37", bg: "#fefce8" },
                    ].map((stat, i) => (
                      <div key={i} style={{
                        background: stat.bg, borderRadius: 10,
                        padding: "14px 18px", border: `1px solid ${stat.color}22`
                      }}>
                        <div style={{ color: stat.color, fontSize: 24, fontWeight: 800 }}>{stat.value}</div>
                        <div style={{ color: "#64748b", fontSize: 10, marginTop: 4,
                          textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  Ejecuta una consulta para ver los mensajes
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL */}
          {activeTab === "historial" && (
            history.length ? (
              <div style={{ background: "#fff" }}>
                {history.map((h, i) => (
                  <div key={i} onClick={() => { setQuery(h.query); setActiveTab("datos") }}
                    style={{
                      padding: "12px 20px", borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer", transition: "background .1s",
                      borderLeft: h.ok ? "3px solid #15803d" : "3px solid #C8102E"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{h.ok ? "✅" : "❌"}</span>
                      <span style={{
                        color: h.ok ? "#15803d" : "#C8102E",
                        fontSize: 11, fontWeight: 600
                      }}>
                        {h.ok ? `${h.filas} filas · ${h.tiempo}ms` : "Error en la consulta"}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 10, marginLeft: "auto" }}>
                        🕐 {h.hora}
                      </span>
                    </div>
                    <div style={{
                      color: "#475569", overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>{h.query}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                El historial aparece aquí después de ejecutar consultas
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes deslizar {
          0% { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
      `}</style>
    </div>
  )
}
