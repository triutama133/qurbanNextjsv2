"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardData } from '../../../hooks/useDashboardData'

export default function SettingsPage() {
  const router = useRouter()
  const {
    user,
    profile,
    setProfile,
    fetchUserAndInit,
    fetchProfile,
    fetchAppConfigSection,
    fetchPersonalSectionData,
    loadingProfile,
    loadingAppConfig,
    loadingPersonal,
  } = useDashboardData()

  const [activeTab, setActiveTab] = useState('profile')
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailMessageType, setEmailMessageType] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordMessageType, setPasswordMessageType] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [pequrbanLoading, setPequrbanLoading] = useState(false)
  const [pequrbanMessage, setPequrbanMessage] = useState('')
  const [pequrbanMessageType, setPequrbanMessageType] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileMessageType, setProfileMessageType] = useState('')

  const [jumlahPequrban, setJumlahPequrban] = useState(0)
  const [pequrbanNames, setPequrbanNames] = useState([])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const personalFetched = useRef(false)

  useEffect(() => {
    fetchUserAndInit(router)
  }, [fetchUserAndInit, router])

  useEffect(() => {
    if (user?.UserId) fetchProfile(user.UserId)
    fetchAppConfigSection()
  }, [user, fetchProfile, fetchAppConfigSection])

  useEffect(() => {
    if (!user?.UserId) return
    if (personalFetched.current) return
    personalFetched.current = true
    fetchPersonalSectionData(user.UserId, profile, null)
  }, [user, profile, fetchPersonalSectionData])

  useEffect(() => {
    if (profile?.Email) setCurrentEmail(profile.Email)
    else if (user?.Email) setCurrentEmail(user.Email)
    else if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('qurban_user')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.Email) setCurrentEmail(parsed.Email)
        }
      } catch (e) {
        // ignore
      }
    }
  }, [profile, user])

  useEffect(() => {
    if (profile) {
      if (typeof profile.JumlahPequrban === 'number') setJumlahPequrban(profile.JumlahPequrban)
      if (Array.isArray(profile.NamaPequrban)) setPequrbanNames(profile.NamaPequrban)
    }
  }, [profile])

  // Auto-clear profile message after 10 seconds
  useEffect(() => {
    if (!profileMessage) return
    const t = setTimeout(() => {
      setProfileMessage('')
      setProfileMessageType('')
    }, 10000)
    return () => clearTimeout(t)
  }, [profileMessage])

  // Auto-clear email message after 10 seconds
  useEffect(() => {
    if (!emailMessage) return
    const t = setTimeout(() => {
      setEmailMessage('')
      setEmailMessageType('')
    }, 10000)
    return () => clearTimeout(t)
  }, [emailMessage])

  // Auto-clear password message after 10 seconds
  useEffect(() => {
    if (!passwordMessage) return
    const t = setTimeout(() => {
      setPasswordMessage('')
      setPasswordMessageType('')
    }, 10000)
    return () => clearTimeout(t)
  }, [passwordMessage])

  // Auto-clear pequrban message after 10 seconds
  useEffect(() => {
    if (!pequrbanMessage) return
    const t = setTimeout(() => {
      setPequrbanMessage('')
      setPequrbanMessageType('')
    }, 10000)
    return () => clearTimeout(t)
  }, [pequrbanMessage])

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setAccountLoading(true)
    try {
      const res = await fetch('/api/settings-update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserId: user?.UserId, Email: newEmail }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) throw new Error(json.error || 'Gagal memperbarui email')
      setCurrentEmail(newEmail)
      setNewEmail('')
  setEmailMessage('Email diperbarui')
  setEmailMessageType('success')
    } catch (err) {
      console.error(err)
  setEmailMessage(err.message || 'Gagal memperbarui email')
  setEmailMessageType('error')
    } finally {
      setAccountLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return alert('Konfirmasi password tidak cocok')
    setAccountLoading(true)
    try {
      const res = await fetch('/api/settings-update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserId: user?.UserId, CurrentPassword: currentPassword, NewPassword: newPassword }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) throw new Error(json.error || 'Gagal memperbarui password')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password diperbarui')
      setPasswordMessageType('success')
    } catch (err) {
      console.error(err)
      setPasswordMessage(err.message || 'Gagal memperbarui password')
      setPasswordMessageType('error')
    } finally {
      setAccountLoading(false)
    }
  }

  const handleUpdatePequrban = async (e) => {
    e.preventDefault()
    setPequrbanLoading(true)
    setPequrbanMessage('')
    try {
      // sanitize and validate
      const names = (Array.isArray(pequrbanNames) ? pequrbanNames.map(n => (n || '').trim()).filter(n => n !== '') : [])
      const payloadJumlah = jumlahPequrban || names.length

      if (!user?.UserId) {
        setPequrbanMessage('User tidak ditemukan. Silakan login ulang.')
        setPequrbanMessageType('error')
        setPequrbanLoading(false)
        return
      }
      if (!Array.isArray(names) || names.length === 0) {
        setPequrbanMessage('Masukkan nama pequrban minimal satu.')
        setPequrbanMessageType('error')
        setPequrbanLoading(false)
        return
      }
      if (!payloadJumlah || payloadJumlah <= 0) {
        setPequrbanMessage('Jumlah pequrban harus lebih dari 0.')
        setPequrbanMessageType('error')
        setPequrbanLoading(false)
        return
      }

      const res = await fetch('/api/settings-update-pequrban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.UserId, JumlahPequrban: payloadJumlah, NamaPequrban: names }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json.error) throw new Error(json.error || 'Gagal memperbarui data pequrban')
      setPequrbanMessage('Data pequrban diperbarui')
      setPequrbanMessageType('success')
    } catch (err) {
      console.error(err)
      setPequrbanMessage('Gagal memperbarui data pequrban')
      setPequrbanMessageType('error')
    } finally {
      setPequrbanLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
  setProfileMessage('')
    try {
      // Ensure RangePendapatan is selected
      if (!profile?.RangePendapatan) {
        setProfileMessage('Range pendapatan wajib dipilih.')
        setProfileMessageType('error')
        setProfileLoading(false)
        return
      }
      // Build explicit payload so backend receives exactly the keys it expects
      const payload = {
        userId: user?.UserId,
        Nama: profile?.Nama || '',
        Nickname: profile?.Nickname || '',
        RangePendapatan: profile?.RangePendapatan || '',
        Provinsi: profile?.Provinsi || '',
        Kota: profile?.Kota || '',
        Pekerjaan: profile?.Pekerjaan || '',
        StatusPernikahan: profile?.StatusPernikahan || '',
        JumlahAnak: profile?.JumlahAnak || 0,
        phone_number: profile?.phone_number || '',
        PosisiPekerjaan: profile?.PosisiPekerjaan || '',
      }

      const res = await fetch('/api/settings-update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
  if (!res.ok || json.error) throw new Error(json.error || 'Gagal memperbarui profil')
  if (user?.UserId) await fetchProfile(user.UserId)
  setProfileMessage('Profil diperbarui')
  setProfileMessageType('success')
    } catch (err) {
  console.error(err)
  setProfileMessage('Gagal memperbarui profil')
  setProfileMessageType('error')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold mb-0 text-black">Pengaturan Akun</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/qurban/dashboard')} className="text-sm px-3 py-1 rounded border bg-white hover:bg-gray-100">Kembali ke Dashboard</button>
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-green-600 text-white' : 'bg-white'}`}>Profil</button>
          <button onClick={() => setActiveTab('account')} className={`px-4 py-2 rounded ${activeTab === 'account' ? 'bg-green-600 text-white' : 'bg-white'}`}>Akun</button>
        </div>

        <div>
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3 text-black">Ubah Email</h3>
                <form onSubmit={handleUpdateEmail} className="space-y-3">
                  <div>
          <label className="block text-sm text-black mb-1">Email Saat Ini</label>
                    <input type="email" value={currentEmail} disabled className="w-full rounded border px-3 py-2 bg-gray-50" />
                  </div>
                  <div>
          <label className="block text-sm text-black mb-1">Email Baru</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full rounded border px-3 py-2" />
                  </div>
                  <button disabled={accountLoading} className="w-full bg-green-600 text-white py-2 rounded">{accountLoading ? 'Memperbarui...' : 'Perbarui Email'}</button>
                  {emailMessage && (
                    <div className={`mt-3 p-3 rounded ${emailMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {emailMessage}
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-3 text-black">Ubah Password</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div>
                    <label className="block text-sm text-black mb-1">Password Lama</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-black mb-1">Password Baru</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-black mb-1">Konfirmasi Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full rounded border px-3 py-2" />
                  </div>
                  <button disabled={accountLoading} className="w-full bg-green-600 text-white py-2 rounded">{accountLoading ? 'Memperbarui...' : 'Perbarui Password'}</button>
                  {passwordMessage && (
                    <div className={`mt-3 p-3 rounded ${passwordMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {passwordMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-3 text-black">Ubah Data Pequrban</h3>
                <form onSubmit={handleUpdatePequrban} className="space-y-4">
                  <div>
                    <label className="block text-sm text-black mb-1">Jumlah Pequrban</label>
                    <input type="number" min={1} max={10} value={jumlahPequrban === 0 ? '' : jumlahPequrban} onChange={(e) => {
                      const raw = e.target.value
                      if (raw === '') { setJumlahPequrban(0); setPequrbanNames([]); return }
                      let val = Number(raw); if (isNaN(val)) val = 0; if (val > 10) val = 10; setJumlahPequrban(val)
                      setPequrbanNames((prev) => { const arr = [...prev]; if (val > arr.length) { for (let i = arr.length; i < val; i++) arr.push('') } else if (val < arr.length) { arr.length = val } return arr })
                    }} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pequrbanNames.map((n, i) => (
                      <div key={i}>
                        <label className="block text-sm text-black mb-1">Nama Pequrban #{i + 1}</label>
                        <input type="text" value={n} onChange={(e) => { const arr = [...pequrbanNames]; arr[i] = e.target.value; setPequrbanNames(arr) }} required className="w-full rounded border px-3 py-2" />
                      </div>
                    ))}
                  </div>
                  <button disabled={pequrbanLoading} className="w-full bg-green-600 text-white py-2 rounded">{pequrbanLoading ? 'Memperbarui...' : 'Perbarui Data Pequrban'}</button>
                </form>
                {pequrbanMessage && (<div className={`mt-3 p-3 rounded ${pequrbanMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{pequrbanMessage}</div>)}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-3 text-black">Ubah Informasi Profil</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm text-black mb-1">Nama Lengkap</label>
                    <input type="text" value={profile?.Nama || ''} onChange={e => setProfile(p => ({ ...p, Nama: e.target.value }))} required className="w-full rounded border px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-1">Nama Panggilan</label>
                    <input type="text" value={profile?.Nickname || ''} onChange={e => setProfile(p => ({ ...p, Nickname: e.target.value }))} required className="w-full rounded border px-3 py-2" />
                  </div>



                  <div>
                    <label className="block text-sm text-black mb-1">No HP</label>
                    <input type="tel" value={profile?.phone_number || ''} onChange={e => setProfile(p => ({ ...p, phone_number: e.target.value.replace(/[^0-9+]/g, '') }))} required className="w-full rounded border px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-1">Provinsi Domisili</label>
                    <input type="text" value={profile?.Provinsi || ''} onChange={e => setProfile(p => ({ ...p, Provinsi: e.target.value }))} required className="w-full rounded border px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-1">Kota Domisili</label>
                    <input type="text" value={profile?.Kota || ''} onChange={e => setProfile(p => ({ ...p, Kota: e.target.value }))} required className="w-full rounded border px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-1">Range Pendapatan</label>
                    <select value={profile?.RangePendapatan || ''} onChange={e => setProfile(p => ({ ...p, RangePendapatan: e.target.value }))} required className="w-full rounded border px-3 py-2">
                      <option value="" disabled>Pilih range pendapatan…</option>
                      <option value="< 3 juta">&lt; 3 juta</option>
                      <option value="3-4,5 juta">3 - 4,5 juta</option>
                      <option value="4,5-6 juta">4,5 - 6 juta</option>
                      <option value="6,5-9 juta">6,5 - 9 juta</option>
                      <option value=">9 juta">&gt; 9 juta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-black mb-1">Pekerjaan</label>
                    <select value={(profile?.Pekerjaan || '').startsWith('Lainnya - ') ? 'Lainnya' : (profile?.Pekerjaan || '')} onChange={e => { const v = e.target.value; if (v === 'Lainnya') setProfile(p => ({ ...p, Pekerjaan: 'Lainnya - ' })); else setProfile(p => ({ ...p, Pekerjaan: v })) }} className="w-full rounded border px-3 py-2">
                      <option value="" disabled>Pilih pekerjaan…</option>
                      <option value="PNS">PNS</option>
                      <option value="P3K">P3K</option>
                      <option value="Pejabat Publik">Pejabat Publik</option>
                      <option value="Pegawai BUMN/BUMD">Pegawai BUMN/BUMD</option>
                      <option value="Pegawai Swasta">Pegawai Swasta</option>
                      <option value="Profesional/Freelancer">Profesional/Freelancer</option>
                      <option value="Dosen/Guru">Dosen/Guru</option>
                      <option value="Pegawai NGO">Pegawai NGO</option>
                      <option value="Pengusaha">Pengusaha</option>
                      <option value="Tidak Bekerja">Tidak Bekerja</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {(profile?.Pekerjaan || '').startsWith('Lainnya') && (
                    <div>
                      <label className="block text-sm text-black mb-1">Detail Pekerjaan</label>
                      <input type="text" value={(profile?.Pekerjaan || '').replace(/^Lainnya - /, '')} onChange={e => setProfile(p => ({ ...p, Pekerjaan: `Lainnya - ${e.target.value}` }))} className="w-full rounded border px-3 py-2" placeholder="Jelaskan pekerjaan Anda" />
                    </div>
                  )}

                  {((profile?.Pekerjaan || '') !== 'Tidak Bekerja') && (
                    <div>
                      <label className="block text-sm text-black mb-1">Posisi Pekerjaan</label>
                      <select value={(profile?.PosisiPekerjaan || '').startsWith('Lainnya - ') ? 'Lainnya' : (profile?.PosisiPekerjaan || '')} onChange={e => { const v = e.target.value; if (v === 'Lainnya') setProfile(p => ({ ...p, PosisiPekerjaan: 'Lainnya - ' })); else setProfile(p => ({ ...p, PosisiPekerjaan: v })) }} className="w-full rounded border px-3 py-2">
                        <option value="" disabled>Pilih posisi…</option>
                        <option value="Intern">Intern</option>
                        <option value="Staff">Staff</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Asisten Manager">Asisten Manager</option>
                        <option value="Manajer">Manajer</option>
                        <option value="Direksi/C Level">Direksi/C Level</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  )}

                  {(profile?.PosisiPekerjaan || '').startsWith('Lainnya') && (
                    <div>
                      <label className="block text-sm text-black mb-1">Detail Posisi</label>
                      <input type="text" value={(profile?.PosisiPekerjaan || '').replace(/^Lainnya - /, '')} onChange={e => setProfile(p => ({ ...p, PosisiPekerjaan: `Lainnya - ${e.target.value}` }))} className="w-full rounded border px-3 py-2" placeholder="Jelaskan posisi Anda" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-black mb-1">Status Pernikahan</label>
                    <select value={profile?.StatusPernikahan || ''} onChange={e => setProfile(p => ({ ...p, StatusPernikahan: e.target.value }))} className="w-full rounded border px-3 py-2">
                      <option value="" disabled>Status Pernikahan</option>
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Sudah Menikah">Sudah Menikah</option>
                    </select>
                  </div>

                  {profile?.StatusPernikahan === 'Sudah Menikah' && (
                    <div>
                      <label className="block text-sm text-black mb-1">Jumlah Anak</label>
                      <input type="number" min={0} value={profile?.JumlahAnak || ''} onChange={e => setProfile(p => ({ ...p, JumlahAnak: e.target.value }))} className="w-full rounded border px-3 py-2" />
                    </div>
                  )}

                  <div>
                    <button disabled={profileLoading} className="w-full bg-green-600 text-white py-2 rounded">{profileLoading ? 'Memperbarui...' : 'Perbarui Profil'}</button>
                  </div>
                  {profileMessage && (
                    <div className={`mt-3 p-3 rounded ${profileMessageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {profileMessage}
                    </div>
                  )}
                </form>
                <p className="text-sm mt-3">&nbsp;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
