'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Navigation, Check } from 'lucide-react';
import { fetchProvinsi, fetchKabKota } from '@/services/shalatApi';

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentProvinsi: string;
  currentKabKota: string;
  onSelectCity: (provinsi: string, kabkota: string) => void;
  onDetectGps: () => void;
  isDetectingGps?: boolean;
}

export default function CityPickerModal({
  visible,
  onClose,
  currentProvinsi,
  currentKabKota,
  onSelectCity,
  onDetectGps,
  isDetectingGps = false,
}: CityPickerModalProps) {
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [kabKotaList, setKabKotaList] = useState<string[]>([]);
  const [selectedProv, setSelectedProv] = useState<string>(currentProvinsi);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedProv(currentProvinsi);
      loadProvinsi();
    }
  }, [visible, currentProvinsi]);

  useEffect(() => {
    if (selectedProv) {
      loadKabKota(selectedProv);
    }
  }, [selectedProv]);

  const loadProvinsi = async () => {
    const list = await fetchProvinsi();
    setProvinsiList(list);
  };

  const loadKabKota = async (prov: string) => {
    setLoading(true);
    const list = await fetchKabKota(prov);
    setKabKotaList(list);
    setLoading(false);
  };

  if (!visible) return null;

  const filteredCities = kabKotaList.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#FAF6EE] rounded-[28px] shadow-2xl border border-[#E8DECD] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DECD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B4931]/10 flex items-center justify-center text-[#1B4931]">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B4931]">
                Pilih Kota Jadwal Sholat
              </h3>
              <p className="text-xs text-[#6B6258]">
                Tersedia 517 Kab/Kota di Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B6258] hover:text-[#1B4931] border border-[#E8DECD]"
          >
            <X size={16} />
          </button>
        </div>

        {/* GPS Auto Detect CTA */}
        <div className="p-4 pb-2">
          <button
            onClick={onDetectGps}
            disabled={isDetectingGps}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1B4931] text-white flex items-center justify-center gap-2 font-semibold text-xs shadow-md hover:bg-[#143828] active:scale-98 transition cursor-pointer"
          >
            <Navigation size={14} className={isDetectingGps ? 'animate-spin' : ''} />
            <span>
              {isDetectingGps
                ? 'Mendeteksi Lokasi GPS...'
                : 'Deteksi Otomatis Lokasi Saya (GPS)'}
            </span>
          </button>
        </div>

        {/* Province Selector */}
        <div className="px-4 py-2">
          <label className="text-[11px] font-bold text-[#6B6258] uppercase tracking-wider block mb-1">
            Pilih Provinsi
          </label>
          <select
            value={selectedProv}
            onChange={(e) => {
              setSelectedProv(e.target.value);
              setSearchQuery('');
            }}
            className="w-full bg-white border border-[#E8DECD] rounded-xl px-3 py-2 text-sm text-[#2C2621] font-medium outline-hidden focus:border-[#1B4931]"
          >
            {provinsiList.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* City Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9286]"
            />
            <input
              type="text"
              placeholder={`Cari kota di ${selectedProv}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E8DECD] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] outline-hidden focus:border-[#1B4931]"
            />
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {loading ? (
            <div className="text-center py-8 text-xs text-[#6B6258]">
              Memuat daftar kota...
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#6B6258]">
              Kota tidak ditemukan.
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected =
                city.toLowerCase() === currentKabKota.toLowerCase();
              return (
                <button
                  key={city}
                  onClick={() => {
                    onSelectCity(selectedProv, city);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4931] text-white font-bold'
                      : 'bg-white hover:bg-[#F3EBDD] text-[#2C2621] border border-[#E8DECD]/50'
                  }`}
                >
                  <span>{city}</span>
                  {isSelected && <Check size={16} />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
