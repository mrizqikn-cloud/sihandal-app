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

function getDaftarInputTahap(tahap: number) {
  switch (tahap) {
    case 1:
      return [
        { key: 'file_ba_pleno', label: 'BA Pleno Persetujuan' },
        { key: 'file_surat', label: 'Surat Permohonan Hibah' },
        { key: 'file_tor', label: 'Proposal Hibah' },
        { key: 'file_rab', label: 'RAB Hibah' }
      ];
    case 2:
      return [
        { key: 'file_surat', label: 'Surat Konsultasi Rencana Penerimaan' },
        { key: 'file_rab', label: 'RAB Hibah sesuai nilai sepakat Pemda' },
        { key: 'file_tor', label: 'Data Pegawai & BMN Eksisting' },
        { key: 'file_ba_pleno', label: 'BA/Surat Penetapan/Perda Pemda' }
      ];
    case 3:
      return [
        { key: 'file_surat', label: 'Surat Permohonan Ijin Prinsip' },
        { key: 'file_tor', label: 'Rencana Kerja & TOR/KAK per RO' },
        { key: 'file_rab', label: 'RAB Hibah' },
        { key: 'file_ba_pleno', label: 'HPS/Hasil Survei, Data Pegawai & BMN' }
      ];
    case 4:
      return [
        { key: 'file_surat', label: 'Surat Permohonan & Draf NPHD' },
        { key: 'file_rab', label: 'RAB Lampiran NPHD' },
        { key: 'file_tor', label: 'Surat Ijin Prinsip' }
      ];
    case 5:
      return [
        { key: 'file_surat', label: 'Surat Permohonan Register Hibah' },
        { key: 'file_tor', label: 'Ringkasan Hibah & NPHD Dilegalisir' },
        { key: 'file_rab', label: 'RAB yang Dilegalisir' }
      ];
    case 6:
      return [
        { key: 'file_surat', label: 'Surat Permohonan Pembuatan Rekening' },
        { key: 'file_ba_pleno', label: 'BA Pleno Penetapan Bank' },
        { key: 'file_tor', label: 'Nomor Register Hibah' }
      ];
    case 7:
      return [
        { key: 'file_surat', label: 'Surat Permohonan Pencairan & NPHD' },
        { key: 'file_rab', label: 'RAB & Pakta Integritas / SPTJM' },
        { key: 'file_tor', label: 'Surat Keterangan Bank & Fotokopi KTP KPA' }
      ];
    case 8:
      return [
        { key: 'file_surat', label: 'Surat Permohonan Revisi DIPA' },
        { key: 'file_rab', label: 'NPHD & RAB Dilegalisir' },
        { key: 'file_tor', label: 'Ringkasan, Register Hibah & Izin Rekening' }
      ];
    case 9:
      return [
        { key: 'file_rab', label: 'RAB & TOR/KAK' },
        { key: 'file_tor', label: 'Kalender Kegiatan & Dokumen Pengadaan' }
      ];
    case 10:
      return [
        { key: 'file_surat', label: 'DRPP (Daftar Rincian Penggunaan Dana)' },
        { key: 'file_tor', label: 'SPP, SP2HL, SP4HL' },
        { key: 'file_rab', label: 'Bukti Setor/Transfer Sisa Hibah' }
      ];
    case 11:
      return [
        { key: 'file_surat', label: 'Surat Laporan Penggunaan Hibah' },
        { key: 'file_tor', label: 'Karwas Penggunaan Hibah, SPHL, SP3HL' },
        { key: 'file_rab', label: 'Bukti Pengembalian Sisa Hibah' }
      ];
    default:
      return [
        { key: 'file_surat', label: 'Dokumen Pendukung' }
      ];
  }
}

