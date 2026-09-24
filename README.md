# 📖 Al-Qur'an Companion (AI Quran Web)

Aplikasi Al-Qur'an digital modern, elegan, dan komprehensif yang dibangun dengan **Next.js 16**, **Tailwind CSS v4**, dan **Zustand**. Dilengkapi dengan **Tafsir Resmi Kemenag RI**, **Audio Murottal 6 Qari**, **Jadwal Shalat 517 Kota & Notifikasi Adzan Otomatis**, dukungan **PWA (Progressive Web App)**, serta asisten pintar **AI Ustadz (RAG Vector Search)** untuk konsultasi keislaman.

---

## ✨ Fitur Utama

### 1. 📜 Al-Qur'an Digital 114 Surah (30 Juz)
* **Teks Arab Berharakat** yang jelas dan nyaman dibaca dengan standar font mushaf Kemenag/LPMQ.
* **Transliterasi Latin & Terjemahan** Bahasa Indonesia resmi Kementerian Agama RI.
* **Fitur Pencarian Cerdas:** Cari surah berdasarkan nama, arti, atau nomor urut surah.
* **Navigasi Cepat:** Filter Makkiyyah/Madaniyyah, lompat nomor ayat, dan penanda ayat terakhir dibaca (*Last Read*).

### 2. 📚 Tafsir Lengkap Kemenag RI
* Tafsir ringkas (Wajiz) dan tafsir tahlili (mendalam) per surah dan per ayat.
* Asbabun nuzul dan konteks historis penurunan surah.

### 3. 🎙️ Audio Murottal & Vinyl Player
* Pemutar audio murottal berkualitas tinggi per ayat atau putar surah secara berkesinambungan (*continuous play*).
* **6 Pilihan Qari Internasional:**
  * Misyari Rasyid Al-Afasy
  * Abdurrahman As-Sudais
  * Abdullah Al-Juhany
  * Abdul Muhsin Al-Qasim
  * Ibrahim Al-Dossari
  * Yasser Al-Dosari
* **Floating Vinyl Player:** Pemutar audio mengambang dengan animasi piringan hitam (*vinyl*), shortcut keyboard (spasi untuk Play/Pause), dan kendali penuh dari halaman mana saja.

### 4. 🕌 Jadwal Shalat, PWA & Sistem Notifikasi Adzan
* **Jadwal Shalat Akurat 517 Kota/Kabupaten** di 34 Provinsi seluruh Indonesia (Kemenag RI).
* **Deteksi Lokasi GPS Otomatis:** Pencocokan cerdas dengan penanganan toleransi kota untuk mencegah galat.
* **Sistem Notifikasi Adzan Mutakhir:**
  * **Global Background Watcher:** Pemantau waktu sholat aktif di setiap halaman aplikasi via `MobileFrame`.
  * **Toleransi Waktu (Grace Window):** Pengecekan cerdas yang mencegah notifikasi terlewat akibat *throttling* atau *sleep mode* browser.
  * **Pemberitahuan Personal:** Menampilkan nama waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya) dan nama kota Anda.
  * **Audio Chime:** Nada pengingat ganda (*harmonic chime*) berbasis Web Audio API tanpa perlu aset audio eksternal.
  * **Uji Coba Notifikasi (Test Notification):** Tombol tes langsung di halaman Shalat dan Pengaturan untuk menguji suara dan *popup* notifikasi.
  * **Pengaturan Fleksibel:** Toggle notifikasi per waktu sholat tersimpan permanen di `localStorage`.
  * **Dukungan Latar Belakang & PWA:** Terintegrasi dengan Service Worker (`public/sw.js`) dan *Periodic Background Sync* untuk perangkat Android/Chromium.
* Teks lengkap **Doa Setelah Mendengar Adzan** (Arab, Latin, dan Terjemahan HR. Al-Bukhari no. 614) dengan tombol salin instan.

### 5. 🤖 AI Ustadz (RAG Vector Search Keislaman)
* Asisten cerdas untuk bertanya seputar Al-Qur'an, fiqih, tafsir, ibadah, dan adab harian.
* **Arsitektur RAG (Retrieval-Augmented Generation):**
  * Pencarian semantik berdasar vektor (Supabase `pgvector` & Google Gemini).
  * Menghubungkan 6.236 ayat Al-Qur'an dan kumpulan Doa Harian terindeks.
  * Jawaban berlandaskan rujukan ayat dan hadits dengan kartu sitasi yang dapat langsung dibuka.

