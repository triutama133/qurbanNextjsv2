"use client";


import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const programReport = (
  <div className="w-full h-full flex flex-col justify-start items-center px-2 py-8 sm:py-12 overflow-y-auto" style={{maxHeight: '100vh'}}>
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border-t-8 border-[#E53935] p-6 sm:p-8">
      {/* Deskripsi/Narasi Program */}
      <h3 className="text-xl sm:text-2xl font-bold text-[#E53935] mb-2 text-center">Qurban Berdampak</h3>
      <p className="text-gray-700 text-base sm:text-lg text-center mb-4">
        Qurban Berdampak lahir dari keresahan kami tentang proses Qurban yang kurang memberdayakan & kurang dirayakan.<br/>
        Qurban hanya fokus pada ketersaluran: pequrban membayar, daging disalurkan, dan selesai.<br/>
        <br/>
        <span className="font-semibold">Kami ingin menghadirkan proses Qurban yang berbeda dengan tiga fokus utama:</span>
      </p>
      <ul className="mb-6 text-gray-700 text-sm sm:text-base list-disc pl-5">
        <li className="mb-1"><span className="font-semibold">Menghidupi peternak lokal:</span> Sapi dibeli dari keluarga petani di Gorontalo. Lewat program ini, kami berharap mereka bisa mendapat pendapatan yang lebih adil.</li>
        <li className="mb-1"><span className="font-semibold">Menjangkau yang terlupakan:</span> Sapi disembelih di masjid-masjid desa minim qurban, daging dibagikan kepada mereka yang membutuhkan.</li>
        <li><span className="font-semibold">Menghadirkan dampak bagi pequrban:</span> Program didesain dengan pendekatan Family Based Project; program kebaikan yang melibatkan seluruh anggota keluarga.</li>
      </ul>
      {/* Divider */}
      <div className="my-4 border-t border-gray-200"></div>
      {/* Report Tahun Lalu */}
      <h4 className="text-lg font-bold text-[#E53935] mb-2 text-center">Report Program 1446H</h4>
      <div className="flex flex-col gap-3 items-center">
        <div className="flex gap-4 justify-center mb-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#E53935]">7</span>
            <span className="text-xs text-gray-500">Pequrban</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#E53935]">1</span>
            <span className="text-xs text-gray-500">Sapi</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#E53935]">55</span>
            <span className="text-xs text-gray-500">Keluarga</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[#E53935]">160</span>
            <span className="text-xs text-gray-500">Jiwa</span>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <div className="bg-gray-50 rounded p-3 border border-gray-100">
            <span className="font-semibold">Lokasi:</span> Masjid Al-Muhajirin, Tumba, Pongongaila
          </div>
          <div className="bg-gray-50 rounded p-3 border border-gray-100">
            <span className="font-semibold">Family Based Project:</span> Melibatkan seluruh anggota keluarga dalam proses Qurban.
          </div>
        </div>
        <a href="https://www.canva.com/design/DAGsuVd4S-w/bBNeQlSNit_mrtaKmW0sQw/edit" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-600 font-semibold hover:underline">Lihat Laporan Lengkap</a>
      </div>
    </div>
  </div>
);


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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
      {/* Desktop: 2 columns, Mobile: tab */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row bg-white rounded-xl shadow-lg border-t-8 border-[#E53935] overflow-hidden">
        {/* Left: Program Report (desktop), Tab (mobile) */}
        <div className="hidden sm:block w-1/2 bg-gray-50 border-r border-gray-200">
          {programReport}
        </div>
        {/* Mobile tab header */}
        <div className="sm:hidden w-full flex border-b border-gray-200 bg-gray-50">
          <button
            className={`flex-1 py-3 text-center font-semibold text-sm ${activeTab === 'login' ? 'text-[#E53935] border-b-2 border-[#E53935] bg-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 text-center font-semibold text-sm ${activeTab === 'program' ? 'text-[#E53935] border-b-2 border-[#E53935] bg-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('program')}
          >
            Tentang Program
          </button>
        </div>
        {/* Right: Login Form (desktop), Tab content (mobile) */}
        <div className="w-full sm:w-1/2 flex flex-col justify-center items-center">
          {/* Mobile: tab content */}
          <div className="w-full">
            {/* Mobile: show login or program, but use the exact same markup as desktop for each tab */}
            <div className={"sm:hidden " + (activeTab === 'login' ? '' : 'hidden')}>
              {/* Desktop login form markup, full width, but with max-w and centered for mobile */}
              <div className="flex flex-col items-center gap-2 mt-8">
                <img src="/logo.png" alt="Logo Qurban" className="h-52 w-auto mb-1" style={{maxWidth: 340, objectFit: 'contain', objectPosition: 'top'}} />
                <h1 className="text-xl font-bold text-[#E53935] text-center">Tabungan Qurban Keluarga Peduli 1447H</h1>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                  Masuk ke Akun Kamu
                </h2>
              </div>
              <form className="mt-8 space-y-6 mx-auto w-full" style={{maxWidth: 380}} onSubmit={handleSignIn}>
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
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E53935] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {loading ? 'Memproses...' : 'Masuk'}
                  </button>
                </div>
                <div className="mt-3">
                  <a
                    href="/register"
                    className="block w-full text-center py-2 px-4 rounded-md bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors"
                    style={{letterSpacing: '0.5px'}}>
                    Belum punya akun? Daftar Qurban Sekarang
                  </a>
                </div>
              </form>
              <p className="mt-2 text-center text-sm text-gray-600">
                <button
                  type="button"
                  className="font-medium text-[#E53935] hover:text-red-700 focus:outline-none"
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
                        <div className={`text-sm ${forgotMsg.startsWith('Email reset') ? 'text-green-600' : 'text-red-600'}`}>{forgotMsg}</div>
                      )}
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full bg-[#E53935] text-white py-2 rounded hover:bg-red-700"
                      >
                        {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              <p className="mt-4 text-center text-sm text-gray-600">
                <a href="/admin-login" className="font-medium text-[#E53935] hover:text-red-700">
                  Login sebagai Admin
                </a>
              </p>
            </div>
            <div className={"sm:hidden " + (activeTab === 'program' ? '' : 'hidden')}>
              {programReport}
            </div>
          </div>
          {/* Desktop: login form */}
          <div className="hidden sm:block w-full px-8 py-12">
            <div className="flex flex-col items-center gap-2">
              <img src="/logo.png" alt="Logo Qurban" className="h-52 w-auto mb-1" style={{maxWidth: 340, objectFit: 'contain', objectPosition: 'top'}} />
              <h1 className="text-xl font-bold text-[#E53935] text-center">Tabungan Qurban Keluarga Peduli 1447H</h1>
              <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                Masuk ke Akun Kamu
              </h2>
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
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E53935] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
              <div className="mt-3">
                <a
                  href="/register"
                  className="block w-full text-center py-2 px-4 rounded-md bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors"
                  style={{letterSpacing: '0.5px'}}>
                  Belum punya akun? Daftar Qurban Sekarang
                </a>
              </div>
            </form>
            <p className="mt-2 text-center text-sm text-gray-600">
              <button
                type="button"
                className="font-medium text-[#E53935] hover:text-red-700 focus:outline-none"
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
                      <div className={`text-sm ${forgotMsg.startsWith('Email reset') ? 'text-green-600' : 'text-red-600'}`}>
                        {forgotMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#E53935] text-white py-2 rounded hover:bg-red-700"
                    >
                      {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                  </form>
                </div>
              </div>
            )}
            <p className="mt-4 text-center text-sm text-gray-600">
              <a href="/admin-login" className="font-medium text-[#E53935] hover:text-red-700">
                Login sebagai Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
