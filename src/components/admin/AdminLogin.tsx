"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, X, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuthStore, ADMIN_CREDENTIALS } from "@/lib/auth-store";
import { toast } from "sonner";

interface AdminLoginProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ open, onClose, onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = login(username, password);
    if (ok) {
      toast.success("Login berhasil! Selamat datang, Admin.");
      onSuccess();
      setUsername("");
      setPassword("");
    } else {
      setError("Username atau password salah.");
      toast.error("Login gagal");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-sky-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Decorative header */}
            <div className="relative bg-gradient-to-br from-sky-800 to-cyan-600 p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Admin Panel</h2>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Dunia Pool & Pond — Content Management
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    autoFocus
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white py-3 rounded-lg font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Masuk ke Dashboard
              </button>

              {/* Default credentials hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-[11px] text-amber-800 font-semibold mb-1">
                  Akun Admin Default:
                </p>
                <p className="text-[11px] text-amber-700">
                  Username: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{ADMIN_CREDENTIALS.username}</code>
                </p>
                <p className="text-[11px] text-amber-700">
                  Password: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">{ADMIN_CREDENTIALS.password}</code>
                </p>
              </div>

              {/* Shortcut hint */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700 shadow-sm">Ctrl</kbd>
                <span className="text-slate-400 text-xs">+</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700 shadow-sm">Shift</kbd>
                <span className="text-slate-400 text-xs">+</span>
                <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700 shadow-sm">A</kbd>
                <span className="text-[11px] text-slate-500 ml-1">
                  untuk membuka admin kapan saja
                </span>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
