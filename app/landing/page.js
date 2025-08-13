"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

// Optional: kalau kamu masih mau carousel highlight pendek (bisa dihilangkan)
// Pastikan komponen ini memang ada. Kalau tidak, hapus 3 baris di bawah.
const ProgramCarousel = dynamic(() => import("@/components/ProgramCarousel"), { ssr: false });

export default function LandingPage() {
  const router = useRouter();

  // Smooth scroll untuk anchor (#alur, #toc, #preview)
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

  const goRegister = () => router.push("/register");
  const goLogin = () => router.push("/login");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Qurban" className="h-10 w-auto rounded-md bg-white" style={{maxWidth: 48, objectFit: 'contain', objectPosition: 'top'}} />
            <span className="font-extrabold tracking-tight text-lg">
              Qurban <span className="text-emerald-600">Berdampak</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#alur" className="hover:text-emerald-700">Alur Program</a>
            <a href="#toc" className="hover:text-emerald-700">Theory of Change</a>
            <a href="#preview" className="hover:text-emerald-700">Project Preview</a>
            <a href="https://www.canva.com/design/DAGsuVd4S-w/bBNeQlSNit_mrtaKmW0sQw/edit" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">
              Laporan Tahun Lalu
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={goLogin} className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              Masuk
            </button>
            <button
              onClick={goRegister}
              className="inline-flex px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Qurban yang <span className="text-emerald-600">lebih adil</span>,
              <br className="hidden sm:block" /> lebih dekat, dan <span className="text-emerald-600">berdampak</span>.
            </h1>
            <p className="mt-5 text-lg text-gray-700">
              Kami menghubungkan <b>pequrban</b> dengan masyarakat muslim marginal di wilayah
              yang minim qurban—lengkap dengan pendampingan, pelaporan, dan program edukasi keluarga.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={goRegister}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow"
              >
                Daftar Jadi Pequrban
              </button>
              <a
                href="#alur"
                className="px-6 py-3 rounded-xl border border-gray-300 font-semibold text-gray-800 hover:bg-gray-50 text-center"
              >
                Lihat Cara Kerja
              </a>
            </div>

            {/* Key benefits */}
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Transparan + laporan lengkap & dokumentasi
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Harga adil, memberdayakan peternak lokal
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Distribusi ke pelosok minim qurban
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Program keluarga: edukatif & bermakna
              </li>
            </ul>
          </div>

          {/* Optional highlight / carousel */}
          <div className="relative">
            {/* Kalau tidak punya ProgramCarousel, kamu bisa ganti dengan gambar banner sendiri */}
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
              <ProgramCarousel />
            </div>

            {/* Partner strip */}
            <div className="mt-6">
              <div className="text-center text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Official Partner
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
        </div>
      </section>

      {/* IMPACT METRICS */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat title="Ekor Sapi (2026 target)" value="6" />
          <Stat title="Pequrban (on going)" value="42" />
          <Stat title="Keluarga Penerima Manfaat" value="330" />
          <Stat title="Beneficiary" value="960" />
        </div>
      </section>

      {/* ALUR PROGRAM */}
      <section id="alur" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Alur Program</h2>
            <p className="mt-3 text-gray-700">
              Mulai dari registrasi, setoran awal, pendampingan rutin, sampai penyaluran qurban—semuanya terdokumentasi
              dan bisa kamu pantau di dashboard personal.
            </p>
            <ul className="mt-6 space-y-3 text-gray-800">
              <Bullet>Registrasi akun & isi data personal</Bullet>
              <Bullet>Setoran awal Rp300.000 untuk mengaktifkan fitur</Bullet>
              <Bullet>Program <i>self-saving</i> + pendampingan (webinar, reminder, financial check-up)</Bullet>
              <Bullet>Transfer pelunasan menjelang Idul Adha</Bullet>
              <Bullet>Penyaluran qurban ke titik prioritas + laporan lengkap</Bullet>
            </ul>
            <div className="mt-6 flex gap-3">
              <button onClick={goRegister} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                Ikut Program Sekarang
              </button>
              <a href="https://www.canva.com/design/DAGsuVd4S-w/bBNeQlSNit_mrtaKmW0sQw/edit" target="_blank" rel="noopener noreferrer"
                 className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50">
                Lihat Laporan
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Image
              src="/landing/flow.jpg"
              alt="Alur Program Qurban Berdampak 2026"
              width={1280}
              height={720}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* THEORY OF CHANGE */}
      <section id="toc" className="bg-gray-50 py-16 lg:py-20 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Image
              src="/landing/toc.jpg"
              alt="Theory of Change Qurban Berdampak"
              width={1280}
              height={720}
              className="w-full h-auto"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Didesain untuk Dampak</h2>
            <p className="mt-3 text-gray-700">
              Program ini dibangun dengan pendekatan <b>Theory of Change</b> agar perubahan sosial–ekonomi yang dihasilkan
              bisa diukur di lokasi implementasi.
            </p>
            <ul className="mt-6 space-y-3 text-gray-800">
              <Bullet>Distribusi daging ke wilayah minim qurban</Bullet>
              <Bullet>Peningkatan literasi keuangan keluarga penerima manfaat</Bullet>
              <Bullet>Kurangi ketergantungan pada tengkulak & bantuan</Bullet>
              <Bullet>Tambahan modal usaha kecil & akses harga bakalan yang lebih baik</Bullet>
            </ul>
            <div className="mt-6">
              <button onClick={goRegister} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                Mulai Jadi Pequrban
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT PREVIEW */}
      <section id="preview" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Project Preview 2026</h2>
              <p className="mt-3 text-gray-700">
                Target implementasi di provinsi Gorontalo. Fokus pada masjid pedesaan minim qurban dan keluarga petani/pekerja
                tani. Klik lokasi pada poster untuk melihat titik implementasi.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Chip>6 Ekor Sapi</Chip>
                <Chip>42 Pequrban</Chip>
                <Chip>330 Keluarga</Chip>
                <Chip>960 Beneficiary</Chip>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={goRegister} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow">
                  Daftar Sekarang
                </button>
                <button onClick={goLogin} className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50">
                  Masuk Akun
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Image
                src="/landing/preview.jpg"
                alt="Preview Implementasi Qurban Berdampak"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
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

      {/* FOOTER */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Qurban Berdampak • Transparan • Berdaya • Bermakna
      </footer>

      {/* Sticky CTA (mobile) */}
      <div className="fixed bottom-4 inset-x-4 md:hidden">
        <div className="bg-white shadow-lg rounded-2xl p-3 border border-gray-100 flex items-center justify-between">
          <div className="text-sm font-semibold">Mulai jadi pequrban hari ini</div>
          <button
            onClick={goRegister}
            className="ml-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            Daftar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ——— Small presentational components ——— */

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
      <div className="text-3xl font-extrabold text-emerald-700">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{title}</div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
      <span>{children}</span>
    </li>
  );
}

function Chip({ children }) {
  return (
    <span className="px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-100">
      {children}
    </span>
  );
}
