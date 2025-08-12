export const pertanyaanKuisioner = [
  {
    question: "Apakah kamu rutin berqurban?",
    type: "radio",
    options: ["Ya", "Tidak"],
    required: true,
  },
  {
    question: "Apa harapan utama dari Qurban yang kamu lakukan? (cuma bisa pilih satu)",
    type: "radio",
    options: [
      "Menunaikan ibadah Qurban sesuai syariat",
      "Memberikan manfaat langsung ke yang membutuhkan (beneficiary oriented)",
      "Qurban sampai ke wilayah minim bantuan (area oriented)",
      "Bisa jadi sarana mendidik anak dan keluarga (kebutuhan program keluarga)",
      "Ikut andil dalam program sosial yang berdampak (emotional oriented)",
      "Menyucikan harta",
      "Lainnya"
    ],
    required: true,
  },
  {
    question: "Apa yang membuatmu merasa puas setelah berqurban? (pilih maksimal 3)",
    type: "checkbox",
    options: [
      "Prosesnya mudah dan tidak ribet",
      "Ada dokumentasi jelas (foto/video laporan)",
      "Saya tahu profil penerima manfaat dari qurban saya",
      "Qurban saya jadi bagian dari pemberdayaan ekonomi & sosial",
      "Saya & keluarga ikut teredukasi & dapat ilmu baru dari proses Qurban yang diikuti",
      "Ada kejelasan dan transparansi laporan pemotongan/distribusi",
      "Ada dashboard pemantauan progress pribadi",
      "Penyelenggara terpercaya dan responsif",
      "Harga sesuai & tidak memberatkan",
      "Lainnya"
    ],
    max: 3,
    required: true,
  },
  {
    question: "Apa harapan terbesarmu ke program qurban yang kamu ikuti? (Pilih satu atau dua jawaban yang paling penting buatmu)",
    type: "checkbox",
    options: [
      "Memberikan pengalaman qurban yang lebih mendalam",
      "Memberdayakan keluarga petani/peternak dan warga sekitar",
      "Dampak qurban yang disalurkan jelas & terukur",
      "Bisa jadi sarana edukasi keluarga",
      "Kepastian Qurban, karena dicicil & direncanakan jauh-jauh hari",
      "Komunikasi intensif, akrab, & transparan dari panitia",
      "Memiliki dokumentasi & laporan dampak yang meyakinkan",
      "Lainnya"
    ],
    max: 2,
    required: true,
  },
  {
    question: "Siapa yang biasanya mempengaruhi keputusanmu dalam memilih penyelenggara qurban?",
    type: "radio",
    options: [
      "Pasangan (suami / istri)",
      "Keluarga inti (ayah / ibu / mertua)",
      "Ustadz / guru agama",
      "Influencer atau tokoh publik",
      "Teman kantor / lingkungan sosial",
      "Keputusan pribadi"
    ],
    required: true,
  },
  {
    question: "Faktor apa yang paling membuatmu yakin untuk ikut program ini? (boleh pilih lebih dari satu)",
    type: "checkbox",
    options: [
      "Penyelenggaranya",
      "Laporannya",
      "Konsep / Visi programnya",
      "Keunikan program yang berbeda dari program lainnya",
      "Lainnya"
    ],
    required: true,
  },
  {
    question: "Apakah kamu followers dari lembaga kemanusiaan yang mengadakan program Qurban juga?",
    type: "radio",
    options: [
      "Ya, beberapa lembaga besar",
      "Hanya 1 atau 2 lembaga",
      "Tidak terlalu mengikuti, hanya lihat saat Ramadhan / Idul Adha"
    ],
    required: true,
  },
  {
    question: "Apa yang menurutmu paling menarik dari program mereka? (pilih satu atau dua)",
    type: "checkbox",
    options: [
      "Visual promosi mereka bagus dan meyakinkan",
      "Testimoni peserta banyak",
      "Programnya terkesan profesional",
      "Harga kompetitif",
      "Sudah lama berdiri dan dikenal"
    ],
    max: 2,
    required: true,
  },
  {
    question: "Apa kamu pernah mengajak keluarga / teman ikut di program qurban yang kamu ikuti?",
    type: "radio",
    options: [
      "Ya, setiap tahun pasti merekomendasikan ke keluarga",
      "Pernah, tapi tidak rutin",
      "Belum pernah, tapi berencana kalau programnya bagus",
      "Tidak tertarik untuk mengajak / keluarga udah punya rencana sendiri"
    ],
    required: true,
  },
  {
    question: "Jika kamu sering / pernah mengajak, hal apa yang kamu ceritakan ke mereka?",
    type: "checkbox",
    options: [
      "Lembaga & informasi umum",
      "Laporan dan proses distribusi",
      "Fasilitas / fitur programnya",
      "Harga hewan qurbannya",
      "Lokasi distribusi & penerima manfaatnya",
      "Dampak programnya"
    ],
    required: false,
  },
  {
    question: "Dalam 3 tahun terakhir, indikator apa yang kamu pakai dalam memilih program qurban / penyelenggara qurban? (pilih dua)",
    type: "checkbox",
    options: [
      "Harga hewan Qurban",
      "Kejelasan distribusi & program",
      "Dokumentasi dan laporan",
      "Testimoni dan rekomendasi",
      "Kesesuaian syariah"
    ],
    max: 2,
    required: true,
  },
  {
    question: "Apakah kamu punya kekhawatiran tertentu dalam berqurban?",
    type: "checkbox",
    options: [
      "Takut Qurban tidak tersalurkan",
      "Laporan tidak jelas",
      "Tidak tahu siapa penerima manfaat",
      "Hewan tidak sesuai standar",
      "Tidak mengenal siapa yang mengelola",
      "Distribusi tidak adil / tepat sasaran",
      "Harga terlalu mahal / tidak masuk akal",
      "Tidak ada nilai tambah",
      "Tidak ada pengingat / edukasi sama sekali",
      "Lainnya"
    ],
    required: false,
  },
  {
    question: "Apa kamu pernah batal berqurban di tahun-tahun sebelumnya? Mengapa?",
    type: "checkbox",
    options: [
      "Masalah keuangan; uang tidak cukup",
      "Tidak tahu mau daftar di mana",
      "Kurang yakin sama lembaganya",
      "Lupa / tidak sempat / belum berniat",
      "Sengaja menunda untuk qurban di tahun berikutnya"
    ],
    required: false,
  },
  {
    question: "Apa dampak ideal yang ingin kamu capai dari qurban?",
    type: "checkbox",
    options: [
      "Qurban tersalurkan ke yang membutuhkan",
      "Qurban punya dampak sosial & ekonomi",
      "Ada dokumentasi lengkap",
      "Laporan menggambarkan seluruh proses kegiatan",
      "Anak & keluarga dilibatkan",
      "Ada rasa tenang bahwa Qurban sudah tersalurkan",
      "Lainnya"
    ],
    required: true,
  },
  {
    question: "Kalau kamu bisa memilih, ke mana qurbanmu ingin disalurkan?",
    type: "radio",
    options: [
      "Daerah pelosok yang belum terjangkau",
      "Lokasi bencana / rawan pangan",
      "Luar negeri (Palestina, Afrika, Rohingya, dll.)",
      "Komunitas binaan yang memberdayakan masyarakat",
      "Terserah lembaga, yang penting amanah"
    ],
    required: true,
  },
  {
    question: "Apa bentuk laporan dampak / dokumentasi qurban yang kamu sukai?",
    type: "checkbox",
    options: [
      "Video pendek berdampak",
      "Foto dan data penerima manfaat",
      "Infografis dan angka statistik",
      "Cerita personal dari penerima manfaat",
      "Semua diakses di dashboard peserta"
    ],
    required: true,
  },
  {
    question: "Hal apa yang mungkin akan mendorongmu untuk merekomendasikan program ini ke orang lain / membuat konten / story / dlsb tentang program ini?",
    type: "checkbox",
    options: [
      "Laporan dan dokumentasi yang menarik",
      "Program yang melibatkan peserta secara personal",
      "Cerita dampak yang kuat",
      "Support media promosi dari tim",
      "Fitur family-based atau komunitas qurban bersama"
    ],
    required: false,
  },
  {
    question: "Kalau tersedia, apakah kamu tertarik untuk ikut program ini dalam jangka panjang? (+- 3 tahun ke depan)",
    type: "radio",
    options: [
      "Sangat tertarik, bisa rencanakan lebih awal",
      "Tertarik jika ada program tabungan qurban",
      "Mungkin, tergantung kondisi keuangan",
      "Tidak terlalu yakin, ingin fokus tahun ini dulu"
    ],
    required: true,
  }
]