"use client";

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase'; // Pastikan alias ini benar
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState(''); // Nama Lengkap pemilik akun (disimpan di kolom Nama)
  const [pequrbanName, setPequrbanName] = useState(''); // Nama Pequrban (disimpan di kolom NamaPequrban)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi password tidak cocok.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // 1. Pendaftaran user baru di Supabase Auth
    // PERBAIKAN: Jangan panggil supabase.auth.signUp dulu jika email sudah terdaftar di public.users
    // Ini untuk menghindari user dibuat di auth.users jika public.users tidak mau terima
    // Namun, kita akan tetap coba daftar di auth.users terlebih dahulu karena SupabaseAuth yang utama.
    // Jika auth.signUp gagal karena email duplikat, errornya akan ditangkap.
    // Jika auth.signUp berhasil, baru kita cek public.users.

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // PERBAIKAN: Tangani error dari supabase.auth.signUp terlebih dahulu
    if (authError) {
        if (authError.message.includes('User already registered')) { // Pesan error spesifik dari Supabase Auth untuk duplikasi email
            setMessage('Email ini sudah terdaftar. Silakan login.');
            setMessageType('error');
        } else {
            setMessage(`Pendaftaran gagal: ${authError.message}`);
            setMessageType('error');
        }
        setLoading(false);
        return;
    }

    if (authData.user) {
      // 2. Jika pendaftaran di Supabase Auth berhasil, simpan data tambahan ke tabel public.users
      try {
        const userId = authData.user.id;

        const response = await fetch('/api/register-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            fullName: fullName,
            pequrbanName: pequrbanName,
            email: email,
            metodeTabungan: "Menabung Sendiri",
          }),
        });

        const result = await response.json();

        // PERBAIKAN: Tangani status kode 409 (Conflict) secara spesifik
        if (response.status === 409) {
          // Jika email sudah terdaftar di public.users, meskipun auth.signUp berhasil (jarang, tapi bisa)
          // Hapus user dari auth.users untuk konsistensi
          await supabase.auth.admin.deleteUser(userId); // Perlu service_role_key di API Route untuk ini
          setMessage('Email ini sudah terdaftar di sistem. Silakan login.');
          setMessageType('error');
          setLoading(false);
          return;
        }

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Gagal menyimpan data profil.');
        }

        setMessage('Pendaftaran berhasil! Silakan login.');
        setMessageType('success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);

      } catch (profileError) {
        console.error('Error saving user profile:', profileError.message);
        // PERBAIKAN: Jika gagal menyimpan profil, HAPUS user dari Supabase Auth
        // Ini SANGAT PENTING untuk konsistensi data
        await supabase.auth.admin.deleteUser(authData.user.id); // Ini harus dipanggil dari sisi SERVER!
        // Untuk saat ini, kita akan asumsikan ini perlu API Route juga
        // Atau: Anda perlu membuat API Route baru (misalnya '/api/delete-auth-user')
        // Dan panggil route itu di sini jika profileError terjadi.
        console.error("User created in Auth but not in public.users. Please manually delete or implement cleanup API.");
        setMessage(`Pendaftaran berhasil di autentikasi, tetapi gagal menyimpan data profil: ${profileError.message}. Silakan hubungi admin.`);
        setMessageType('error');
      }
    } else {
        // Ini bisa terjadi jika email confirmation diperlukan tapi belum diaktifkan
        setMessage('Pendaftaran berhasil. Silakan cek email Anda untuk konfirmasi (jika diaktifkan).');
        setMessageType('success');
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Daftar untuk ikut program tabungan qurban
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap Pemilik Akun
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pequrban-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pequrban (Qurban atas nama)
              </label>
              <input
                id="pequrban-name"
                name="pequrban-name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan nama pequrban (contoh: Nama Ayah)"
                value={pequrbanName}
                onChange={(e) => setPequrbanName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="contoh@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Ketik ulang password Anda"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </div>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Masuk di sini
            </a>
        </p>
      </div>
    </div>
  );
}