export default function VerifikatorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeReq, setActiveReq] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeMenu, setActiveMenu] = useState<'verifikasi' | 'monitoring'>('verifikasi');

  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [alasanRevisi, setAlasanRevisi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error mengambil data usulan:", error);
      alert("Gagal mengambil data usulan. Pesan error: " + error.message);
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

  const salinTautan = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    alert('Tautan berhasil disalin ke clipboard!');
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoloskan = async () => {
    if (!activeReq) return;
    const konfirmasi = window.confirm(`Apakah Anda yakin ingin meloloskan usulan ini ke Tahap ${activeReq.tahap_sekarang + 1}?`);
    if (!konfirmasi) return;

    setIsSubmitting(true);
    try {
      const nextTahap = activeReq.tahap_sekarang + 1;
      const isSelesai = nextTahap > 11;
      
      const fieldTahapIni = getDaftarInputTahap(activeReq.tahap_sekarang);
      const historiBaru: any = { tahap: activeReq.tahap_sekarang, timestamp: new Date().toISOString() };
      
      fieldTahapIni.forEach(field => {
        if (activeReq[field.key]) {
          historiBaru[field.key] = activeReq[field.key];
        }
      });

      const riwayatLama = activeReq.riwayat_berkas || [];
      const riwayatBaru = [...riwayatLama, historiBaru];
      
      const { error } = await supabase.from('hibah_requests')
        .update({
          tahap_sekarang: isSelesai ? 11 : nextTahap,
          status_tahap: isSelesai ? 'Selesai' : 'Perlu Usulan', 
          alasan_penolakan: null,
          riwayat_berkas: riwayatBaru,
          file_ba_pleno: null,
          file_surat: null,
          file_tor: null,
          file_rab: null
        })
        .eq('id', activeReq.id);

      if (error) throw error;

      alert(isSelesai ? 'Seluruh tahapan hibah telah selesai!' : `Berkas diloloskan! Histori Tahap ${activeReq.tahap_sekarang} tersimpan. Kab/Kota kini dapat mengunggah syarat Tahap ${nextTahap}.`);
      setActiveReq(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKirimRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq || !alasanRevisi.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hibah_requests')
        .update({
          status_tahap: 'Ditolak',
          alasan_penolakan: alasanRevisi
        })
        .eq('id', activeReq.id);

      if (error) throw error;

      alert('Permintaan revisi berhasil dikirim ke Kab/Kota.');
      setIsRevisiModalOpen(false);
      setAlasanRevisi('');
      setActiveReq(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal mengirim revisi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Ruang Kerja Verifikator...</div>;

  return (
    <div className="flex h-screen bg-[#f4f7fb] font-sans overflow-hidden selection:bg-emerald-100">
      
      <aside className="w-64 bg-[#141b2d] text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0f1422]">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white mr-3 shadow-sm">V</div>
          <span className="font-bold text-white text-lg tracking-wide">SIHANDAL PROV</span>
        </div>
        
        <div className="px-4 mt-6 mb-2">
          <div className="bg-[#1e2638] rounded-xl p-4 border border-[#2a3449] shadow-inner">
            <div className="flex items-center mb-3 pb-3 border-b border-[#2a3449]">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {profile?.full_name?.charAt(0) || 'V'}
              </div>
              <div className="ml-3 truncate">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider border border-emerald-500/30">
                  Verifikator Prov
                </span>
              </div>
            </div>
            <div className="font-bold text-white text-sm mb-0.5 truncate">{profile?.full_name}</div>
            <div className="text-[11px] text-emerald-400 font-medium mb-1 truncate">{profile?.asal_instansi || 'Bawaslu Provinsi Jawa Barat'}</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-2">Menu Kendali</div>
          
          <button 
            onClick={() => { setActiveMenu('verifikasi'); setActiveReq(null); }}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors shadow-sm mb-2 ${
              activeMenu === 'verifikasi' ? 'bg-emerald-600 text-white' : 'hover:bg-[#1e2638] text-slate-400'
            }`}
          >
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="text-sm font-semibold">Verifikasi Usulan</span>
          </button>

          <button 
            onClick={() => { setActiveMenu('monitoring'); setActiveReq(null); }}
            className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors shadow-sm ${
              activeMenu === 'monitoring' ? 'bg-blue-600 text-white' : 'hover:bg-[#1e2638] text-slate-400'
            }`}
          >
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-sm font-semibold">Monitoring Riwayat</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0 shadow-sm">
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <span>Panel Provinsi</span><span className="mx-2">/</span>
            <span className="text-slate-800">
              {activeMenu === 'verifikasi' ? 'Verifikasi Usulan Bawaslu Kabupaten/Kota' : 'Monitoring Riwayat & Histori Berkas'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-hidden p-6 relative flex gap-6">
          
          <div className="w-1/3 flex flex-col bg-transparent">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-slate-900">
                {activeMenu === 'verifikasi' ? 'Daftar Usulan Masuk' : 'Daftar Kab/Kota'}
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Pilih Bawaslu Kabupaten/Kota di bawah ini untuk melihat {activeMenu === 'verifikasi' ? 'berkas berjalan.' : 'rekam jejak historinya.'}
              </p>
            </div>
            
            <div className="text-xs font-bold text-slate-400 mb-3 tracking-wider">DAFTAR PENGAJU ({requests.length})</div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  onClick={() => setActiveReq(req)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border shadow-sm relative overflow-hidden ${
                    activeReq?.id === req.id 
                      ? 'bg-[#1a2235] border-[#2a3449] text-white shadow-md' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-800'
                  }`}
                >
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                    req.status_tahap === 'Diproses' ? 'bg-amber-400 animate-pulse' : 
                    req.status_tahap === 'Perlu Usulan' ? 'bg-slate-300' : 
                    req.status_tahap === 'Ditolak' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></div>

                  <h3 className={`font-bold text-sm pr-6 ${activeReq?.id === req.id ? 'text-white' : 'text-slate-800'}`}>
                    {req.profiles?.asal_instansi || 'Bawaslu Kabupaten/Kota'}
                  </h3>
                  <p className={`text-[11px] mt-1 ${activeReq?.id === req.id ? 'text-slate-400' : 'text-slate-500'}`}>PIC: {req.profiles?.full_name}</p>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      activeReq?.id === req.id ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Posisi: Tahap {req.tahap_sekarang}
                    </span>
                    
                    {req.status_tahap === 'Diproses' && (
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/20">Perlu Verifikasi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-16">
            {!activeReq ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p>Pilih salah satu usulan di panel kiri untuk {activeMenu === 'verifikasi' ? 'melakukan verifikasi tahap berjalan.' : 'melihat detail riwayat tahap sebelumnya.'}</p>
              </div>
            ) : activeMenu === 'verifikasi' ? (
              
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Verifikasi: {activeReq.profiles?.asal_instansi}</h2>
                    <p className="text-xs text-slate-500 mt-1">Diajukan oleh: <span className="font-semibold text-slate-700">{activeReq.profiles?.full_name}</span></p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    activeReq.status_tahap === 'Diproses' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    activeReq.status_tahap === 'Perlu Usulan' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    Status: {activeReq.status_tahap}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">TAHAP SAAT INI</div>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Tahap {activeReq.tahap_sekarang} / 11</span>
                    </div>
                    <div className="font-bold text-slate-800 text-base">{TAHAPAN_HIBAH[activeReq.tahap_sekarang - 1]}</div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">DOKUMEN YANG HARUS DIPERIKSA (TAHAP {activeReq.tahap_sekarang})</div>
                  <div className="space-y-3">
                    {getDaftarInputTahap(activeReq.tahap_sekarang).map((field, index) => {
                      const link = activeReq[field.key];
                      return (
                        <div key={field.key} className="flex items-center bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700">{field.label}</div>
                            {link ? (
                              <a href={link} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline truncate block mt-0.5">{link}</a>
                            ) : (
                              <div className="text-[11px] text-rose-500 italic mt-0.5">Tautan belum dilampirkan</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">Pembaruan Terakhir: {activeReq.created_at ? new Date(activeReq.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                  
                  {activeReq.status_tahap === 'Diproses' ? (
                    <div className="flex gap-3">
                      <button onClick={() => setIsRevisiModalOpen(true)} disabled={isSubmitting} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">Minta Revisi</button>
                      <button onClick={handleLoloskan} disabled={isSubmitting} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50">Loloskan ke Tahap Berikutnya</button>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-400 italic">
                      {activeReq.status_tahap === 'Perlu Usulan' ? 'Menunggu pengunggahan berkas oleh Kab/Kota...' : 'Telah direvisi, menunggu perbaikan...'}
                    </div>
                  )}
                </div>
              </>
              
            ) : (
              
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Riwayat Berkas: {activeReq.profiles?.asal_instansi}</h2>
                    <p className="text-xs text-slate-500 mt-1">Kegiatan: <span className="font-semibold text-slate-700">{activeReq.nama_kegiatan}</span></p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar relative">
                  
                  <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-200 z-0"></div>

                  <div className="space-y-6 relative z-10">
                    {activeReq.riwayat_berkas && activeReq.riwayat_berkas.length > 0 ? (
                      activeReq.riwayat_berkas.map((histori: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex flex-shrink-0 items-center justify-center z-10">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <div className="flex-1 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                              <div>
                                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Tahap {histori.tahap} Selesai</div>
                                <div className="text-sm font-bold text-slate-800">{TAHAPAN_HIBAH[histori.tahap - 1]}</div>
                              </div>
                              
                              {histori.timestamp && (
                                <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                  {formatTimestamp(histori.timestamp)}
                                </span>
                              )}
                            </div>

                            <ul className="space-y-2.5">
                              {getDaftarInputTahap(histori.tahap).map((field) => (
                                histori[field.key] && (
                                  <li key={field.key} className="flex flex-col">
                                    <span className="text-[10px] font-semibold text-slate-500">{field.label}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <a href={histori[field.key]} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline truncate w-full">
                                        {histori[field.key]}
                                      </a>
                                      <button onClick={() => salinTautan(histori[field.key])} className="text-slate-400 hover:text-slate-700" title="Salin Tautan">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                      </button>
                                    </div>
                                  </li>
                                )
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-400 italic">Belum ada histori tahap sebelumnya yang diselesaikan.</p>
                      </div>
                    )}

                    <div className="flex gap-4 opacity-80">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-400 flex flex-shrink-0 items-center justify-center z-10">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1 bg-white p-4 border border-blue-200 border-dashed rounded-xl">
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Tahap Saat Ini (Tahap {activeReq.tahap_sekarang})</div>
                        <div className="text-sm font-bold text-slate-800">{TAHAPAN_HIBAH[activeReq.tahap_sekarang - 1]}</div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Tahap ini sedang berjalan dan {activeReq.status_tahap === 'Diproses' ? 'menunggu verifikasi Anda di menu Verifikasi Usulan.' : 'menunggu kelengkapan dokumen dari Kab/Kota.'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {isRevisiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">Tolak & Minta Revisi Berkas</h3>
                <button onClick={() => setIsRevisiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form onSubmit={handleKirimRevisi} className="p-5">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Alasan Penolakan / Catatan Revisi <span className="text-rose-500">*</span></label>
                  <textarea required value={alasanRevisi} onChange={(e) => setAlasanRevisi(e.target.value)} placeholder="Contoh: Tautan RAB tidak bisa dibuka (perlu akses)..." rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-xs resize-none"></textarea>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsRevisiModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg text-xs hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-600 text-white font-bold py-2.5 rounded-lg text-xs hover:bg-rose-700 transition-all shadow-md disabled:opacity-50">Kirim Revisi</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}