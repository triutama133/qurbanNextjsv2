"use client";

import { useState } from 'react';
import supabase from '@/lib/supabase'; // Pastikan alias ini benar, atau gunakan path relatif
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password })
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Login gagal.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      // Simpan user ke localStorage, tambahkan properti id
      const userWithId = { ...result.user, id: result.user.UserId };
      localStorage.setItem("qurban_user", JSON.stringify(userWithId));
      // Login sukses, cek role
      if (result.user.Role === "Admin") {
        setMessage("Login admin berhasil! Mengarahkan ke dashboard admin...");
        setMessageType("success");
        setTimeout(() => {
          router.push("/admin-dashboard");
        }, 1500);
      } else {
        setMessage("Login user berhasil! Mengarahkan ke dashboard...");
        setMessageType("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setMessage("Login gagal: " + err.message);
      setMessageType("error");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await fetch('/api/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const result = await res.json();
      if (!res.ok) {
        setForgotMsg(`Gagal mengirim email reset: ${result.error || 'Terjadi kesalahan.'}`);
      } else {
        setForgotMsg('Email reset password telah dikirim. Silakan cek inbox/spam Anda.');
      }
    } catch (err) {
      setForgotMsg('Gagal mengirim email reset: ' + err.message);
    }
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border-t-8 border-green-500">
        <div className="flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mb-2 text-green-600"><path d="M10.5,18A0.5,0.5 0 0,1 11,18.5A0.5,0.5 0 0,1 10.5,19A0.5,0.5 0 0,1 10,18.5A0.5,0.5 0 0,1 10.5,18M13.5,18A0.5,0.5 0 0,1 14,18.5A0.5,0.5 0 0,1 13.5,19A0.5,0.5 0 0,1 13,18.5A0.5,0.5 0 0,1 13.5,18M10,11A1,1 0 0,1 11,12A1,1 0 0,1 10,13A1,1 0 0,1 9,12A1,1 0 0,1 10,11M14,11A1,1 0 0,1 15,12A1,1 0 0,1 14,13A1,1 0 0,1 13,12A1,1 0 0,1 14,11M18,18C18,20.21 15.31,22 12,22C8.69,22 6,20.21 6,18C6,17.1 6.45,16.27 7.2,15.6C6.45,14.6 6,13.35 6,12L6.12,10.78C5.58,10.93 4.93,10.93 4.4,10.78C3.38,10.5 1.84,9.35 2.07,8.55C2.3,7.75 4.21,7.6 5.23,7.9C5.82,8.07 6.45,8.5 6.82,8.96L7.39,8.15C6.79,7.05 7,4 10,3L9.91,3.14V3.14C9.63,3.58 8.91,4.97 9.67,6.47C10.39,6.17 11.17,6 12,6C12.83,6 13.61,6.17 14.33,6.47C15.09,4.97 14.37,3.58 14.09,3.14L14,3C17,4 17.21,7.05 16.61,8.15L17.18,8.96C17.55,8.5 18.18,8.07 18.77,7.9C19.79,7.6 21.7,7.75 21.93,8.55C22.16,9.35 20.62,10.5 19.6,10.78C19.07,10.93 18.42,10.93 17.88,10.78L18,12C18,13.35 17.55,14.6 16.8,15.6C17.55,16.27 18,17.1 18,18M12,16C9.79,16 8,16.9 8,18C8,19.1 9.79,20 12,20C14.21,20 16,19.1 16,18C16,16.9 14.21,16 12,16M12,14C13.12,14 14.17,14.21 15.07,14.56C15.65,13.87 16,13 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13 8.35,13.87 8.93,14.56C9.83,14.21 10.88,14 12,14M14.09,3.14V3.14Z" /></svg>
          <h1 className="text-xl font-bold text-green-700 text-center">Tabungan Qurban Keluarga Peduli 1447H</h1>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{' '}
            <a href="/register" className="font-medium text-green-600 hover:text-green-500">
              daftar akun baru
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Alamat Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`py-2 px-3 rounded-md text-sm ${
                messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>

        {/* Link Lupa Password */}
        <p className="mt-2 text-center text-sm text-gray-600">
          <button
            type="button"
            className="font-medium text-green-600 hover:text-green-500 focus:outline-none"
            onClick={() => setShowForgot(true)}
          >
            Lupa password?
          </button>
        </p>

        {/* Modal Lupa Password */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMsg('');
                  setForgotEmail('');
                }}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Masukkan email Anda"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
                {forgotMsg && (
                  <div className={`text-sm ${forgotMsg.startsWith('Email reset') ? 'text-green-600' : 'text-red-600'}`}>
                    {forgotMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* BAGIAN YANG PERLU ANDA PASTIKAN ADA: */}
        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/admin-login" className="font-medium text-green-600 hover:text-green-500">
            Login sebagai Admin
          </a>
        </p>
      </div>
    </div>
  );
}
