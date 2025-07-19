"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin-login'); // Redirect jika tidak ada user yang login
        return;
      }

      // Verifikasi role user dari tabel public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('Role')
        .eq('UserId', user.id)
        .single();

      if (userError || !userData || userData.Role !== 'Admin') {
        console.error('Akses Ditolak: Bukan admin.');
        await supabase.auth.signOut(); // Logout user yang bukan admin
        router.push('/admin-login');
        return;
      }

      setUser(user);
      setLoading(false);
    }
    checkAdminUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            router.push('/admin-login'); // Redirect jika user logout
        } else {
            setUser(session.user);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      setLoading(false);
    } else {
      router.push('/admin-login');
    }
  };

  if (loading) return <div className="text-center mt-10">Memuat dashboard admin...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-100 p-8">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">Selamat Datang, Admin!</h1>
        {user && (
          <p className="text-lg text-gray-700 mb-6">Anda masuk sebagai: <span className="font-semibold">{user.email}</span></p>
        )}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}