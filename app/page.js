"use client";

import { useEffect } from 'react';
import supabase from '@/lib/supabase'; // Sesuaikan path jika perlu
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Jika ada user yang login, arahkan ke dashboard
        router.push('/dashboard');
      } else {
        // Jika tidak ada user, arahkan ke halaman login
        router.push('/login');
      }
    }
    checkUser();
  }, [router]); // Tambahkan router ke dependency array

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center text-xl text-gray-700">Memuat...</div>
    </div>
  );
}
