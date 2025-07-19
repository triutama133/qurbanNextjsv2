"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();

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
            router.push('/admin-dashboard'); // Kita akan membuat halaman admin-dashboard nanti
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
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Memproses...' : 'Login Admin'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Bukan admin? Login sebagai user
          </a>
        </p>
      </div>
    </div>
  );
}