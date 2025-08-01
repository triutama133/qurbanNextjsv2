"use client";

import { useEffect } from 'react';
import supabase from '@/lib/supabase'; // Sesuaikan path jika perlu
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Cek session custom dari localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("qurban_user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center text-xl text-gray-700">Memuat...</div>
    </div>
  );
}
