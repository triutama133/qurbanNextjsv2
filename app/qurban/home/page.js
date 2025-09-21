"use client";

import { useEffect, useState } from "react";
import FAQList from "@/components/FAQList.jsx";
import FAQ from "@/components/FAQ.jsx";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  // smooth anchor scroll
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const goRegister = () => router.push("/qurban/register");
  const goLogin = () => router.push("/qurban/login");

  // --- data 2025 vs 2026 (bisa diubah kapan saja) ---
  const year2025 = {
    sapi: 1,
    pequrban: 7,
    keluarga: 55,
    beneficiary: 160,
    dampakPct: 274, // %
  };

  const target2026 = {
    sapi: 6,
    pequrban: 42,
    keluarga: 330,
    beneficiary: 960,
    dampakPct: 500, // isi jika ada target %
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* THEME */}
      <style jsx global>{`
        :root {
          --brand: #059669; /* emerald-600 */
          --brand-700: #047857;
          --accent: #e53935; /* merah logo */
        }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* pakai logo.png dari /public sesuai permintaan */}
            <Image src="/logo.png" alt="Qurban Berdampak" width={40} height={40} className="rounded-md" />
            <span className="font-extrabold tracking-tight text-lg">
              Qurban <span className="text-[var(--brand)]">Berdampak</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#preview" className="hover:text-emerald-700">Project Preview</a>
            <a href="#toc" className="hover:text-emerald-700">Design Program</a>
            <a href="#alur" className="hover:text-emerald-700">Alur Program</a>
            <a href="#faq" className="hover:text-emerald-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={goLogin}
              className="inline-flex px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Masuk
            </button>
            <button
              onClick={goRegister}
              className="inline-flex px-4 py-2 rounded-lg text-white shadow-sm bg-[var(--brand)] hover:bg-[var(--brand-700)]"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        {/* subtle red glow to match logo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(closest-side, var(--accent), transparent 70%)" }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Qurban yang <span className="text-[var(--brand)]">lebih adil</span>, lebih dekat, dan{" "}
              <span className="text-[var(--brand)]">berdampak</span>.
            </h1>
            <p className="mt-5 text-lg text-gray-700">
              Menghubungkan <b>pequrban</b> dengan masyarakat muslim marginal—dengan pendampingan, pelaporan transparan,
              dan program edukasi keluarga.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={goRegister}
                className="px-6 py-3 rounded-xl text-white font-semibold shadow bg-[var(--brand)] hover:bg-[var(--brand-700)]"
              >
                Daftar Jadi Pequrban
              </button>
              <a
                href="#preview"
                className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-800 hover:bg-gray-50 text-center"
              >
                Lihat Project Preview
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Bullet>Transparan + laporan lengkap & dokumentasi</Bullet>
              <Bullet>Harga adil, memberdayakan peternak lokal</Bullet>
              <Bullet>Distribusi ke pelosok minim qurban</Bullet>
              <Bullet>Program keluarga: edukatif & bermakna</Bullet>
            </ul>
          </div>

          {/* Official Partner dari slide (tetap di HERO) */}
          <div>
            <div className="text-center text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Official Partner 2026
            </div>
            <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <Image
                src="/landing/partners.jpg"
                alt="Official Partner Qurban Berdampak 2026"
                width={1280}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT PREVIEW 2026 (tanpa gambar partner di sini) */}
      <section id="preview" className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Project Preview 2026</h2>
          <p className="mt-3 text-gray-700 max-w-3xl">
            Fokus implementasi di <b>Provinsi Gorontalo</b>, menjangkau masjid pedesaan minim qurban dan keluarga
            petani/pekerja tani.
          </p>

          {/* CAPAIAN PROGRAM 2025 */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-xl font-bold tracking-tight">Capaian Program 2025 — Patungan Qurban 1446H</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                COMPLETED
              </span>
            </div>

            {/* KPI 2025 */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <KPI label="Ekor Sapi" value={year2025.sapi} />
              <KPI label="Pequrban" value={year2025.pequrban} />
              <KPI label="Dampak Sosial-Ekonomi" value={`${year2025.dampakPct}%`} note="indikatif" />
              <KPI label="Keluarga" value={year2025.keluarga} />
              <KPI label="Beneficiary" value={year2025.beneficiary} />
            </div>

              {/* Tombol akses Project Report 2025 - compact spacing */}
              <div className="mt-2 flex justify-end">
                <a
                  href="https://drive.google.com/file/d/1AKjSTlNnV4XenJ5MmL35ZKDjrPF3mI9B/view?pli=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                  Lihat Project Report 2025
                </a>
              </div>
          </div>

          {/* PERBANDINGAN 2025 → 2026 */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-bold tracking-tight">Target Implementasi Tabungan Qurban 2026</h3>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" /> Dibandingkan capaian 2025
                </span>
                </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICompare label="Ekor Sapi" prev={year2025.sapi} next={target2026.sapi} />
          <KPICompare label="Pequrban" prev={year2025.pequrban} next={target2026.pequrban} />
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="text-2xl font-extrabold text-gray-900 leading-none">Dampak Sosial-Ekonomi</div>
            <div className="mt-1 text-xs text-gray-600">Besar peningkatan akan terlihat setelah dilaksanakan Impact Assessment</div>
          </div>
          <KPICompare label="Keluarga" prev={year2025.keluarga} next={target2026.keluarga} />
          <KPICompare label="Beneficiary" prev={year2025.beneficiary} next={target2026.beneficiary} />
        </div>


            {/* Narasi bridging */}
            <p className="mt-4 text-sm text-gray-700">
              Capaian 2025 membuktikan model ini bekerja. Di 2026 kami <b>memperluas jangkauan titik salur</b>,
              menambah kapasitas pendampingan, dan <b>memperkuat standar pelaporan</b> (Assessment & Impact Report),
              agar dampak sosial–ekonomi makin terukur dan berkelanjutan.
            </p>


      
          </div>



          {/* Badges informatif (besar) */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BigBadge
              title="Setoran Awal"
              value="Rp 300.000"
              desc="Aktifkan semua fitur dashboard, mulai nabung & dapat pendampingan."
              icon={<CoinsIcon />}
            />
            <BigBadge
              title="Pelunasan"
              value="± Rp 2,35 juta"
              desc="Menjelang Idul Adha; atau buat target tabunganmu sendiri se-fleksibel mungkin."
              icon={<WalletIcon />}
            />
            <BigBadge
              title="Pendampingan Bulanan"
              value="Webinar • Reminder • Financial Check-up*"
              desc="Materi keluarga & konsistensi menabung. *Khusus pendaftar bulan September 2025"
              icon={<CalendarIcon />}
            />
            <BigBadge
              title="Pelaporan"
              value="Assessment Report + Impact Report"
              desc="Dokumentasi lengkap penyaluran & evaluasi dampak."
              icon={<ReportIcon />}
            />
            <BigBadge
              title="Program Khusus"
              value="Pequrban & Komunitas"
              desc="Program pendampingan keuangan pequrban oleh perencana keuangan & akses ke komunitas keluarga pembelajar."
              icon={<StarIcon />}
            />
            <BigBadge
              title="Lokasi Implementasi"
              value="6 Titik Masjid"
              desc={
                <div>
                  <span className="text-sm">
                    <a href="https://www.google.com/maps/place/Masjid+Al+Muhajirin+Tumba/@0.6545829,122.7738077,1140m/data=!3m1!1e3!4m6!3m5!1s0x32793db1029178af:0x4380e170293d05a2!8m2!3d0.6546932!4d122.7738412!16s%2Fg%2F11svdygx4w?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Al Muhajirin Tumba</a>
                    <span className="mx-1 text-gray-400">|</span>
                    <a href="https://www.google.com/maps/place/JQRH%2B9CR+Masjid+Al+Muttaqin,+Jl.+Trans-Sulawesi,+Bakti,+Kec.+Pulubala,+Kabupaten+Gorontalo,+Gorontalo+96127/data=!4m2!3m1!1s0x32793ccf666c54d9:0x1cc48347365ef968?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI1LjI2LjQYACDXggMqhwEsOTQyNzUzMTMsOTQyMjMyOTksOTQyMTY0MTMsOTQyMTI0OTYsOTQyNzQ4ODIsOTQyMDczOTQsOTQyMDc1MDYsOTQyMDg1MDYsOTQyMTc1MjMsOTQyMTg2NTMsOTQyMjk4MzksOTQyNzUxNjgsNDcwODQzOTMsOTQyMTMyMDAsOTQyNTgzMjVCAklE&skid=e189f663-a1ad-4c9f-a517-9b48c237f5b7" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Al Muttaqin Bakti</a>
                    <span className="mx-1 text-gray-400">|</span>
                    <a href="https://www.google.com/maps/place/0%C2%B039'47.7%22N+122%C2%B046'06.4%22E/@0.663255,122.768455,1140m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d0.663255!4d122.768455?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Al Amin Ayumolingo</a>
                    <span className="mx-1 text-gray-400">|</span>
                    <a href="https://www.google.com/maps/place/0.619721,122.810057/data=!4m6!3m5!1s0!7e2!8m2!3d0.6197207!4d122.8100571?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI1LjI2LjQYACDj7Q0qhwEsOTQyNzUzMTMsOTQyMjMyOTksOTQyMTY0MTMsOTQyMTI0OTYsOTQyNzQ4ODIsOTQyMDczOTQsOTQyMDc1MDYsOTQyMDg1MDYsOTQyMTc1MjMsOTQyMTg2NTMsOTQyMjk4MzksOTQyNzUxNjgsNDcwODQzOTMsOTQyMTMyMDAsOTQyNTgzMjVCAklE&skid=6f9487b1-4b52-46c1-9e1f-30183b562b22" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Nur Hidayah Ilomata</a>
                    <span className="mx-1 text-gray-400">|</span>
                    <a href="https://www.google.com/maps/place/MQ6J%2B6XG+Masjid+Ar-Ridha,+Pongongaila,+Kec.+Pulubala,+Kabupaten+Gorontalo,+Gorontalo+96127/data=!4m2!3m1!1s0x32793d06ddc178b7:0x9c0762a52a87bf3f?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI1LjI2LjQYACCIJyqHASw5NDI3NTMxMyw5NDIyMzI5OSw5NDIxNjQxMyw5NDIxMjQ5Niw5NDI3NDg4Miw5NDIwNzM5NCw5NDIwNzUwNiw5NDIwODUwNiw5NDIxNzUyMyw5NDIxODY1Myw5NDIyOTgzOSw5NDI3NTE2OCw0NzA4NDM5Myw5NDIxMzIwMCw5NDI1ODMyNUICSUQ%3D&skid=8c19947a-4020-4e0e-93a6-b2fc7b64332a" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Ar Ridha Pongongaila</a>
                    <span className="mx-1 text-gray-400">|</span>
                    <a href="https://www.google.com/maps/place/Al-muhajirin/@0.6658015,122.8608909,1140m/data=!3m2!1e3!4b1!4m6!3m5!1s0x32793b88615e8db9:0x8d86b09e35340e5f!8m2!3d0.6658015!4d122.8608909!16s%2Fg%2F11sjsf8hm3?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-900">Masjid Al Muhajirin Botumoputi</a>
                  </span>
                  <div className="mt-2 text-xs text-gray-500">Klik untuk melihat lokasi di Google Maps.</div>
                </div>
              }
              icon={<PinIcon />}
            />
          </div>
        </div>
      </section>


            {/* THEORY OF CHANGE */}
      <section id="toc" className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Desain Program</h2>
          <p className="mt-2 text-gray-700 max-w-3xl">Desain program ini dirancang untuk menghasilkan dampak terukur di lokasi implementasi.</p>


                  {/* Masalah di Lapangan - horizontal card */}
                  <div className="mt-8">
                    <Card title="Masalah di Lapangan" tone="red">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                        <UL className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                          <LI>Qurban jarang dilakukan di lingkungan dengan kondisi ekonomi lemah.</LI>
                          <LI>Penerima Manfaat belum mampu mengelola keuangan & prioritas.</LI>
                          <LI>Terjebak hutang berbunga/berlapis untuk kebutuhan tanam-panen & konsumsi.</LI>
                          <LI>Ketergantungan tinggi pada tengkulak & bantuan.</LI>
                        </UL>
                      </div>
                    </Card>
                  </div>

                  {/* Outcomes Sosial & Ekonomi - grid di bawah masalah */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <Card title="Outcome Sosial" tone="emerald">
                      <UL>
                        <LI>Daging qurban terdistribusi ke masyarakat yang membutuhkan.</LI>
                        <LI>Peningkatan literasi keuangan keluarga Penerima Manfaat.</LI>
                        <LI>Pengurangan ketergantungan terhadap bantuan.</LI>
                      </UL>
                    </Card>
                    <Card title="Outcome Ekonomi" tone="emerald">
                      <UL>
                        <LI>Tidak perlu meminjam uang ke tengkulak/rentenir.</LI>
                      </UL>
                      <UL className="mt-2">
                        <LI>Memiliki tambahan modal untuk kegiatan usaha.</LI>
                        <LI>Akses harga bakalan sapi yang lebih baik saat Idul Adha.</LI>
                      </UL>
                    </Card>
                  </div>

          {/* Impact */}
          <div className="mt-6">
            <Card title="Impact / Change" tone="indigo">
              <p className="text-gray-700">
                Memperkuat ekosistem pemberdayaan dan <b>memperbesar dampak sosial</b> yang sudah terbentuk—keluarga lebih
                resilien, akses pangan membaik, dan beban hutang menurun.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ALUR PROGRAM */}
      <section id="alur" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Alur Program</h2>
          <p className="mt-3 text-gray-700 max-w-2xl">
            Dari registrasi hingga penyaluran—transparan, terukur, dan dipantau melalui dashboard personal.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-8">
            <Step i={1} title="Registrasi Akun" desc="Daftar, isi data, pilih jumlah pequrban & metode tabungan." />
            <Step i={2} title="Setoran Awal" desc="Transfer Rp300.000 untuk mengaktifkan seluruh fitur." />
            <Step i={3} title="Mulai Self-Saving" desc="Catat nabung rutin; dapat reminder & materi edukasi." />
            <Step i={4} title="Retrospective per 3 Bulan" desc="Evaluasi progres agar tetap konsisten." />
            <Step i={5} title="Pemetaan Lokasi & Assessment" desc="Tim memetakan titik salur dan menyusun Assessment Report." />
            <Step i={6} title="Transfer Pelunasan" desc="+-Syawal 2026." />
            <Step i={7} title="Penyaluran Qurban" desc="Distribusi ke wilayah prioritas, terdokumentasi." />
            <Step i={8} title="Impact Report" desc="Laporan dampak sosial-ekonomi & dokumentasi lengkap." />
          </div>

          <div className="mt-8">
            <button
              onClick={goRegister}
              className="px-6 py-3 rounded-xl text-white font-semibold shadow bg-[var(--brand)] hover:bg-[var(--brand-700)]"
            >
              Ikut Program Sekarang
            </button>
          </div>
        </div>
      </section>



      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Pertanyaan Umum</h2>
          <div className="mt-6 divide-y divide-gray-200">
            <FAQList />
          </div>
        </div>
      </section>

      {/* CTA & FOOTER */}
      <section className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold">Siap ikut Qurban yang berdampak?</h3>
            <p className="opacity-90 mt-1">Aktifkan akunmu, mulai menabung, dan salurkan qurban ke titik prioritas.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goRegister}
              className="px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50"
            >
              Daftar Pequrban
            </button>
            <button
              onClick={goLogin}
              className="px-6 py-3 rounded-xl border border-white/30 font-semibold hover:bg-emerald-600"
            >
              Masuk Akun
            </button>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Qurban Berdampak • Transparan • Berdaya • Bermakna
      </footer>

      {/* Sticky CTA (mobile) */}
      <div className="fixed bottom-4 inset-x-4 md:hidden">
        <div className="bg-white shadow-lg rounded-2xl p-3 border border-gray-100 flex items-center justify-between">
          <div className="text-sm font-semibold">Mulai jadi pequrban hari ini</div>
          <button
            onClick={goRegister}
            className="ml-3 px-4 py-2 rounded-xl text-white text-sm font-semibold bg-[var(--brand)] hover:bg-[var(--brand-700)]"
          >
            Daftar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */
function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
      <div className="text-3xl font-extrabold text-emerald-700">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}

function KPICompare({ label, prev, next, unit = "" }) {
  const delta = (next ?? 0) - (prev ?? 0);
  const pct = prev ? Math.round((delta / prev) * 100) : null;
  const up = delta > 0;

  const chipTone = up
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : delta < 0
    ? "bg-red-100 text-red-800 border-red-200"
    : "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
      {/* baris chip di atas: tidak absolute, jadi tidak menimpa angka */}
      <div className="flex justify-end mb-1">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${chipTone}`}>
          <span>{up ? "▲" : delta < 0 ? "▼" : "—"}</span>
          <span>{delta > 0 ? `+${delta}` : delta}{unit}</span>
          {pct !== null && <span className="opacity-70">({pct > 0 ? `+${pct}` : pct}%)</span>}
        </span>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 leading-none">
        {next}{unit && <span className="text-base font-semibold text-gray-500 ml-1">{unit}</span>}
      </div>
      <div className="mt-1 text-xs font-medium text-gray-600">{label}</div>
      <div className="text-[11px] text-gray-400 mt-1">
        2025: <span className="font-medium text-gray-600">{prev}{unit}</span>
      </div>
    </div>
  );
}



