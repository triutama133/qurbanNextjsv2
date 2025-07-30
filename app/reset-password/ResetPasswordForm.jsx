"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabase";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' | 'error'

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        setMsg("Token reset tidak valid, sudah kadaluarsa, atau link sudah pernah dipakai. Silakan lakukan permintaan reset password ulang.");
        setMsgType("error");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    if (!password || password.length < 6) {
      setMsg("Password minimal 6 karakter.");
      setMsgType("error");
      return;
    }
    if (password !== confirm) {
      setMsg("Konfirmasi password tidak cocok.");
      setMsgType("error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMsg("Gagal reset password: " + error.message);
      setMsgType("error");
    } else {
      setMsg("Password berhasil direset! Anda akan diarahkan ke halaman login...");
      setMsgType("success");
      const isAdmin = searchParams.get("role") === "admin";
      setTimeout(() => {
        router.push(isAdmin ? "/admin-login" : "/login");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <form className="space-y-4" onSubmit={handleReset}>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          placeholder="Password baru"
          value={password}
          onChange={e => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <input
          type="password"
          className="w-full border px-3 py-2 rounded"
          placeholder="Konfirmasi password baru"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          minLength={6}
          required
        />
        {msg && (
          <div className={`text-sm ${msgType === "success" ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Memproses..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