### 6. 🔖 Bookmark & Riwayat Bacaan
* Simpan ayat-ayat favorit ke daftar bookmark pribadi.
* Penyimpanan lokal yang cepat, aman, dan dapat diakses secara offline.

### 7. ⚙️ Pengaturan & Kustomisasi Tampilan
* Pengaturan ukuran font kaligrafi Arab dan teks terjemahan secara dinamis.
* Toggle tampilan latin (transliterasi) dan terjemahan.
* Pengaturan notifikasi per waktu sholat dan pilihan qari default.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
* **Library UI:** [React](https://react.dev/) 19 & [Tailwind CSS](https://tailwindcss.com/) v4
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Database & Vektor:** [Supabase](https://supabase.com/) (`pgvector`, PostgreSQL)
* **Model AI & LLM:** [Google Gemini API](https://ai.google.dev/) & Groq / OpenAI
* **Ikon:** [Lucide React](https://lucide.dev/)
* **PWA & Notifikasi:** Service Worker (`sw.js`), Web App Manifest, dan Web Audio API

---

## 🚀 Memulai (Local Development)

### 1. Kloning Repositori
```bash
git clone https://github.com/dewandaca/ai-quran.git
cd ai-quran-web
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di direktori root proyek dan masukkan konfigurasi berikut:

```env
# Supabase (RAG Vector Search & Embeddings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API (LLM & Embeddings)
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Opsional: OpenAI / Groq Fallback
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_GROQ_API_KEY=your-groq-api-key
```

### 4. Jalankan Server Development
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📦 Skrip yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan local development server Next.js |
| `npm run build` | Melakukan build produksi dan kompilasi TypeScript |
| `npm run start` | Menjalankan aplikasi dari hasil build produksi |
| `npm run lint` | Menjalankan pengecekan kualitas kode dengan ESLint |
| `npm run seed:duas` | Mengindeks dan memasukkan koleksi doa harian ke database vektor Supabase |

---

## 📂 Struktur Direktori Proyek

```text
ai-quran-web/
├── public/                     # Aset publik statis
│   ├── sw.js                   # Service Worker (PWA, Push & Background Sync)
│   ├── favicon.png             # Favicon aplikasi
│   ├── icon.png                # Ikon aplikasi & badge notifikasi
│   └── fonts/                  # Font kaligrafi lokal
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/ai/route.ts     # Endpoint AI Ustadz RAG Vector Search
│   │   ├── app/                # Halaman utama aplikasi
│   │   │   ├── page.tsx        # Beranda (Countdown Shalat, Menu Cepat, Ayat Harian)
│   │   │   ├── quran/          # Daftar 114 Surah Al-Qur'an
│   │   │   ├── surah/[id]/     # Bacaan Ayat, Murottal & Tafsir
│   │   │   ├── shalat/         # Jadwal Shalat, Banner Izin & Uji Notifikasi
│   │   │   ├── ai-chat/        # Antarmuka AI Ustadz Chatbot
│   │   │   ├── bookmarks/      # Halaman Ayat Tersimpan
│   │   │   └── settings/       # Pengaturan Font, Audio Qari & Notifikasi
│   │   ├── manifest.ts         # Web App Manifest (PWA)
│   │   └── layout.tsx          # Root Layout
│   ├── components/             # Komponen UI modular
│   │   ├── audio/              # Floating Vinyl Player & Full Modal Player
│   │   ├── home/               # PrayerHeroCard, QuickMenuGrid, CityPickerModal
│   │   ├── layout/             # MobileFrame (Global Shell & Prayer Watcher)
│   │   └── quran/              # AyahRow, SurahCard, TafsirModal
│   ├── services/               # Integrasi API (quranApi, shalatApi, groundingService)
│   ├── stores/                 # State management Zustand (audio, shalat, settings, chat)
│   └── utils/                  # Utilitas (prayerNotification, audio chimes, helpers)
├── package.json
└── README.md
```

---

## 📜 Sumber Data & Penghargaan

* **Data Al-Qur'an, Tafsir & Jadwal Shalat:** [EQuran.id API](https://equran.id/)
* **Standar Mushaf & Terjemahan:** Kementerian Agama Republik Indonesia (Kemenag RI)
* **Audio Murottal:** EveryAyah Network & EQuran.id Audio CDN

---

## 📄 Lisensi

Proyek ini bersifat sumber terbuka (*open source*) untuk kemaslahatan bersama. Silakan digunakan dan dikembangkan untuk kebaikan umat.