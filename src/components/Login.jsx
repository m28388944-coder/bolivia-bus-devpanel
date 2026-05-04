import { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Lock, Mail, Eye, EyeOff } from "lucide-react";
import api from "../api/client";

export default function Login({ onLogin }) {
  const [form, setForm]       = useState({ email: "dev@boliviabus.bo", password: "dev1234" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", form);
      const token = res.data.access_token;
      const me = await api.get("/dev/me", { headers: { Authorization: `Bearer ${token}` } });
      if (me.data.rol !== "developer") { setError("Acceso denegado — solo desarrolladores"); return; }
      localStorage.setItem("dev_token", token);
      localStorage.setItem("dev_user", JSON.stringify(me.data));
      onLogin(me.data, token);
    } catch {
      setError("Credenciales incorrectas o sin permisos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl mb-4">
            <Terminal size={32} className="text-green-400"/>
          </div>
          <h1 className="text-2xl font-black text-white">Bolivia Bus <span className="text-green-400">DevPanel</span></h1>
          <p className="text-gray-500 text-sm mt-1">Acceso restringido — solo desarrolladores</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input type={showPwd ? "text" : "password"} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-10 py-3 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"/>
              <button onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <motion.button onClick={handleSubmit} disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 font-black py-3 rounded-xl text-sm transition-colors">
            {loading ? "Verificando..." : "Acceder al DevPanel"}
          </motion.button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Bolivia Bus System v1.0.0 · Acceso de desarrollo
        </p>
      </motion.div>
    </div>
  );
}
