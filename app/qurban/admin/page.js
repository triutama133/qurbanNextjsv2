"use client";

import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotMessageType, setForgotMessageType] = useState('');
  const router = useRouter();
  // Handler lupa password admin
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setForgotMessageType('');
    if (!forgotEmail) {
      setForgotMessage('Email wajib diisi.');
      setForgotMessageType('error');
      setForgotLoading(false);
      return;
    }
    // Kirim permintaan reset password via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setForgotMessage('Gagal mengirim email reset password: ' + error.message);
      setForgotMessageType('error');
    } else {
      setForgotMessage('Link reset password telah dikirim ke email admin (jika terdaftar).');
      setForgotMessageType('success');
    }
    setForgotLoading(false);
  };

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      setMessage(`Login gagal: ${authError.message}`);
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Setelah login Supabase Auth berhasil, verifikasi role di tabel public.users
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('Role')
          .eq('UserId', authData.user.id)
          .single();

        if (userError || !userData || userData.Role !== 'Admin') {
          // Jika bukan admin, logout dari sesi auth Supabase dan berikan pesan error
          await supabase.auth.signOut();
          setMessage('Akses ditolak: Akun ini bukan admin.');
          setMessageType('error');
        } else {
          setMessage('Login admin berhasil! Mengarahkan ke dashboard admin...');
          setMessageType('success');
          setTimeout(() => {
            router.push('/qurban/admin-dashboard');
          }, 1500);
        }
      } catch (roleError) {
        console.error('Error fetching user role:', roleError.message);
        setMessage('Login gagal: Terjadi kesalahan saat memeriksa peran akun.');
        setMessageType('error');
        await supabase.auth.signOut(); // Pastikan user logout jika ada error
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border-t-8 border-indigo-600">
         <div className="flex flex-col items-center gap-2">
           <img src="/logo.png" alt="Logo Qurban" className="h-28 w-auto mb-2" style={{maxWidth: 180}} />
           <img src="/file.svg" alt="Sapi" className="w-16 h-16 mb-2" />
           <h1 className="text-xl font-bold text-[#E53935] text-center">Tabungan Qurban Keluarga Peduli 1446H</h1>
           <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
             Login Admin
           </h2>
           <p className="mt-2 text-center text-sm text-gray-600">
             Masuk untuk mengakses dashboard administrator
           </p>
         </div>
        <form className="mt-8 space-y-6" onSubmit={handleAdminSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Alamat Email Admin
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Alamat Email Admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password Admin
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password Admin"
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

          <div className="flex flex-col gap-2">
             <button
               type="submit"
               disabled={loading}
               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E53935] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
             >
               {loading ? 'Memproses...' : 'Login Admin'}
             </button>
            <button
              type="button"
              className="w-full text-xs text-indigo-600 hover:underline mt-1"
              onClick={() => setShowForgot(true)}
              tabIndex={-1}
            >
              Lupa password admin?
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/qurban/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Bukan admin? Login sebagai user
          </a>
        </p>

        {/* Modal lupa password admin */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => {
                  setShowForgot(false);
                  setForgotEmail('');
                  setForgotMessage('');
                  setForgotMessageType('');
                }}
                aria-label="Tutup"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold mb-2 text-center">Reset Password Admin</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan email admin"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
                {forgotMessage && (
                  <div className={`py-2 px-3 rounded-md text-xs ${forgotMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {forgotMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}