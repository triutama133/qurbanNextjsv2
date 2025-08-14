"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <p className="text-center text-red-600">Token reset password tidak ditemukan atau link tidak valid.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (newPassword.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal reset password");
      setSuccess(true);
      setMessage("Password berhasil direset! Silakan login dengan password baru.");
  setTimeout(() => router.push("/qurban/login"), 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      {success ? (
        <p className="text-center text-green-600">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Memproses..." : "Reset Password"}
          </button>
          {message && <p className="text-center text-red-600">{message}</p>}
        </form>
      )}
    </div>
  );
}
