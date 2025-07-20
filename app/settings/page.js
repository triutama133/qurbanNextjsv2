"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  
  // Profile Settings State
  const [fullName, setFullName] = useState('');
  const [pequrbanName, setPequrbanName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        setCurrentEmail(user.email);
        setNewEmail(user.email);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('Nama, NamaPequrban')
          .eq('UserId', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
          setFullName(profileData.Nama || '');
          setPequrbanName(profileData.NamaPequrban || '');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

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

      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

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

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

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
      const { error } = await supabase
        .from('users')
        .update({
          Nama: fullName,
          NamaPequrban: pequrbanName,
        })
        .eq('UserId', user.id);

      if (error) throw error;

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
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Pengaturan Akun</h1>
            <p className="text-gray-600">Kelola informasi akun dan profil Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-green-700">
              ← Kembali ke Dashboard
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
                  <label htmlFor="pequrbanName" className="block text-sm font-medium text-gray-700">
                    Nama Pequrban (Qurban atas nama)
                  </label>
                  <input
                    type="text"
                    id="pequrbanName"
                    value={pequrbanName}
                    onChange={(e) => setPequrbanName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
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
          )}
        </div>
      </main>
    </div>
  );
}