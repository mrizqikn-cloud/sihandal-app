'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const TAHAPAN_HIBAH = [
  "Pengajuan Permohonan Hibah",
  "Konsultasi Rencana Penerimaan",
  "Pengajuan Ijin Prinsip",
  "Penandatanganan NPHD",
  "Pengajuan Register Hibah",
  "Pembuatan Rekening RPDHL/RPDH",
  "Permohonan Pencairan",
  "Revisi DIPA",
  "Pelaksanaan Anggaran",
  "Pengajuan SP2HL & SP4HL",
  "Pertanggungjawaban & Pelaporan"
];

// Helper untuk format tanggal Indonesia yang rapi
function formatTanggal(isoString: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function PimpinanDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedKabKota, setSelectedKabKota] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    if (profileData && profileData.role === 'user') {
      return router.push('/dashboard');
    }

    const { data: requestData, error } = await supabase
      .from('hibah_requests')
      .select('*, profiles(full_name, asal_instansi)')
      .order('tahap_sekarang', { ascending: false });
      
    if (error) {
      console.error("Error mengambil data usulan:", error);
    } else if (requestData) {
      setRequests(requestData);
    }
    
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openDetail = (req: any) => {
    setSelectedKabKota(req);
    setIsModalOpen(true);
  };

  const totalRequests = requests.length;
  const selesaiCount = requests.filter(r => r.status_tahap === 'Selesai' || r.tahap_sekarang > 11).length;
  const onProgressCount = totalRequests - selesaiCount;

  const countPerTahap = Array(11).fill(0);
  requests.forEach(req => {
    const tahap = req.tahap_sekarang > 11 ? 11 : req.tahap_sekarang;
    if (tahap >= 1 && tahap <= 11) {
      countPerTahap[tahap - 1]++;
    }
  });

  const maxCount = Math.max(...countPerTahap, 1);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Dashboard Pimpinan...</div>;

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans overflow-hidden selection:bg-indigo-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1121] text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#070b15]">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white mr-3 shadow-sm">P</div>
          <span className="font-bold text-white text-lg tracking-wide">EKSEKUTIF PROV</span>
        </div>
        
        <div className="px-4 mt-6 mb-4">
          <div className="bg-[#151c2e] rounded-xl p-4 border border-[#232d45] shadow-inner">
            <div className="flex items-center mb-3 pb-3 border-b border-[#232d45]">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {profile?.full_name?.charAt(0) || 'P'}
              </div>
              <div className="ml-3 truncate">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider border border-indigo-500/30">
                  Pimpinan
                </span>
              </div>
            </div>
            <div className="font-bold text-white text-sm mb-0.5 truncate">{profile?.full_name || 'User Pimpinan'}</div>
            <div className="text-[11px] text-indigo-300 font-medium mb-1 truncate">{profile?.asal_instansi || 'Bawaslu Provinsi Jawa Barat'}</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-2">Menu Utama</div>
          
          <button className="w-full flex items-center px-3 py-3 rounded-lg transition-colors bg-indigo-600 text-white shadow-md">
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="text-sm font-semibold">Dashboard & Statistik</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span>Panel Pimpinan</span><span className="mx-2">/</span>
            <span className="text-slate-800 font-bold">Ringkasan Progres Hibah Bawaslu Kabupaten/Kota</span>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* WIDGETS RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Total Kab/Kota Mengajukan</div>
                <div className="text-3xl font-black text-slate-800 mt-1">{totalRequests}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Proses Berjalan (Tahap 1-10)</div>
                <div className="text-3xl font-black text-slate-800 mt-1">{onProgressCount}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mr-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">Selesai 100% (Tahap 11)</div>
                <div className="text-3xl font-black text-slate-800 mt-1">{selesaiCount}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* BAGIAN KIRI: GRAFIK PERSENTASE TAHAPAN */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Grafik Sebaran Tahapan</h2>
              <p className="text-xs text-slate-500 mb-6">Distribusi jumlah Bawaslu Kab/Kota di masing-masing tahap saat ini.</p>
              
              <div className="flex-1 space-y-4">
                {TAHAPAN_HIBAH.map((namaTahap, index) => {
                  const count = countPerTahap[index];
                  const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-slate-700 w-3/4 truncate pr-2">
                          <span className="text-slate-400 font-medium mr-1">{index + 1}.</span> {namaTahap}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600">{count} Daerah ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: barWidth + "%" }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BAGIAN KANAN: DAFTAR KAB/KOTA (BISA DIKLIK) */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 mb-1">Status Spesifik Daerah</h2>
                <p className="text-xs text-slate-500">Klik pada nama daerah untuk melihat detail riwayat tahapannya.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {requests.length > 0 ? requests.map((req) => {
                  const progressPercentage = Math.round((req.tahap_sekarang / 11) * 100);
                  return (
                    <div 
                      key={req.id} 
                      onClick={() => openDetail(req)}
                      className="group p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors">
                            {req.profiles?.asal_instansi || 'Bawaslu Kabupaten/Kota'}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">PIC: {req.profiles?.full_name}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                          req.status_tahap === 'Selesai' || req.tahap_sekarang > 11 ? 'bg-emerald-100 text-emerald-700' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {req.status_tahap === 'Selesai' || req.tahap_sekarang > 11 ? 'Tuntas' : `Tahap ${req.tahap_sekarang}`}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${req.status_tahap === 'Selesai' || req.tahap_sekarang > 11 ? 'bg-emerald-500' : 'bg-indigo-400'}`} 
                            style={{ width: (progressPercentage > 100 ? 100 : progressPercentage) + "%" }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{progressPercentage > 100 ? 100 : progressPercentage}%</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Belum ada data pengajuan masuk.</div>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* ========================================================
            MODAL DETAIL TIMELINE KAB/KOTA DENGAN WAKTU/TANGGAL
        ======================================================== */}
        {isModalOpen && selectedKabKota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              
              {/* Header Modal */}
              <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedKabKota.profiles?.asal_instansi}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Progres: <strong className="text-indigo-600">Tahap {selectedKabKota.tahap_sekarang > 11 ? 11 : selectedKabKota.tahap_sekarang} dari 11</strong></span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      selectedKabKota.status_tahap === 'Diproses' ? 'bg-amber-100 text-amber-700' :
                      selectedKabKota.status_tahap === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>Status: {selectedKabKota.status_tahap}</span>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              {/* Body Modal (Timeline) */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white relative">
                
                <div className="absolute left-[39px] md:left-[47px] top-8 bottom-8 w-0.5 bg-slate-100 z-0"></div>

                <div className="space-y-6 relative z-10">
                  {TAHAPAN_HIBAH.map((namaTahap, idx) => {
                    const tahapKe = idx + 1;
                    const isSelesai = tahapKe < selectedKabKota.tahap_sekarang || (tahapKe === 11 && selectedKabKota.tahap_sekarang > 11);
                    const isAktif = tahapKe === selectedKabKota.tahap_sekarang && selectedKabKota.tahap_sekarang <= 11;
                    const isPending = tahapKe > selectedKabKota.tahap_sekarang;

                    // Cari apakah tahap ini ada di riwayat_berkas untuk mengambil timestamp-nya
                    const riwayatItem = selectedKabKota.riwayat_berkas?.find((r: any) => r.tahap === tahapKe);

                    return (
                      <div key={idx} className={`flex gap-4 md:gap-5 transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                        
                        <div className="relative mt-1">
                          {isSelesai ? (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          ) : isAktif ? (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-indigo-500 shadow-sm flex items-center justify-center">
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                            </div>
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center">
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-slate-300 rounded-full"></div>
                            </div>
                          )}
                        </div>

                        <div className={`flex-1 p-4 rounded-xl border ${isAktif ? 'bg-indigo-50/30 border-indigo-200 shadow-sm' : isSelesai ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: isAktif ? '#4f46e5' : isSelesai ? '#10b981' : '#94a3b8' }}>
                              Tahap {tahapKe} {isAktif && '- SEDANG BERJALAN'}
                            </span>
                            
                            {/* MENAMPILKAN WAKTU VERIFIKASI / SELESAI */}
                            {riwayatItem?.timestamp && (
                              <span className="text-[10px] font-medium text-slate-400 mt-0.5 sm:mt-0">
                                🕒 Selesai diverifikasi: {formatTanggal(riwayatItem.timestamp)}
                              </span>
                            )}
                          </div>

                          <div className={`font-bold text-sm md:text-base ${isPending ? 'text-slate-400' : 'text-slate-800'}`}>
                            {namaTahap}
                          </div>
                          
                          {isAktif && selectedKabKota.status_tahap === 'Diproses' && (
                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md inline-block font-medium border border-amber-100">
                              🕒 Menunggu verifikasi dari Admin Provinsi
                            </div>
                          )}
                          {isAktif && selectedKabKota.status_tahap === 'Ditolak' && (
                            <div className="mt-2 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md inline-block font-medium border border-rose-100">
                              ⚠️ Berkas dikembalikan (Revisi)
                            </div>
                          )}
                          {isAktif && selectedKabKota.status_tahap === 'Perlu Usulan' && (
                            <div className="mt-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md inline-block font-medium">
                              Menunggu pengunggahan berkas oleh Kab/Kota
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}