"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* THEME */}
      <style jsx global>{`
        :root{
          --brand:#059669;        /* emerald-600 */
          --brand-700:#047857;
          --accent:#e53935;       /* merah logo */
        }
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Qurban Berdampak" width={40} height={40} className="rounded-md" />
            <span className="font-extrabold tracking-tight text-lg">
              Qurban <span className="text-[var(--brand)]">Berdampak</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#preview" className="hover:text-emerald-700">Project Preview</a>
            <a href="#alur" className="hover:text-emerald-700">Alur Program</a>
            <a href="#toc" className="hover:text-emerald-700">Theory of Change</a>
            <a href="#faq" className="hover:text-emerald-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={goLogin} className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              Masuk
            </button>
            <button onClick={goRegister} className="inline-flex px-4 py-2 rounded-lg text-white shadow-sm bg-[var(--brand)] hover:bg-[var(--brand-700)]">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        {/* subtle red glow to match logo */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-25"
             style={{background:"radial-gradient(closest-side, var(--accent), transparent 70%)"}}/>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Qurban yang <span className="text-[var(--brand)]">lebih adil</span>, lebih dekat, dan <span className="text-[var(--brand)]">berdampak</span>.
            </h1>
            <p className="mt-5 text-lg text-gray-700">
              Menghubungkan <b>pequrban</b> dengan masyarakat muslim marginal—dengan pendampingan, pelaporan transparan, dan program edukasi keluarga.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={goRegister} className="px-6 py-3 rounded-xl text-white font-semibold shadow bg-[var(--brand)] hover:bg-[var(--brand-700)]">
                Daftar Jadi Pequrban
              </button>
              <a href="#preview" className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-800 hover:bg-gray-50 text-center">
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

          {/* Official Partner from slide */}
          <div>
            <div className="text-center text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Official Partner 2026
            </div>
            <div className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <Image src="/landing/partners.jpg" alt="Official Partner Qurban Berdampak 2026" width={1280} height={720} className="w-full h-auto" priority />
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT PREVIEW 2026 (NO partner image here) */}
      <section id="preview" className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Project Preview 2026</h2>
          <p className="mt-3 text-gray-700 max-w-3xl">
            Fokus implementasi di <b>Provinsi Gorontalo</b>, menjangkau masjid pedesaan minim qurban dan keluarga petani/pekerja tani.
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Stat label="Ekor Sapi (target 2026)" value="6" />
            <Stat label="Pequrban (on going)" value="42" />
            <Stat label="Keluarga Penerima Manfaat" value="330" />
            <Stat label="Beneficiary" value="960" />
          </div>

          {/* Important badges — BIG & informative */}
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
              desc="Menjelang Idul Adha; fleksibel mengikuti target personal."
              icon={<WalletIcon />}
            />
            <BigBadge
              title="Pendampingan Bulanan"
              value="Webinar • Reminder • Financial Check-up"
              desc="Materi keluarga & konsistensi menabung."
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
              desc="Akses kegiatan, konsultasi 1-on-1, & pembelajaran keluarga."
              icon={<StarIcon />}
            />
            <BigBadge
              title="Lokasi Implementasi"
              value="6 Titik Masjid"
              desc="Tumba, Bakti, Ayumolingo, Ilomata, Pongongaila, Botumoputi."
              icon={<PinIcon />}
            />
          </div>
        </div>
      </section>

      {/* ALUR PROGRAM — full SVG/ikon version */}
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
            <button onClick={goRegister} className="px-6 py-3 rounded-xl text-white font-semibold shadow bg-[var(--brand)] hover:bg-[var(--brand-700)]">
              Ikut Program Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* THEORY OF CHANGE — lengkap dari slide */}
      <section id="toc" className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Theory of Change</h2>
          <p className="mt-2 text-gray-700 max-w-3xl">
            Desain program untuk menghasilkan dampak terukur di lokasi implementasi.
          </p>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {/* Masalah */}
            <Card title="Masalah di Lapangan" tone="red">
              <UL>
                <LI>Qurban jarang dilakukan di lingkungan dengan kondisi ekonomi lemah.</LI>
                <LI>Penerima Manfaat belum mampu mengelola keuangan & prioritas.</LI>
                <LI>Terjebak hutang berbunga/berlapis untuk kebutuhan tanam-panen & konsumsi.</LI>
                <LI>Ketergantungan tinggi pada tengkulak & bantuan.</LI>
              </UL>
            </Card>

            {/* Outcomes Sosial & Ekonomi */}
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
                Memperkuat ekosistem pemberdayaan dan <b>memperbesar dampak sosial</b> yang sudah terbentuk—keluarga lebih resilien,
                akses pangan membaik, dan beban hutang menurun.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Pertanyaan Umum</h2>
          <div className="mt-6 divide-y divide-gray-200">
            <FAQ q="Berapa setoran awal dan kapan pelunasannya?">
              Setoran awal <b>Rp 300.000</b>. Pelunasan menjelang Idul Adha (± Rp 2,35 juta per pequrban—dapat menyesuaikan target personal).
            </FAQ>
            <FAQ q="Apakah ada laporan program?">
              Ada: <b>Assessment Report</b> (titik salur & kesiapan) dan <b>Impact Report</b> (hasil & dampak), lengkap dengan dokumentasi.
            </FAQ>
            <FAQ q="Siapa penerima manfaat?">
              Masyarakat muslim marginal di titik wilayah minim qurban, dipetakan bersama mitra lokal.
            </FAQ>
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
            <button onClick={goRegister} className="px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold hover:bg-emerald-50">
              Daftar Pequrban
            </button>
            <button onClick={goLogin} className="px-6 py-3 rounded-xl border border-white/30 font-semibold hover:bg-emerald-600">
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
          <button onClick={goRegister} className="ml-3 px-4 py-2 rounded-xl text-white text-sm font-semibold bg-[var(--brand)] hover:bg-[var(--brand-700)]">
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

/* Icons (inline SVG) */
function CoinsIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M12 3C7 3 3 4.79 3 7s4 4 9 4 9-1.79 9-4-4-4-9-4Zm0 10c-5 0-9-1.79-9-4v3c0 2.21 4 4 9 4s9-1.79 9-4V9c0 2.21-4 4-9 4Zm0 5c-5 0-9-1.79-9-4v3c0 2.21 4 4 9 4s9-1.79 9-4v-3c0 2.21-4 4-9 4Z"/></svg>)}
function WalletIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M20 6H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4h-6a3 3 0 0 1 0-6h6V7a1 1 0 0 0-1-1Zm-5 7h7v-4h-7a2 2 0 0 0 0 4Z"/></svg>)}
function CalendarIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M7 2h2v3h6V2h2v3h3a2 2 0 0 1 2 2v3H2V7a2 2 0 0 1 2-2h3V2Zm15 9v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8h20Z"/></svg>)}
function ReportIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1v5h5"/></svg>)}
function StarIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21"/></svg>)}
function PinIcon(){return(<svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-600"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>)}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
      <span>{children}</span>
    </li>
  );
}

function Step({ i, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center font-bold text-white bg-[var(--brand)]">{i}</div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{desc}</div>
      </div>
    </div>
  );
}

/* ToC helper cards */
function Card({ title, tone="gray", children }) {
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
function UL({children, className=""}){return <ul className={`list-disc pl-5 space-y-1 text-gray-700 ${className}`}>{children}</ul>;}
function LI({children}){return <li>{children}</li>;}

function FAQ({ q, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen(v=>!v)}>
        <span className="font-semibold text-gray-900">{q}</span>
        <span className="text-gray-500">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-2 text-sm text-gray-700">{children}</p>}
    </div>
  );
}
