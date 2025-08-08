"use client"

import { useState } from "react"
import supabase from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [jumlahPequrban, setJumlahPequrban] = useState(1)
  const [pequrbanNames, setPequrbanNames] = useState([""])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [metodeTabungan, setMetodeTabungan] = useState("Qurban di Tim") // "Qurban di Tim" atau "Qurban Sendiri"
  const [customTarget, setCustomTarget] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const router = useRouter()

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateMonthlyRecommendation = (target) => {
    const months = 12 // Asumsi 12 bulan untuk mencapai target
    return Math.ceil(target / months)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setMessageType("")

    // Validasi jumlah pequrban minimal 1
    if (!jumlahPequrban || jumlahPequrban < 1) {
      setMessage("Jumlah pequrban minimal 1.")
      setMessageType("error")
      setLoading(false)
      return
    }
    // Validasi nama pequrban
    if (pequrbanNames.length !== jumlahPequrban || pequrbanNames.some((n) => !n.trim())) {
      setMessage("Semua nama pequrban harus diisi.")
      setMessageType("error")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak cocok.")
      setMessageType("error")
      setLoading(false)
      return
    }

    // Validasi target custom jika qurban sendiri
    let targetPerPequrban = 2650000 // Default untuk Qurban di Tim
    if (metodeTabungan === "Qurban Sendiri") {
      const customAmount = Number.parseInt(customTarget.replace(/[^0-9]/g, ""))
      if (!customAmount || customAmount < 500000) {
        setMessage("Target tabungan minimal Rp 500.000 per pequrban untuk Qurban Sendiri.")
        setMessageType("error")
        setLoading(false)
        return
      }
      targetPerPequrban = customAmount
    }
    const totalTarget = targetPerPequrban * jumlahPequrban

    // Generate userId (UUID v4)
    const userId = crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));

    // Log payload ke console sebelum request
    console.log("Payload:", {
      UserId: userId,
      Nama: fullName,
      NamaPequrban: pequrbanNames,
      JumlahPequrban: jumlahPequrban,
      phone_number: phoneNumber,
      Email: email,
      MetodeTabungan: metodeTabungan,
      TargetPribadi: totalTarget,
    })
    const response = await fetch("/api/register-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: userId,
        Nama: fullName,
        NamaPequrban: pequrbanNames,
        JumlahPequrban: jumlahPequrban,
        phone_number: phoneNumber,
        Email: email,
        MetodeTabungan: metodeTabungan,
        TargetPribadi: totalTarget,
        Password: password,
      }),
    })

    const result = await response.json()

    if (response.status === 409) {
      setMessage("Email ini sudah terdaftar di sistem. Silakan login.")
      setMessageType("error")
      setLoading(false)
      return
    }

    if (!response.ok || result.error) {
      setMessage(result.error || "Gagal menyimpan data profil.")
      setMessageType("error")
      setLoading(false)
      return
    }

    setMessage("Pendaftaran berhasil! Silakan login.")
    setMessageType("success")
    setTimeout(() => {
      router.push("/login")
    }, 5000)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Daftar untuk ikut program tabungan qurban</p>
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
            {/* Jumlah Pequrban */}
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={jumlahPequrban === 0 ? "" : jumlahPequrban}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === "") {
                    setJumlahPequrban(0)
                    setPequrbanNames([])
                    return
                  }
                  let val = Number(raw)
                  if (isNaN(val)) val = 0
                  if (val > 10) val = 10
                  setJumlahPequrban(val)
                  setPequrbanNames((prev) => {
                    const arr = [...prev]
                    if (val > arr.length) {
                      for (let i = arr.length; i < val; i++) arr.push("")
                    } else if (val < arr.length) {
                      arr.length = val
                    }
                    return arr
                  })
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={`Masukkan nama pequrban ke-${idx + 1}`}
                  value={name}
                  onChange={(e) => {
                    const arr = [...pequrbanNames]
                    arr[idx] = e.target.value
                    setPequrbanNames(arr)
                  }}
                />
              </div>
            ))}
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
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP
              </label>
              <input
                id="phone-number"
                name="phone-number"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="08xxxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
              />
            </div>

            {/* Metode Qurban Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metode Qurban</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metode-tabungan"
                    value="Qurban di Tim"
                    checked={metodeTabungan === "Qurban di Tim"}
                    onChange={(e) => setMetodeTabungan(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Qurban di Tim (Target: {formatRupiah(2650000)} x {jumlahPequrban} = {formatRupiah(2650000 * jumlahPequrban)})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="metode-tabungan"
                    value="Qurban Sendiri"
                    checked={metodeTabungan === "Qurban Sendiri"}
                    onChange={(e) => setMetodeTabungan(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Qurban Sendiri (Target Custom x {jumlahPequrban})</span>
                </label>
              </div>
            </div>

            {/* Custom Target Input for Qurban Sendiri */}
            {metodeTabungan === "Qurban Sendiri" && (
              <div>
                <label htmlFor="custom-target" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Tabungan Custom (per pequrban)
                </label>
                <input
                  id="custom-target"
                  name="custom-target"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Masukkan target tabungan per pequrban (contoh. Rp 2.500.000)"
                  value={customTarget}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    const formatted = value ? Number.parseInt(value, 10).toLocaleString("id-ID") : ""
                    setCustomTarget(formatted)
                  }}
                />
                {customTarget && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total target: {formatRupiah((Number.parseInt(customTarget.replace(/[^0-9]/g, "")) || 0) * jumlahPequrban)}<br />
                    Rekomendasi tabungan per bulan: {formatRupiah(
                      calculateMonthlyRecommendation((Number.parseInt(customTarget.replace(/[^0-9]/g, "")) || 0) * jumlahPequrban)
                    )}
                  </p>
                )}
              </div>
            )}

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
                messageType === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  )
}
