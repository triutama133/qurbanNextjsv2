"use client";

import { useEffect, useState } from 'react';
// import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'profile'
  
  // Account Settings State
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  // Pequrban Settings State
  const [jumlahPequrban, setJumlahPequrban] = useState(1);
  const [pequrbanNames, setPequrbanNames] = useState(['']);
  const [pequrbanLoading, setPequrbanLoading] = useState(false);
  const [pequrbanMessage, setPequrbanMessage] = useState('');
  const [pequrbanMessageType, setPequrbanMessageType] = useState('');
  
  // Profile Settings State
  const [fullName, setFullName] = useState('');
  const [pequrbanName, setPequrbanName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Ambil user dari localStorage
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('qurban_user') : null;
    const userObj = userStr ? JSON.parse(userStr) : null;
    if (!userObj) {
      router.push('/login');
      return;
    }
    // Pastikan field UserId selalu ada
    const userId = userObj.UserId || userObj.id || userObj.userid || userObj.userId;
    setUser({ ...userObj, userId });
    setCurrentEmail(userObj.Email || '');
    setNewEmail(userObj.Email || '');

    // Fetch profile dari API custom
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/get-user-profile?userId=${userObj.id || userObj.UserId}`);
        if (!res.ok) throw new Error('Gagal memuat profil');
        const profileData = await res.json();
        setProfile(profileData);
        setFullName(profileData.Nama || '');
        setPequrbanName(profileData.NamaPequrban || '');
        setPhoneNumber(profileData.phone_number || '');
        // Inisialisasi jumlah dan nama pequrban
        const jumlah = profileData.JumlahPequrban || (Array.isArray(profileData.NamaPequrban) ? profileData.NamaPequrban.length : 1);
        setJumlahPequrban(jumlah);
        if (Array.isArray(profileData.NamaPequrban)) {
          setPequrbanNames(profileData.NamaPequrban);
        } else if (typeof profileData.NamaPequrban === 'string') {
          setPequrbanNames([profileData.NamaPequrban]);
        } else {
          setPequrbanNames(['']);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  // Handler update pequrban
  const handleUpdatePequrban = async (e) => {
    e.preventDefault();
    setPequrbanLoading(true);
    setPequrbanMessage('');
    setPequrbanMessageType('');
    // Validasi jumlah pequrban minimal 1
    if (!jumlahPequrban || jumlahPequrban < 1) {
      setPequrbanMessage('Jumlah pequrban minimal 1.');
      setPequrbanMessageType('error');
      setPequrbanLoading(false);
      return;
    }
    // Pastikan array nama sesuai jumlah dan semua di-trim
    const trimmedNames = pequrbanNames.slice(0, jumlahPequrban).map((n) => n.trim());
    if (trimmedNames.length !== jumlahPequrban || trimmedNames.some((n) => !n)) {
      setPequrbanMessage('Semua nama pequrban harus diisi.');
      setPequrbanMessageType('error');
      setPequrbanLoading(false);
      return;
    }

    // Hitung target per pequrban sesuai MetodeTabungan
    let targetPerPequrban = 2650000; // default
    if (profile?.MetodeTabungan === 'Qurban di Tim') {
      targetPerPequrban = 2650000;
    } else if (profile?.MetodeTabungan === 'Qurban Sendiri' && profile?.TargetPribadi && profile?.JumlahPequrban) {
      // TargetPribadi custom per pequrban
      targetPerPequrban = Math.round(Number(profile.TargetPribadi) / Number(profile.JumlahPequrban));
    }
    const newTargetPribadi = targetPerPequrban * jumlahPequrban;

    // Setoran awal per pequrban (bisa dari config, fallback 300000)
    const initialDepositPerPequrban = (profile?.InitialDepositAmount || 300000);
    const requiredInitialDeposit = initialDepositPerPequrban * jumlahPequrban;
    // Hitung total setoran awal approved user (dari transferConfirmations)
    let userInitialDeposit = 0;
    if (profile && Array.isArray(profile.transferConfirmations)) {
      userInitialDeposit = profile.transferConfirmations
        .filter(item => item.Status === "Approved" && item.Type?.toLowerCase() === "setoran awal")
        .reduce((sum, item) => sum + (item.Amount || 0), 0);
    }

    try {
      const payload = {
        userId: user?.userId,
        NamaPequrban: trimmedNames,
        JumlahPequrban: jumlahPequrban,
        TargetPribadi: newTargetPribadi
      };
      console.log('[UPDATE PEQURBAN PAYLOAD]', payload);
      const res = await fetch('/api/settings-update-pequrban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal update pequrban');
      setPequrbanMessage('Data pequrban & target berhasil diperbarui!');
      setPequrbanMessageType('success');
      setProfile((prev) => ({ ...prev, JumlahPequrban: jumlahPequrban, NamaPequrban: trimmedNames, TargetPribadi: newTargetPribadi }));
      setPequrbanNames(trimmedNames);
      // Setelah update, jika setoran awal kurang, beri notifikasi info (bukan blokir)
      if (userInitialDeposit < requiredInitialDeposit) {
        setPequrbanMessage(`Data pequrban berhasil diperbarui, namun jumlah setoran awal Anda (${userInitialDeposit.toLocaleString('id-ID')}) kurang dari yang seharusnya (${requiredInitialDeposit.toLocaleString('id-ID')}). Silakan lakukan setoran awal tambahan.`);
        setPequrbanMessageType('error');
      }
    } catch (error) {
      setPequrbanMessage('Gagal memperbarui data pequrban: ' + error.message);
      setPequrbanMessageType('error');
    } finally {
      setPequrbanLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setAccountLoading(true);
    const messageEl = document.getElementById('emailMessage');

    try {
      if (newEmail === currentEmail) {
        messageEl.textContent = 'Email baru sama dengan email saat ini.';
        messageEl.className = 'text-sm mt-3 text-yellow-600';
        return;
      }

      // Kirim request ke endpoint custom
      const res = await fetch('/api/settings-update-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.UserId,
          newEmail
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal update email');

      messageEl.textContent = 'Email berhasil diperbarui! Silakan cek email baru Anda untuk konfirmasi.';
      messageEl.className = 'text-sm mt-3 text-green-600';
      setCurrentEmail(newEmail);
    } catch (error) {
      messageEl.textContent = 'Gagal memperbarui email: ' + error.message;
      messageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
      setAccountLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setAccountLoading(true);
    const messageEl = document.getElementById('passwordMessage');

    try {
      if (newPassword !== confirmPassword) {
        messageEl.textContent = 'Password baru dan konfirmasi tidak cocok.';
        messageEl.className = 'text-sm mt-3 text-red-600';
        return;
      }

      if (newPassword.length < 6) {
        messageEl.textContent = 'Password baru minimal 6 karakter.';
        messageEl.className = 'text-sm mt-3 text-red-600';
        return;
      }

      // Kirim request ke endpoint custom
      // ...existing code...
      const res = await fetch('/api/settings-update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId,
          currentPassword,
          newPassword
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal update password');

      messageEl.textContent = 'Password berhasil diperbarui!';
      messageEl.className = 'text-sm mt-3 text-green-600';
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      messageEl.textContent = 'Gagal memperbarui password: ' + error.message;
      messageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
      setAccountLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const messageEl = document.getElementById('profileMessage');

    try {
      // Kirim request ke endpoint custom
      const res = await fetch('/api/settings-update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId,
          Nama: fullName,
          NamaPequrban: pequrbanName,
          phone_number: phoneNumber,
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal update profil');

      messageEl.textContent = 'Profil berhasil diperbarui!';
      messageEl.className = 'text-sm mt-3 text-green-600';
      setProfile({ Nama: fullName, NamaPequrban: pequrbanName });
    } catch (error) {
      messageEl.textContent = 'Gagal memperbarui profil: ' + error.message;
      messageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Pengaturan Akun</h1>
            <p className="text-gray-600">Kelola informasi akun dan profil Anda</p>
          </div>
          <div className="w-full sm:w-auto flex justify-start sm:justify-end">
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-green-600 text-green-700 bg-white rounded-lg shadow-sm text-sm font-semibold hover:bg-green-50 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              style={{ minWidth: 'fit-content' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('account')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pengaturan Akun
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pengaturan Profil
              </button>
            </nav>
          </div>

          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Update Email */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Email</h3>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700">
                      Email Saat Ini
                    </label>
                    <input
                      type="email"
                      id="currentEmail"
                      value={currentEmail}
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                      Email Baru
                    </label>
                    <input
                      type="email"
                      id="newEmail"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={accountLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {accountLoading ? 'Memperbarui...' : 'Perbarui Email'}
                  </button>
                </form>
                <p id="emailMessage" className="text-sm mt-3"></p>
              </div>

              {/* Update Password */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={accountLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {accountLoading ? 'Memperbarui...' : 'Perbarui Password'}
                  </button>
                </form>
                <p id="passwordMessage" className="text-sm mt-3"></p>
              </div>
            </div>
          )}

          {/* Profile Settings Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Data Pequrban</h3>
                <form onSubmit={handleUpdatePequrban} className="space-y-4">
                  <div>
                    <label htmlFor="jumlah-pequrban" className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Pequrban
                    </label>
                    <input
                      id="jumlah-pequrban"
                      name="jumlah-pequrban"
                      type="number"
                      min={1}
                      max={10}
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      value={jumlahPequrban === 0 ? '' : jumlahPequrban}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setJumlahPequrban(0);
                          setPequrbanNames([]);
                          return;
                        }
                        let val = Number(raw);
                        if (isNaN(val)) val = 0;
                        if (val > 10) val = 10;
                        setJumlahPequrban(val);
                        setPequrbanNames((prev) => {
                          const arr = [...prev];
                          if (val > arr.length) {
                            for (let i = arr.length; i < val; i++) arr.push('');
                          } else if (val < arr.length) {
                            arr.length = val;
                          }
                          return arr;
                        });
                      }}
                    />
                  </div>
                  {/* Nama-nama Pequrban */}
                  {pequrbanNames.map((name, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pequrban #{idx + 1}
                      </label>
                      <input
                        type="text"
                        required
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                        placeholder={`Masukkan nama pequrban ke-${idx + 1}`}
                        value={name}
                        onChange={(e) => {
                          const arr = [...pequrbanNames];
                          arr[idx] = e.target.value;
                          setPequrbanNames(arr);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pequrbanLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {pequrbanLoading ? 'Memperbarui...' : 'Perbarui Data Pequrban'}
                  </button>
                </form>
                {pequrbanMessage && (
                  <div className={`py-2 px-3 rounded-md text-sm mt-2 ${pequrbanMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {pequrbanMessage}
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ubah Informasi Profil</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Nama Lengkap Pemilik Akun
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Nomor HP
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {profileLoading ? 'Memperbarui...' : 'Perbarui Profil'}
                  </button>
                </form>
                <p id="profileMessage" className="text-sm mt-3"></p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
