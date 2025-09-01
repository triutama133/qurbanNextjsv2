"use client";


import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'program'
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
  // Simpan UserId juga ke localStorage agar fitur upload dokumen bisa mengambilnya
  localStorage.setItem("user_id", result.user.UserId);
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
          router.push("/qurban/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
      {/* Desktop: 2 columns, Mobile: tab */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border-t-8 border-emerald-600 p-8 flex flex-col items-center">
          <img src="/logo.png" alt="Logo Qurban" className="h-40 w-auto mb-4" style={{maxWidth: 240, objectFit: 'contain', objectPosition: 'top'}} />
          <h1 className="text-xl font-bold text-emerald-600 text-center">Tabungan Qurban Keluarga Peduli 1447H</h1>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Kamu
          </h2>
          <form className="mt-8 space-y-6 w-full" onSubmit={handleSignIn}>
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-600 focus:border-emerald-600 focus:z-10 sm:text-sm"
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
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-600 focus:border-emerald-600 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {message && (
              <div
                className={`py-2 px-3 rounded-md text-sm ${
                  messageType === 'error' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {message}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
            <div className="mt-3">
              <a
                href="/qurban/register"
                className="block w-full text-center py-2 px-4 rounded-md bg-[#E53935] hover:bg-red-700 text-white font-bold text-base transition-colors"
                style={{letterSpacing: '0.5px'}}>
                Belum punya akun? <br /> Daftar Qurban Sekarang
              </a>
            </div>
          </form>
          <p className="mt-2 text-center text-sm text-gray-600">
            <button
              type="button"
              className="font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none"
              onClick={() => setShowForgot(true)}
            >
              Lupa password?
            </button>
          </p>
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
                    <div className={`text-sm ${forgotMsg.startsWith('Email reset') ? 'text-green-600' : 'text-emerald-600'}`}>{forgotMsg}</div>
                  )}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
                  >
                    {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                </form>
              </div>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-gray-600">
            <a href="/qurban/admin-login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Login sebagai Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
