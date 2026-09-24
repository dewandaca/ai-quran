'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Calendar,
  Bell,
  BellOff,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Compass,
  BellRing,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import MobileFrame from '@/components/layout/MobileFrame';
import CityPickerModal from '@/components/home/CityPickerModal';
import { useShalatStore } from '@/stores/useShalatStore';

function getHijriYear(): string {
  const gregorianYear = new Date().getFullYear();
  return `${Math.round((gregorianYear - 622) * (33 / 32))} H`;
}

function getFormattedDate(): string {
  const date = new Date();
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ShalatPage() {
  const {
    provinsi,
    kabkota,
    todaySchedule,
    monthlySchedule,
    nextPrayer,
    notificationSettings,
    permissionStatus,
    isLoading,
    isDetectingLocation,
    loadSchedule,
    detectLocation,
    setCity,
    toggleNotification,
    requestPermission,
    testNotification,
    updateNextPrayer,
  } = useShalatStore();

  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [copiedDoa, setCopiedDoa] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotif(true);
    await testNotification();
    setTimeout(() => {
      setTestingNotif(false);
    }, 2500);
  };

  useEffect(() => {
    loadSchedule();
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const interval = setInterval(() => {
      updateNextPrayer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const prayers = [
    {
      name: 'Imsak',
      time: todaySchedule?.imsak || '--:--',
      icon: Moon,
      hasToggle: false,
    },
    {
      name: 'Subuh',
      time: todaySchedule?.subuh || '--:--',
      icon: Sunrise,
      key: 'subuh' as const,
      hasToggle: true,
    },
    {
      name: 'Terbit',
      time: todaySchedule?.terbit || '--:--',
      icon: Sun,
      hasToggle: false,
    },
    {
      name: 'Dhuha',
      time: todaySchedule?.dhuha || '--:--',
      icon: Sun,
      hasToggle: false,
    },
    {
      name: 'Dzuhur',
      time: todaySchedule?.dzuhur || '--:--',
      icon: Sun,
      key: 'dzuhur' as const,
      hasToggle: true,
    },
    {
      name: 'Ashar',
      time: todaySchedule?.ashar || '--:--',
      icon: CloudSun,
      key: 'ashar' as const,
      hasToggle: true,
    },
    {
      name: 'Maghrib',
      time: todaySchedule?.maghrib || '--:--',
      icon: Sunset,
      key: 'maghrib' as const,
      hasToggle: true,
    },
    {
      name: 'Isya',
      time: todaySchedule?.isya || '--:--',
      icon: Moon,
      key: 'isya' as const,
      hasToggle: true,
    },
  ];

  const activeName = nextPrayer?.name || 'Dzuhur';

  const handleCopyDoa = () => {
    const text = `Doa Setelah Adzan:\n\nاللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ\n\nLatin:\nAllahumma rabba hadzihid-da'watit-tammah, wash-sholatil-qa'imah, ati muhammadanil-wasilata wal-fadhilah, wab'atshu maqamam-mahmudanil-ladzi wa'adtah.\n\nArtinya:\n"Ya Allah, Pemilik seruan yang sempurna ini dan sholat yang didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta bangkitkanlah beliau ke tempat terpuji yang telah Engkau janjikan."\n(HR. Al-Bukhari no. 614)`;
    navigator.clipboard.writeText(text);
    setCopiedDoa(true);
    setTimeout(() => setCopiedDoa(false), 2000);
  };

  return (
    <MobileFrame title="Jadwal Sholat Indonesia">
      {/* Top Banner Date and Location Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white/80 p-4 rounded-3xl border border-[#E8DECD] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold">
            <Compass size={22} />
          </div>
          <div>
            <span className="text-[10px] text-[#6B6258] font-bold uppercase tracking-wider block">
              Wilayah Waktu Indonesia
            </span>
            <h2 className="text-base font-bold text-[#1B4931]">
              {kabkota}, {provinsi}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6258] bg-[#FAF6EE] px-3.5 py-2 rounded-2xl border border-[#E8DECD]">
            <Calendar size={15} className="text-[#1B4931]" />
            <span>{getFormattedDate()}</span>
            <span className="text-[#C5A059]">•</span>
            <span className="text-[#1B4931] font-bold">{getHijriYear()}</span>
          </div>

          <button
            onClick={() => detectLocation()}
            disabled={isDetectingLocation}
            className="p-2.5 rounded-2xl bg-white text-[#C5A059] border border-[#E8DECD] hover:bg-[#FAF6EE] cursor-pointer shadow-xs transition"
            title="Deteksi Lokasi GPS Otomatis"
          >
            <Navigation
              size={16}
              className={isDetectingLocation ? 'animate-spin' : ''}
            />
          </button>
        </div>
      </div>

      {/* Notification Permission & Testing Banner */}
      {!notifBannerDismissed && permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
        <div className={`mb-6 p-4 rounded-3xl border transition shadow-xs ${
          permissionStatus === 'denied'
            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
            : 'bg-emerald-50/90 border-[#1B4931]/20 text-[#1B4931]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                permissionStatus === 'denied'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-[#1B4931]/10 text-[#1B4931]'
              }`}>
                {permissionStatus === 'denied' ? <AlertTriangle size={20} /> : <BellRing size={20} />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">
                  {permissionStatus === 'denied'
                    ? 'Izin Notifikasi Diblokir oleh Browser'
                    : 'Aktifkan Notifikasi & Suara Adzan'}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
                  {permissionStatus === 'denied'
                    ? 'Agar pengingat shalat muncul, buka ikon gembok/setelan browser di samping URL dan ubah Notifikasi menjadi Izinkan (Allow).'
                    : 'Dapatkan pengingat otomatis tepat waktu saat masuk jadwal shalat, meskipun web diminimalkan atau di latar belakang.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {permissionStatus !== 'denied' && (
                <button
                  onClick={() => requestPermission()}
                  className="px-4 py-2 rounded-xl bg-[#1B4931] hover:bg-[#143828] text-white text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
                >
                  Izinkan Sekarang
                </button>
              )}
              <button
                onClick={() => setNotifBannerDismissed(true)}
                className="px-2.5 py-2 rounded-xl text-xs font-medium opacity-60 hover:opacity-100 cursor-pointer transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Bar if permission is granted */}
      {permissionStatus === 'granted' && (
        <div className="mb-6 px-4 py-2.5 rounded-2xl bg-white/70 border border-[#E8DECD] shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1B4931]">
              Notifikasi Aktif
            </span>
            <span className="text-[11px] text-[#6B6258] hidden sm:inline">
              (Pengingat sholat &amp; suara adzan siap)
            </span>
          </div>
          <button
            onClick={handleTestNotification}
            disabled={testingNotif}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#FAF6EE]/80 text-[#1B4931] border border-[#E8DECD] text-xs font-bold cursor-pointer transition active:scale-95"
            title="Kirim notifikasi uji coba ke browser ini"
          >
            <Volume2 size={13} className="text-[#C5A059]" />
            <span>{testingNotif ? 'Mengirim Uji Coba...' : 'Uji Coba Notifikasi'}</span>
          </button>
        </div>
      )}

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Bento 1: Hero Prayer Countdown Card (md:col-span-5) */}
        <div className="md:col-span-5 flex flex-col">
          <div className="bg-linear-to-br from-[#1B4332] via-[#143828] to-[#0D241A] text-white rounded-3xl p-6 shadow-xl border border-[#C5A059]/40 flex-1 flex flex-col justify-between relative overflow-hidden group">
            {/* Ambient decorative glow */}
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-[#C5A059]/10 pointer-events-none" />

            <div>
              {/* Location Badge & Change City */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#C5A059]" />
                  <span className="text-xs font-semibold text-white/90 truncate max-w-[140px]">
                    {kabkota}
                  </span>
                </div>
                <button
                  onClick={() => setCityModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold border border-white/10 transition cursor-pointer"
                >
                  Ganti Kota
                </button>
              </div>

              {/* Big Countdown */}
              <div className="text-center py-4 relative z-10">
                <span className="text-xs text-[#F5E6CC] font-bold uppercase tracking-wider block mb-1">
                  Waktu Sholat Berikutnya
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                  {activeName.toUpperCase()}
                </h3>
                <div className="text-4xl sm:text-5xl font-mono font-black text-[#C5A059] tracking-tight my-2">
                  {nextPrayer?.time || '--:--'}
                </div>
                {nextPrayer?.displayText && (
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#C5A059]/20 text-[#F5E6CC] text-xs font-bold border border-[#C5A059]/30 shadow-xs">
                    {nextPrayer.displayText}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Reminder */}
            <div className="pt-4 border-t border-white/10 text-center relative z-10">
              <p className="text-[11px] text-white/70 italic">
                &ldquo;Tunaikan sholat tepat waktu saat seruan adzan berkumandang.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Bento 2: 8 Waktu Sholat Hari Ini (md:col-span-7) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DECD] shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#1B4931]">
              Waktu Sholat Hari Ini
            </h3>
            <p className="text-xs text-[#6B6258]">
              Jadwal resmi Kementerian Agama RI
            </p>
          </div>

          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-[#1B4931] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#6B6258]">Memuat jadwal sholat...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {prayers.map((prayer) => {
                const Icon = prayer.icon;
                const isActive = prayer.name.toLowerCase() === activeName.toLowerCase();
                const isNotifEnabled = prayer.key ? notificationSettings[prayer.key] : false;

                return (
                  <div
                    key={prayer.name}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border transition shadow-xs ${
                      isActive
                        ? 'bg-[#1B4931] text-white border-[#1B4931] shadow-md ring-2 ring-[#C5A059]/40'
                        : 'bg-[#FAF6EE] text-[#2C2621] border-[#E8DECD] hover:border-[#1B4931]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold ${
                          isActive ? 'text-white' : 'text-[#6B6258]'
                        }`}
                      >
                        {prayer.name}
                      </span>
                      {prayer.hasToggle && prayer.key && (
                        <button
                          onClick={() => toggleNotification(prayer.key!)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            isActive
                              ? 'text-white hover:bg-white/20'
                              : isNotifEnabled
                              ? 'text-[#1B4931] hover:bg-white'
                              : 'text-[#9C9286] hover:bg-white'
                          }`}
                          title={isNotifEnabled ? 'Notifikasi Aktif' : 'Notifikasi Mati'}
                        >
                          {isNotifEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                        </button>
                      )}
                    </div>

                    <div className="my-1">
                      <span
                        className={`text-lg sm:text-xl font-mono font-bold block ${
                          isActive ? 'text-[#C5A059]' : 'text-[#1B4931]'
                        }`}
                      >
                        {prayer.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <Icon
                        size={15}
                        className={isActive ? 'text-[#C5A059]' : 'text-[#9C9286]'}
                      />
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase bg-[#C5A059]/20 text-[#F5E6CC] px-1.5 py-0.5 rounded">
                          Berikutnya
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bento 3: Doa Setelah Adzan (md:col-span-6) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DECD] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1B4931]">
                    Doa Setelah Mendengar Adzan
                  </h4>
                  <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider">
                    Waktu Mustajab Berdoa
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyDoa}
                className="text-xs font-semibold text-[#1B4931] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer transition"
                title="Salin Doa"
              >
                {copiedDoa ? (
                  <>
                    <Check size={13} className="text-green-600" />
                    <span className="text-green-600 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Arabic */}
            <p
              dir="rtl"
              className="font-arabic text-xl sm:text-2xl text-right text-[#181411] leading-loose py-2 select-all"
            >
              اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ
            </p>

            {/* Latin */}
            <p className="text-xs italic text-[#6B6258] mt-2 leading-relaxed">
              Allahumma rabba hadzihid-da&apos;watit-tammah, wash-sholatil-qa&apos;imah, ati muhammadanil-wasilata wal-fadhilah, wab&apos;atshu maqamam-mahmudanil-ladzi wa&apos;adtah.
            </p>

            {/* Translation */}
            <p className="text-xs text-[#2C2621] font-medium leading-relaxed mt-2 bg-[#FAF6EE] p-3 rounded-2xl border border-[#E8DECD]/60">
              &ldquo;Ya Allah, Pemilik seruan yang sempurna ini dan sholat yang didirikan, berikanlah kepada Nabi Muhammad wasilah dan keutamaan, serta bangkitkanlah beliau ke tempat terpuji yang telah Engkau janjikan.&rdquo;
            </p>
          </div>

          <div className="pt-3 border-t border-[#E8DECD]/60 mt-3 text-right">
            <span className="text-[10px] text-[#9C9286] font-semibold">
              (HR. Al-Bukhari no. 614)
            </span>
          </div>
        </div>

        {/* Bento 4: Keutamaan Sholat Awal Waktu (md:col-span-6) */}
        <div className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DECD] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center font-bold">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1B4931]">
                  Keutamaan Sholat di Awal Waktu
                </h4>
                <span className="text-[10px] text-[#6B6258] font-semibold">
                  Amalan Paling Dicintai Allah SWT
                </span>
              </div>
            </div>

            {/* Hadits Quote Box */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E8DECD] space-y-2">
              <p className="text-xs text-[#2C2621] leading-relaxed font-medium">
                Dari Abdullah bin Mas&apos;ud radhiyallahu &apos;anhu, beliau bertanya kepada Rasulullah ﷺ:
              </p>
              <p className="text-xs font-bold text-[#1B4931] italic">
                &ldquo;Wahai Rasulullah, amalan apakah yang paling dicintai oleh Allah SWT?&rdquo;
              </p>
              <p className="text-xs text-[#2C2621] leading-relaxed">
                Rasulullah ﷺ menjawab:
              </p>
              <p className="text-sm font-bold text-[#1B4931] bg-white p-2.5 rounded-xl border border-[#E8DECD] shadow-xs text-center">
                &ldquo;Sholat tepat pada waktunya.&rdquo;
              </p>
              <span className="text-[10px] text-[#9C9286] font-semibold block text-right">
                (HR. Al-Bukhari no. 527 &amp; Muslim no. 85)
              </span>
            </div>

            {/* Quranic Verse Reference */}
            <div className="mt-3 p-3 bg-white rounded-2xl border border-[#E8DECD]">
              <p className="text-xs text-[#6B6258] leading-relaxed">
                <span className="font-bold text-[#1B4931]">QS. An-Nisa [4]: 103: </span>
                &ldquo;Sesungguhnya sholat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman.&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8DECD]/60 mt-3 flex items-center justify-between text-[11px] text-[#6B6258]">
            <span>Pahala berlipat ganda</span>
            <span className="font-bold text-[#1B4931]">Doa Mustajab</span>
          </div>
        </div>

        {/* Bento 5: Jadwal 1 Bulan Penuh (md:col-span-12) */}
        <div className="md:col-span-12 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DECD] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1B4931]/10 text-[#1B4931] flex items-center justify-center font-bold">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1B4931]">
                  Jadwal Sholat 1 Bulan Penuh - {kabkota}
                </h3>
                <p className="text-xs text-[#6B6258]">
                  Waktu sholat lengkap untuk bulan berjalan
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#6B6258]">
              Memuat kalender bulanan...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#E8DECD]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6EE] text-[#6B6258] border-b border-[#E8DECD]">
                  <tr>
                    <th className="p-3 font-bold">Tanggal</th>
                    <th className="p-3 font-bold">Imsak</th>
                    <th className="p-3 font-bold">Subuh</th>
                    <th className="p-3 font-bold">Terbit</th>
                    <th className="p-3 font-bold">Dhuha</th>
                    <th className="p-3 font-bold">Dzuhur</th>
                    <th className="p-3 font-bold">Ashar</th>
                    <th className="p-3 font-bold">Maghrib</th>
                    <th className="p-3 font-bold">Isya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DECD]/60 font-mono">
                  {monthlySchedule.map((item) => {
                    const isToday = item.tanggal === new Date().getDate();
                    return (
                      <tr
                        key={item.tanggal}
                        className={`transition ${
                          isToday
                            ? 'bg-[#1B4931] text-white font-bold'
                            : 'hover:bg-[#FAF6EE]'
                        }`}
                      >
                        <td className={`p-3 font-sans font-bold ${isToday ? 'text-white' : 'text-[#1B4931]'}`}>
                          {item.tanggal} {isToday ? '★ Hari Ini' : ''}
                        </td>
                        <td className="p-3">{item.imsak}</td>
                        <td className="p-3">{item.subuh}</td>
                        <td className="p-3">{item.terbit}</td>
                        <td className="p-3">{item.dhuha}</td>
                        <td className="p-3">{item.dzuhur}</td>
                        <td className="p-3">{item.ashar}</td>
                        <td className="p-3">{item.maghrib}</td>
                        <td className="p-3">{item.isya}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* City Picker Modal */}
      <CityPickerModal
        visible={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        currentProvinsi={provinsi}
        currentKabKota={kabkota}
        onSelectCity={(prov, city) => setCity(prov, city)}
        onDetectGps={() => detectLocation()}
        isDetectingGps={isDetectingLocation}
      />
    </MobileFrame>
  );
}