function KPI({ label, value, note }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
      <div className="text-2xl font-extrabold text-emerald-700 leading-none">{value}</div>
      <div className="mt-1 text-xs font-medium text-gray-600">{label}</div>
      {note ? <div className="text-[10px] text-gray-400 mt-0.5">{note}</div> : null}
    </div>
  );
}

function CompareStat({ label, prev, next, unit = "" }) {
  const delta = (next ?? 0) - (prev ?? 0);
  const pct = prev ? Math.round((delta / prev) * 100) : null;
  const up = delta > 0;
  const tone =
    up
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : delta < 0
      ? "text-red-700 bg-red-50 border-red-100"
      : "text-gray-700 bg-gray-50 border-gray-100";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="text-sm font-semibold text-gray-600">{label}</div>
      <div className="mt-1 flex items-end gap-3">
        <div className="text-2xl font-extrabold text-gray-900">
          {next}
          {unit && <span className="text-base font-semibold text-gray-500 ml-1">{unit}</span>}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full border ${tone} inline-flex items-center gap-1`}>
          {up ? "▲" : delta < 0 ? "▼" : "—"}
          <span className="font-semibold">{delta > 0 ? `+${delta}` : delta}{unit}</span>
          {pct !== null && <span className="ml-1 opacity-80">({pct > 0 ? `+${pct}` : pct}%)</span>}
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">
        2025: <span className="font-medium">{prev}{unit}</span>
      </div>
    </div>
  );
}

function BigBadge({ title, value, desc, icon }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-sm text-gray-500 font-semibold uppercase tracking-widest">{title}</div>
        <div className="text-xl font-extrabold text-emerald-700">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{desc}</div>
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function Step({ i, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-bold text-white bg-[var(--brand)]">
        {i}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{desc}</div>
      </div>
    </div>
  );
}

/* ToC helper cards */
function Card({ title, tone = "gray", children }) {
  const toneMap = {
    red: "bg-red-50 border-red-100",
    emerald: "bg-emerald-50 border-emerald-100",
    indigo: "bg-indigo-50 border-indigo-100",
    gray: "bg-gray-50 border-gray-100",
  }[tone] || "bg-gray-50 border-gray-100";
  return (
    <div className={`rounded-2xl border ${toneMap} p-6 shadow-sm`}>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function UL({ children, className = "" }) {
  return <ul className={`list-disc pl-5 space-y-1 text-gray-700 ${className}`}>{children}</ul>;
}
function LI({ children }) {
  return <li>{children}</li>;
}

// FAQ component now imported from components/FAQ.jsx

/* Icons (inline SVG) */
function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path
        fill="currentColor"
        d="M12 3C7 3 3 4.79 3 7s4 4 9 4 9-1.79 9-4-4-4-9-4Zm0 10c-5 0-9-1.79-9-4v3c0 2.21 4 4 9 4s9-1.79 9-4V9c0 2.21-4 4-9 4Zm0 5c-5 0-9-1.79-9-4v3c0 2.21 4 4 9 4s9-1.79 9-4v-3c0 2.21-4 4-9 4Z"
      />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path fill="currentColor" d="M20 6H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4h-6a3 3 0 0 1 0-6h6V7a1 1 0 0 0-1-1Zm-5 7h7v-4h-7a2 2 0 0 0 0 4Z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path fill="currentColor" d="M7 2h2v3h6V2h2v3h3a2 2 0 0 1 2 2v3H2V7a2 2 0 0 1 2-2h3V2Zm15 9v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8h20Z" />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1v5h5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path fill="currentColor" d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}
