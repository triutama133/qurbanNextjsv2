"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  // SECTION 1 — Data Pemilik Akun
  const [fullName, setFullName] = useState("")
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [incomeRange, setIncomeRange] = useState("")
  const [job, setJob] = useState("")
  const [jobOther, setJobOther] = useState("")
  const [jobPosition, setJobPosition] = useState("")
  const [jobPositionOther, setJobPositionOther] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("") // "Single" | "Married" | "Previously Married"
  const [childrenCount, setChildrenCount] = useState("")

  // SECTION 2 — Data Pequrban
  const [jumlahPequrban, setJumlahPequrban] = useState(1)
  const [pequrbanNames, setPequrbanNames] = useState([""])
  const [metodeTabungan, setMetodeTabungan] = useState("Qurban di Tim") // "Qurban di Tim" | "Qurban Sendiri"
  const [customTarget, setCustomTarget] = useState("")

  // SECTION 3 — Password
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // UX state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // "error" | "success"
  const router = useRouter()

  // ===== Helpers =====
  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount || 0)

  const parseNumber = (str) => Number.parseInt(String(str).replace(/[^0-9]/g, ""), 10) || 0

  const defaultTargetPerPequrban = 2650000
  const targetPerPequrban = useMemo(() => {
    if (metodeTabungan === "Qurban di Tim") return defaultTargetPerPequrban
    return parseNumber(customTarget)
  }, [metodeTabungan, customTarget])

  const totalTarget = useMemo(() => targetPerPequrban * (jumlahPequrban || 0), [targetPerPequrban, jumlahPequrban])

  const monthlyRecommendation = useMemo(() => {
    const months = 12
    return Math.ceil((totalTarget || 0) / months)
  }, [totalTarget])

  // ===== Submit =====
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setMessageType("")

    // --- Validasi Section 1 ---
    if (!fullName.trim()) return endWithError("Nama lengkap wajib diisi.")
    if (!nickname.trim()) return endWithError("Nama panggilan wajib diisi.")
    if (!email.trim()) return endWithError("Email wajib diisi.")
    if (!phoneNumber.trim()) return endWithError("No HP/WA aktif wajib diisi.")
    if (!province.trim()) return endWithError("Provinsi domisili wajib diisi.")
    if (!city.trim()) return endWithError("Kota domisili wajib diisi.")
    if (!job) return endWithError("Pekerjaan wajib dipilih.")
    if (job === "Lainnya" && !jobOther.trim()) return endWithError("Detail pekerjaan wajib diisi.")
    if (job !== "Tidak Bekerja") {
      if (!jobPosition) return endWithError("Posisi di pekerjaan wajib dipilih.")
      if (jobPosition === "Lainnya" && !jobPositionOther.trim()) return endWithError("Detail posisi wajib diisi.")
    }
    if (!maritalStatus) return endWithError("Status pernikahan wajib dipilih.")
  if (!incomeRange) return endWithError("Range pendapatan wajib dipilih.")

    if (maritalStatus !== "Single") {
      const n = Number(childrenCount)
      if (!(childrenCount !== "" && !Number.isNaN(n) && n >= 0)) {
        return endWithError("Jumlah anak wajib diisi (0 jika belum ada) dan tidak boleh negatif.")
      }
    }

    // --- Validasi Section 2 ---
    if (!jumlahPequrban || jumlahPequrban < 1) return endWithError("Jumlah pequrban minimal 1.")
    if (pequrbanNames.length !== jumlahPequrban || pequrbanNames.some((n) => !n.trim()))
      return endWithError("Semua nama pequrban harus diisi.")

    if (metodeTabungan === "Qurban Sendiri") {
      const v = parseNumber(customTarget)
      if (v < 500000) return endWithError("Target tabungan custom minimal Rp 500.000 per pequrban.")
    }

    // --- Validasi Section 3 ---
    if (!password.trim()) return endWithError("Password wajib diisi.")
    if (password !== confirmPassword) return endWithError("Password dan konfirmasi password tidak cocok.")

    // Generate userId (UUID v4)
    const userId = crypto.randomUUID
      ? crypto.randomUUID()
      : ([1e7]+-1e3+-4e3+-8e3+-1e11)
          .replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))

    const normalizedChildren =
      maritalStatus === "Single" ? 0 : (childrenCount === "" ? 0 : Number(childrenCount))

    // Build pekerjaan/posisi values
    const pekerjaanValue = job === "Lainnya" && jobOther ? `Lainnya - ${jobOther}` : job
    const posisiPekerjaanValue = job === "Tidak Bekerja"
      ? "" // penting: kirim string kosong ketika tidak bekerja
      : jobPosition === "Lainnya"
      ? (jobPositionOther ? `Lainnya - ${jobPositionOther}` : "")
      : jobPosition

    const payload = {
      UserId: userId,
      Nama: fullName,
      Nickname: nickname,
      Email: email,
      phone_number: phoneNumber,
      Provinsi: province,
      Kota: city,
  RangePendapatan: incomeRange,
      Pekerjaan: pekerjaanValue,
      PosisiPekerjaan: posisiPekerjaanValue,
      StatusPernikahan: maritalStatus,
      JumlahAnak: normalizedChildren,
      JumlahPequrban: jumlahPequrban,
      NamaPequrban: pequrbanNames,
      MetodeTabungan: metodeTabungan,
      TargetPribadi: targetPerPequrban,
      Password: password,
    }

    try {
      console.log("[Register][client] payload:", payload)

      const res = await fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json().catch(() => ({}))

      if (res.status === 409) return endWithError("Email ini sudah terdaftar di sistem. Silakan login.")
      if (!res.ok || result.error) return endWithError(result.error || "Gagal menyimpan data profil.")

      setMessage("Pendaftaran berhasil! Mengalihkan ke halaman login…")
      setMessageType("success")
      setTimeout(() => router.push("/qurban/login"), 1500)
    } catch (err) {
      console.error(err)
      endWithError("Terjadi kesalahan jaringan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  function endWithError(msg) {
    setMessage(msg)
    setMessageType("error")
    setLoading(false)
  }

  // ===== UI =====
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10 px-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daftar Akun Baru</h1>
          <p className="mt-1 text-gray-600">Bergabung untuk ikut program tabungan qurban</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* SECTION 1: Data Pemilik Akun */}
          <Section title="1) Data Pemilik Akun" subtitle="Isi identitas dasar Anda">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama sesuai KTP"
                required
              />
              <Input
                label="Nama Panggilan"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nama panggilan Anda"
                required
              />
              <Input
                label="Alamat Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@domain.com"
                required
              />
              <Input
                label="No HP/WA Aktif"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))}
                placeholder="08xxxxxxxxxx"
                required
              />
              <Input
                label="Provinsi Domisili"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: Jawa Barat"
                required
              />
              <Input
                label="Kota Domisili"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Bandung"
                required
              />


              <Select
                label="Pekerjaan"
                value={job}
                onChange={e => setJob(e.target.value)}
                required
                options={[
                  { label: "Pilih pekerjaan…", value: "", disabled: true },
                  { label: "PNS", value: "PNS" },
                  { label: "P3K", value: "P3K" },
                  { label: "Pejabat Publik", value: "Pejabat Publik" },
                  { label: "Pegawai BUMN/BUMD", value: "Pegawai BUMN/BUMD" },
                  { label: "Pegawai Swasta", value: "Pegawai Swasta" },
                  { label: "Profesional/Freelancer", value: "Profesional/Freelancer" },
                  { label: "Dosen/Guru", value: "Dosen/Guru" },
                  { label: "Pegawai NGO", value: "Pegawai NGO" },
                  { label: "Pengusaha", value: "Pengusaha" },
                  { label: "Tidak Bekerja", value: "Tidak Bekerja" },
                  { label: "Lainnya", value: "Lainnya" },
                ]}
              />
              {job === "Lainnya" && (
                <Input
                  label="Detail Pekerjaan"
                  value={jobOther}
                  onChange={e => setJobOther(e.target.value)}
                  placeholder="Isi pekerjaan Anda"
                  required
                />
              )}
              {job !== "Tidak Bekerja" && (
                <>
                  <Select
                    label="Posisi di Pekerjaan"
                    value={jobPosition}
                    onChange={e => setJobPosition(e.target.value)}
                    required
                    options={[
                      { label: "Pilih posisi…", value: "", disabled: true },
                      { label: "Intern", value: "Intern" },
                      { label: "Staff", value: "Staff" },
                      { label: "Supervisor", value: "Supervisor" },
                      { label: "Direksi/C Level", value: "Direksi/C Level" },
                      { label: "Lainnya", value: "Lainnya" },
                    ]}
                  />
                  {jobPosition === "Lainnya" && (
                    <Input
                      label="Detail Posisi"
                      value={jobPositionOther}
                      onChange={e => setJobPositionOther(e.target.value)}
                      placeholder="Isi posisi Anda"
                      required
                    />
                  )}
                </>
              )}

              <Select
                label="Range Pendapatan"
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                required
                options={[
                  { label: "Pilih range pendapatan…", value: "", disabled: true },
                  { label: "< 3 juta", value: "< 3 juta" },
                  { label: "3 - 4,5 juta", value: "3 - 4,5 juta" },
                  { label: "4,5 - 6 juta", value: "4,5 - 6 juta" },
                  { label: "6,5 - 9 juta", value: "6,5 - 9 juta" },
                  { label: "> 9 juta", value: "> 9 juta" },
                ]}
              />

              <Select
                label="Status Pernikahan"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                required
                options={[
                  { label: "Pilih status…", value: "", disabled: true },
                  { label: "Single", value: "Single" },
                  { label: "Married", value: "Married" },
                  { label: "Previously Married", value: "Previously Married" },
                ]}
              />
              {(maritalStatus === "Married" || maritalStatus === "Previously Married") && (
                <Input
                  label="Jumlah Anak"
                  type="number"
                  min={0}
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(e.target.value)}
                  placeholder="0 jika belum ada"
                  required
                />
              )}
            </div>
          </Section>

          {/* SECTION 2: Data Pequrban */}
          <Section title="2) Data Pequrban" subtitle="Isi data pequrban dan pilih metode qurban">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Jumlah Pequrban"
                type="number"
                min={1}
                max={10}
                value={jumlahPequrban === 0 ? "" : jumlahPequrban}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw === "") {
                    setJumlahPequrban(0)
                    setPequrbanNames([])
                    return
                  }
                  let val = Number(raw)
                  if (Number.isNaN(val)) val = 0
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
                required
              />
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Qurban</label>
                <div className="space-y-2">
                  <Radio
                    name="metode-tabungan"
                    value="Qurban di Tim"
                    checked={metodeTabungan === "Qurban di Tim"}
                    onChange={(v) => setMetodeTabungan(v)}
                    description={`Target per pequrban: ${formatRupiah(defaultTargetPerPequrban)} | Total: ${formatRupiah(defaultTargetPerPequrban * (jumlahPequrban || 0))}`}
                  />
                  <Radio
                    name="metode-tabungan"
                    value="Qurban Sendiri"
                    checked={metodeTabungan === "Qurban Sendiri"}
                    onChange={(v) => setMetodeTabungan(v)}
                    description="Pakai target custom per pequrban"
                  />
                </div>
              </div>

              {metodeTabungan === "Qurban Sendiri" && (
                <div className="sm:col-span-2">
                  <Input
                    label="Target Tabungan Custom (per pequrban)"
                    value={customTarget}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      const formatted = value ? Number.parseInt(value, 10).toLocaleString("id-ID") : ""
                      setCustomTarget(formatted)
                    }}
                    placeholder="Contoh: 2.500.000"
                    required
                  />
                </div>
              )}
            </div>

            {/* Nama Pequrban */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pequrbanNames.map((name, idx) => (
                <Input
                  key={idx}
                  label={`Nama Pequrban #${idx + 1}`}
                  value={name}
                  onChange={(e) => {
                    const arr = [...pequrbanNames]
                    arr[idx] = e.target.value
                    setPequrbanNames(arr)
                  }}
                  placeholder={`Nama pequrban ke-${idx + 1}`}
                  required
                />
              ))}
            </div>

            {/* Ringkasan Target */}
            <div className="mt-4 rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">
              <div>Target per pequrban: <strong>{formatRupiah(targetPerPequrban)}</strong></div>
              <div>Total target ({jumlahPequrban || 0} pequrban): <strong>{formatRupiah(totalTarget)}</strong></div>
              <div>Rekomendasi tabungan per bulan (12 bulan): <strong>{formatRupiah(monthlyRecommendation)}</strong></div>
            </div>
          </Section>

          {/* SECTION 3: Password */}
          <Section title="3) Keamanan Akun" subtitle="Setel password Anda">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                required
              />
            </div>
          </Section>

          {/* Status message */}
          {message && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                messageType === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between gap-3">
            <a href="/qurban/login" className="text-sm text-indigo-600 hover:underline">
              Sudah punya akun? Masuk
            </a>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ===================== Sub Components ===================== */

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

function Input({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        {...props}
      />
    </label>
  )
}

function Select({ label, options = [], className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <select
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Radio({ name, value, checked, onChange, description }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:border-indigo-300 transition">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1"
      />
      <div>
        <div className="text-sm font-medium text-gray-800">{value}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
    </label>
  )
}
