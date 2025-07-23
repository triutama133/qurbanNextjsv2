"use client";


import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import React from "react";

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
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
      // Setelah admin terverifikasi, fetch data dashboard
      fetchDashboardData();
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  async function fetchDashboardData() {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/admin-dashboard');
      if (!res.ok) throw new Error('Gagal fetch data dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      setDashboard(null);
    }
    setDashboardLoading(false);
  }

  if (loading || dashboardLoading) return <div className="text-center mt-10">Memuat dashboard admin...</div>;

  if (loading || dashboardLoading) {
    return <div className="text-center mt-10">Memuat dashboard admin...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-100 p-8">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">Selamat Datang, Admin!</h1>
        {user && (
          <p className="text-lg text-gray-700 mb-6">Anda masuk sebagai: <span className="font-semibold">{user.email}</span></p>
        )}
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 mb-8"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>

        {/* Ringkasan Dashboard */}
        {dashboard ? (
          <React.Fragment>
            {/* Rekap Card Modern */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <RekapCard label="Total Tabungan Tercatat" value={dashboard.totalTabunganTercatat} color="indigo" />
              <RekapCard label="Total Tabungan Ditransfer" value={dashboard.totalTabunganTransfer} color="green" />
              <RekapCard label="Total Tabungan Terpakai" value={dashboard.totalTabunganTerpakai} color="red" />
              <RekapCard label="Total Sisa Tabungan" value={dashboard.totalSisaTabungan} color="gray" />
              <RekapCard label="Pendapatan Bersih (setelah biaya & voucher)" value={dashboard.pendapatanBersih} color="yellow" wide />
            </div>

            {/* Notifikasi Setoran Awal Pending */}
            {dashboard.setoranPending && dashboard.setoranPending.length > 0 && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-8">
                <b>Notifikasi:</b> Ada {dashboard.setoranPending.length} user dengan setoran awal <b>pending</b>:
                <ul className="list-disc ml-6 mt-2">
                  {dashboard.setoranPending.map(u => (
                    <li key={u.UserId}>{u.Nama} ({u.Email})</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notifikasi Verifikasi Transfer Pending */}
            {dashboard.transferPending && dashboard.transferPending.length > 0 && (
              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded mb-8">
                <b>Notifikasi:</b> Ada {dashboard.transferPending.length} transfer <b>pending verifikasi</b>:
                <ul className="list-disc ml-6 mt-2">
                  {dashboard.transferPending.map(t => (
                    <li key={t.ConfirmationId}>User: {t.UserId}, Jumlah: Rp {Number(t.Amount).toLocaleString('id-ID')}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* List User & Riwayat Transaksi (ringkas) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-indigo-900">Daftar User & Ringkasan Tabungan</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-indigo-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-indigo-900">Nama</th>
                      <th className="px-4 py-2 text-left font-semibold text-indigo-900">Email</th>
                      <th className="px-4 py-2 text-left font-semibold text-indigo-900">Status Setoran</th>
                      <th className="px-4 py-2 text-left font-semibold text-indigo-900">Target Pribadi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.userList.map(u => (
                      <tr key={u.UserId} className="even:bg-gray-50 hover:bg-indigo-50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap font-medium">{u.Nama}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{u.Email}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <StatusBadge status={u.StatusSetoran} />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">Rp {Number(u.TargetPribadi || 0).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List Pengeluaran Admin */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-red-900">Catatan Pengeluaran Admin</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 border">Deskripsi</th>
                      <th className="px-2 py-1 border">Jumlah</th>
                      <th className="px-2 py-1 border">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pengeluaranList.map(p => (
                      <tr key={p.CostId} className="even:bg-gray-50">
                        <td className="px-2 py-1 border">{p.Deskripsi}</td>
                        <td className="px-2 py-1 border">Rp {Number(p.Jumlah).toLocaleString('id-ID')}</td>
                        <td className="px-2 py-1 border">{new Date(p.Tanggal).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List Berita/Newsletter */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-teal-900">Berita/Newsletter</h2>
              <ul className="list-disc ml-6">
                {dashboard.newsList.map(n => (
                  <li key={n.NewsletterId} className="mb-1">
                    <b>{n.Title}</b> <span className="text-xs text-gray-500">({new Date(n.DatePublished).toLocaleDateString('id-ID')})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* List File/Resource */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2 text-blue-900">File/Resource</h2>
              <ul className="list-disc ml-6">
                {dashboard.resourceList.map(r => (
                  <li key={r.ResourceId} className="mb-1">
                    <a href={r.ResourceUrl || r.Link} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{r.Title}</a>
                  </li>
                ))}
              </ul>
            </div>
          </React.Fragment>
        ) : (
          <div className="text-gray-500">Gagal memuat data dashboard.</div>
        )}
      </div>
    </div>
  );
}

// Komponen Card Rekap
function RekapCard({ label, value, color = 'indigo', wide }) {
  const colorMap = {
    indigo: 'from-indigo-100 to-indigo-50 text-indigo-700',
    green: 'from-green-100 to-green-50 text-green-700',
    red: 'from-red-100 to-red-50 text-red-700',
    gray: 'from-gray-100 to-gray-50 text-gray-700',
    yellow: 'from-yellow-100 to-yellow-50 text-yellow-700'
  };
  return (
    <div className={`p-5 rounded-xl shadow-sm bg-gradient-to-br ${colorMap[color]} ${wide ? 'col-span-1 sm:col-span-2' : ''}`}>
      <div className="text-xs font-medium mb-1 text-gray-500">{label}</div>
      <div className="text-2xl font-bold">Rp {Number(value).toLocaleString('id-ID')}</div>
    </div>
  );
}

// Komponen Badge Status
function StatusBadge({ status }) {
  let color = 'bg-gray-200 text-gray-700';
  if (status === 'Sudah Setor') color = 'bg-green-100 text-green-700';
  else if (status === 'Pending') color = 'bg-yellow-100 text-yellow-700';
  else if (status === 'Belum Setor') color = 'bg-red-100 text-red-700';
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>
  );
}



