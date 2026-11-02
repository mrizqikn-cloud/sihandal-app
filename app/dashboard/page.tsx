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

const DETAIL_PANDUAN_TAHAP = [
  {
    tahap: 1,
    judul: "Pengajuan Permohonan Hibah",
    aplikasi: "SIPD (Sistem Informasi Pemerintahan Daerah)",
    uraian: "Bawaslu Kabupaten/Kota mengajukan permohonan hibah non-pemilihan kepada Pemerintah Daerah sebagai dukungan pengawasan.",
    dokumen: [
      "BA Pleno persetujuan pengajuan hibah non pemilihan",
      "Surat permohonan hibah non pemilihan",
      "Proposal hibah",
      "RAB (Rencana Anggaran Biaya) hibah"
    ]
  },
  {
    tahap: 2,
    judul: "Konsultasi Rencana Penerimaan Hibah",
    aplikasi: "SRIKANDI (Sistem Informasi Kearsipan Dinamis Terintegrasi)",
    uraian: "Konsultasi rencana penerimaan hibah kepada Bawaslu RI melalui Biro Keuangan dan BMN (paling lambat 31 Agustus).",
    dokumen: [
      "Surat permohonan konsultasi rencana penerimaan hibah",
      "RAB hibah sesuai nilai yang disepakati Pemda",
      "Data pegawai dan data BMN eksisting",
      "BA/Surat Penetapan/Perda dari Pemerintah Daerah"
    ]
  },
  {
    tahap: 3,
    judul: "Pengajuan Ijin Prinsip Penerimaan Hibah",
    aplikasi: "Biro Perencanaan & Inspektorat Wilayah Bawaslu RI",
    uraian: "Pengajuan permohonan ijin prinsip dan pelaksanaan reviu RAB serta dokumen pendukung kepada Bawaslu RI.",
    dokumen: [
      "Surat permohonan ijin prinsip penerimaan hibah",
      "Rencana Kerja & RAB hibah",
      "TOR/KAK per Rincian Output (RO)",
      "HPS / Hasil Survei & Data pegawai/BMN"
    ]
  },
  {
    tahap: 4,
    judul: "Penandatanganan NPHD",
    aplikasi: "Kesbangpol / Pemerintah Daerah",
    uraian: "Penandatanganan Naskah Perjanjian Hibah Daerah (NPHD) oleh pihak berwenang sebagai dasar hukum.",
    dokumen: [
      "Surat Permohonan Penandatanganan & Draf NPHD",
      "RAB Lampiran NPHD",
      "Surat Ijin Prinsip Bawaslu RI"
    ]
  },
  {
    tahap: 5,
    judul: "Pengajuan Register Hibah",
    aplikasi: "SEHATI (Sistem Pengelolaan Hibah Terintegrasi)",
    uraian: "Pengajuan permohonan penerbitan Nomor Register Hibah kepada Kanwil DJPb Provinsi.",
    dokumen: [
      "Surat Permohonan Penerbitan Nomor Register Hibah",
      "Ringkasan Hibah (Formulir Kemenkeu)",
      "NPHD yang dilegalisir",
      "RAB yang dilegalisir (lampiran NPHD)"
    ]
  },
  {
    tahap: 6,
    judul: "Pembuatan Rekening RPDHL/RPDH",
    aplikasi: "KPPN & Bank Pemerintah",
    uraian: "Permohonan pembukaan rekening Rekening Penerimaan Dana Hibah Langsung (RPDHL) atau RPDH dengan izin KPPN.",
    dokumen: [
      "BA Pleno penetapan Bank Penampungan",
      "Surat Permohonan Pembuatan Rekening RPDHL/RPDH",
      "Nomor Register Hibah"
    ]
  },
  {
    tahap: 7,
    judul: "Permohonan Pencairan",
    aplikasi: "BPKAD / Kesbangpol Pemda",
    uraian: "Pengajuan pencairan anggaran hibah kepada Pemerintah Daerah agar langsung masuk ke rekening RPDHL.",
    dokumen: [
      "Surat Permohonan Pencairan hibah non pemilihan",
      "NPHD dan RAB",
      "Pakta Integritas / Surat Pernyataan Tanggung Jawab",
      "Surat Keterangan Bank (Rekening Aktif) & Fotokopi KTP KPA"
    ]
  },
  {
    tahap: 8,
    judul: "Revisi DIPA",
    aplikasi: "SAKTI & Kanwil DJPb",
    uraian: "Pengajuan usulan revisi DIPA untuk menganggarkan hibah non-pemilihan (paling lambat 2 bulan setelah dana diterima).",
    dokumen: [
      "Surat Permohonan Revisi DIPA",
      "NPHD dan RAB yang dilegalisir",
      "Ringkasan Hibah & Surat Register Hibah",
      "Surat Izin Pembukaan Rekening dari KPPN"
    ]
  },
  {
    tahap: 9,
    judul: "Pelaksanaan Anggaran",
    aplikasi: "SAKTI (Penatausahaan Belanja & Pajak)",
    uraian: "Melaksanakan kegiatan sesuai NPHD, DIPA, TOR/KAK, serta melakukan pungut setor pajak.",
    dokumen: [
      "RAB & TOR / Kerangka Acuan Kerja (KAK)",
      "Kalender Kegiatan pelaksanaan hibah",
      "Dokumen Pengadaan / SPK / SPJ"
    ]
  },
  {
    tahap: 10,
    judul: "Pengajuan SP2HL dan SP4HL",
    aplikasi: "SAKTI ke KPPN Mitra Kerja",
    uraian: "Pengajuan pengesahan penggunaan hibah (SP2HL) sekurang-kurangnya sekali dalam 2 bulan.",
    dokumen: [
      "DRPP (Daftar Rincian Penggunaan Dana)",
      "SPP (Surat Permintaan Pembayaran)",
      "Formulir SP2HL dan SP4HL",
      "Bukti setor/transfer pengembalian sisa hibah"
    ]
  },
  {
    tahap: 11,
    judul: "Pertanggungjawaban dan Pelaporan",
    aplikasi: "SAKTI & Pelaporan Bawaslu RI / Pemda",
    uraian: "Penyusunan dan penyampaian laporan penggunaan hibah paling lambat 10 Januari tahun anggaran berikutnya.",
    dokumen: [
      "Surat Laporan Penggunaan Hibah",
      "Karwas Penggunaan Hibah (Pagu & Realisasi)",
      "SPHL dan SP3HL",
      "Bukti Pengembalian Sisa Hibah (jika ada)"
    ]
  }
];

const getDaftarInputTahap = (tahap: number) => {
  switch (tahap) {
    case 1:
      return [
        { key: 'file_ba_pleno', label: 'Tautan GDrive BA Pleno Persetujuan' },
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Hibah' },
        { key: 'file_tor', label: 'Tautan GDrive Proposal Hibah' },
        { key: 'file_rab', label: 'Tautan GDrive RAB Hibah' }
      ];
    case 2:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Konsultasi Rencana Penerimaan' },
        { key: 'file_rab', label: 'Tautan GDrive RAB Hibah sesuai nilai sepakat Pemda' },
        { key: 'file_tor', label: 'Tautan GDrive Data Pegawai & BMN Eksisting (bila ada)' },
        { key: 'file_ba_pleno', label: 'Tautan GDrive BA/Surat Penetapan/Perda/Info Pemda' }
      ];
    case 3:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Ijin Prinsip' },
        { key: 'file_tor', label: 'Tautan GDrive Rencana Kerja & TOR/KAK per RO' },
        { key: 'file_rab', label: 'Tautan GDrive RAB Hibah' },
        { key: 'file_ba_pleno', label: 'Tautan GDrive HPS/Hasil Survei, Data Pegawai & BMN' }
      ];
    case 4:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan & Draf NPHD' },
        { key: 'file_rab', label: 'Tautan GDrive RAB Lampiran NPHD' },
        { key: 'file_tor', label: 'Tautan GDrive Surat Ijin Prinsip' }
      ];
    case 5:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Register Hibah' },
        { key: 'file_tor', label: 'Tautan GDrive Ringkasan Hibah & NPHD Dilegalisir' },
        { key: 'file_rab', label: 'Tautan GDrive RAB yang Dilegalisir' }
      ];
    case 6:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Pembuatan Rekening' },
        { key: 'file_ba_pleno', label: 'Tautan GDrive BA Pleno Penetapan Bank' },
        { key: 'file_tor', label: 'Tautan GDrive Nomor Register Hibah' }
      ];
    case 7:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Pencairan & NPHD' },
        { key: 'file_rab', label: 'Tautan GDrive RAB & Pakta Integritas / SPTJM' },
        { key: 'file_tor', label: 'Tautan GDrive Surat Keterangan Bank & Fotokopi KTP KPA' }
      ];
    case 8:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Permohonan Revisi DIPA' },
        { key: 'file_rab', label: 'Tautan GDrive NPHD & RAB Dilegalisir' },
        { key: 'file_tor', label: 'Tautan GDrive Ringkasan, Register Hibah & Izin Rekening' }
      ];
    case 9:
      return [
        { key: 'file_rab', label: 'Tautan GDrive RAB & TOR/KAK' },
        { key: 'file_tor', label: 'Tautan GDrive Kalender Kegiatan & Dokumen Pengadaan' }
      ];
    case 10:
      return [
        { key: 'file_surat', label: 'Tautan GDrive DRPP (Daftar Rincian Penggunaan Dana)' },
        { key: 'file_tor', label: 'Tautan GDrive SPP, SP2HL, SP4HL' },
        { key: 'file_rab', label: 'Tautan GDrive Bukti Setor/Transfer Sisa Hibah' }
      ];
    case 11:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Surat Laporan Penggunaan Hibah' },
        { key: 'file_tor', label: 'Tautan GDrive Karwas Penggunaan Hibah, SPHL, SP3HL' },
        { key: 'file_rab', label: 'Tautan GDrive Bukti Pengembalian Sisa Hibah' }
      ];
    default:
      return [
        { key: 'file_surat', label: 'Tautan GDrive Dokumen Pendukung Tahap Ini' }
      ];
  }
};

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'proses' | 'monitoring' | 'panduan'>('proses');
  
  const [formData, setFormData] = useState({
    nama_kegiatan: '', 
    tujuan_hibah: '', 
    nilai_rab: '',
    file_ba_pleno: '',
    file_surat: '',
    file_rab: '',
    file_tor: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    if (profileData && (profileData.role === 'verifikator' || profileData.role === 'admin')) {
      return router.push('/verifikator');
    }

    if (profileData) {
      const { data: requestData } = await supabase
        .from('hibah_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (requestData) setRequests(requestData);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openModalBaru = () => {
    setFormData({ nama_kegiatan: '', tujuan_hibah: '', nilai_rab: '', file_ba_pleno: '', file_surat: '', file_rab: '', file_tor: '' });
    setIsModalOpen(true);
  };

  const openActionModal = (req: any) => {
    setActiveReq(req);
    setFormData({
      nama_kegiatan: req.nama_kegiatan,
      tujuan_hibah: req.tujuan_hibah,
      nilai_rab: req.nilai_rab,
      file_ba_pleno: req.file_ba_pleno || '',
      file_surat: req.file_surat || '',
      file_rab: req.file_rab || '',
      file_tor: req.file_tor || ''
    });
    setIsActionModalOpen(true);
  };

  const handleSubmitPermohonan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNilai = formData.nilai_rab.replace(/[^0-9]/g, '');
    const numericRAB = parseFloat(cleanedNilai);

    if (isNaN(numericRAB) || numericRAB <= 0) {
      alert('Estimasi Nilai RAB harus berupa angka yang valid (contoh: 150000000)');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hibah_requests').insert({
        user_id: profile.id,
        nama_kegiatan: formData.nama_kegiatan,
        tujuan_hibah: formData.tujuan_hibah,
        nilai_rab: numericRAB,
        tahap_sekarang: 1, 
        status_tahap: 'Diproses',
        file_ba_pleno: formData.file_ba_pleno,
        file_surat: formData.file_surat,
        file_rab: formData.file_rab,
        file_tor: formData.file_tor
      });

      if (error) throw error;
      
      alert('Permohonan Tahap 1 berhasil diajukan dan sedang diverifikasi oleh Provinsi!');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(`Gagal mengajukan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBerkasTahap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hibah_requests')
        .update({
          status_tahap: 'Diproses',
          alasan_penolakan: null,
          file_ba_pleno: formData.file_ba_pleno,
          file_surat: formData.file_surat,
          file_rab: formData.file_rab,
          file_tor: formData.file_tor
        })
        .eq('id', activeReq.id);

      if (error) throw error;

      alert(`Dokumen Tahap ${activeReq.tahap_sekarang} berhasil dikirim ke Provinsi!`);
      setIsActionModalOpen(false);
      setActiveReq(null);
      fetchData();
    } catch (err: any) {
      alert('Gagal mengirim berkas: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUsulan = async (id: string, judul: string) => {
    const konfirmasi = window.confirm(`PERINGATAN!\nAnda yakin ingin membatalkan/menghapus permohonan "${judul}"?`);
    if(!konfirmasi) return;

    try {
      const { error } = await supabase.from('hibah_requests').delete().eq('id', id);
      if (error) throw error;
      
      alert(`Usulan "${judul}" berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Ruang Kerja...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden selection:bg-blue-100">
      
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white mr-3 shadow-sm">S</div>
          <span className="font-bold text-white text-lg tracking-wide">SIHANDAL</span>
        </div>
        
        <div className="px-4 mt-6 mb-2">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-inner">
            <div className="flex items-center mb-3 pb-3 border-b border-slate-700">
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 truncate">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider">
                  Pengaju Kab/Kota
                </span>
              </div>
            </div>
            <div className="font-medium text-white text-sm mb-1 truncate">{profile?.full_name}</div>
            <div className="text-xs text-blue-400 font-medium mb-3 truncate">{profile?.asal_instansi}</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">Menu Navigasi</div>
          
          <button onClick={() => setActiveMenu('proses')} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${activeMenu === 'proses' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Usulan Hibah
          </button>
          
          <button onClick={() => setActiveMenu('monitoring')} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${activeMenu === 'monitoring' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Monitoring Usulan
          </button>

          <button onClick={() => setActiveMenu('panduan')} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${activeMenu === 'panduan' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253"></path></svg>
            Panduan 11 Tahap
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center text-sm text-slate-500">
            <span>Dashboard</span><span className="mx-2">/</span>
            <span className="font-medium text-slate-800">
              {activeMenu === 'proses' ? 'Usulan Hibah' : activeMenu === 'monitoring' ? 'Monitoring Usulan' : 'Panduan 11 Tahap'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {activeMenu === 'proses' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Usulan Hibah Non-Pemilihan</h1>
                  <p className="text-slate-500 mt-1">Kelola tahapan, perbarui tautan berkas GDrive, dan ajukan ke Bawaslu Provinsi.</p>
                </div>
                <button onClick={openModalBaru} className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Ajukan Hibah Baru (Tahap 1)
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {requests.length === 0 ? (
                  <div className="p-16 text-center">
                    <h3 className="text-slate-800 font-medium mb-1">Belum ada usulan</h3>
                    <p className="text-slate-500 text-sm">Klik "Ajukan Hibah Baru" untuk memulai Tahap 1 (Pengajuan Permohonan).</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4 font-semibold w-1/3">Identitas Kegiatan & RAB</th>
                          <th className="p-4 font-semibold w-1/4">Posisi Tahap Saat Ini</th>
                          <th className="p-4 font-semibold w-1/5">Status Berkas</th>
                          <th className="p-4 font-semibold text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{req.nama_kegiatan}</div>
                              <div className="text-xs text-slate-500 mt-1">Rp {Number(req.nilai_rab).toLocaleString('id-ID')}</div>
                              
                              <div className="mt-2 flex gap-2 flex-wrap">
                                {req.file_ba_pleno && <a href={req.file_ba_pleno} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 text-blue-600 px-2 py-1 rounded border border-slate-200 hover:bg-blue-50">🔗 Berkas 1</a>}
                                {req.file_surat && <a href={req.file_surat} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 text-blue-600 px-2 py-1 rounded border border-slate-200 hover:bg-blue-50">🔗 Berkas 2</a>}
                                {req.file_rab && <a href={req.file_rab} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 text-blue-600 px-2 py-1 rounded border border-slate-200 hover:bg-blue-50">🔗 Berkas 3</a>}
                                {req.file_tor && <a href={req.file_tor} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-100 text-blue-600 px-2 py-1 rounded border border-slate-200 hover:bg-blue-50">🔗 Berkas 4</a>}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">
                                Tahap {req.tahap_sekarang}: {TAHAPAN_HIBAH[req.tahap_sekarang - 1]}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                req.status_tahap === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                req.status_tahap === 'Ditolak' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {req.status_tahap}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button onClick={() => handleDeleteUsulan(req.id, req.nama_kegiatan)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Hapus Usulan">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>

                                {req.status_tahap === 'Perlu Usulan' && (
                                  <button onClick={() => openActionModal(req)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                                    Kirim ke Provinsi
                                  </button>
                                )}
                                
                                {req.status_tahap === 'Ditolak' && (
                                  <button onClick={() => openActionModal(req)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Usulkan Ulang
                                  </button>
                                )}
                                
                                {req.status_tahap === 'Diproses' && (
                                  <span className="text-[11px] font-medium text-slate-400 italic mr-2 border border-slate-100 px-3 py-1.5 rounded-lg bg-slate-50">Menunggu Provinsi</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'monitoring' && (
            <div className="max-w-full mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Monitoring 11 Tahap Pengelolaan Hibah</h1>
                <p className="text-slate-500 mt-1">Lacak posisi dokumen permohonan hibah Anda beserta timestamp riwayat pergerakannya.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {requests.length === 0 ? (
                  <div className="p-16 text-center">
                    <p className="text-slate-500 text-sm">Belum ada data untuk dimonitoring.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <table className="w-max min-w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4 font-bold sticky left-0 bg-slate-50/90 backdrop-blur z-10 w-72 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200">Identitas Usulan</th>
                          {TAHAPAN_HIBAH.map((namaTahap, i) => (
                            <th key={i} className="p-4 font-semibold text-center w-48 border-r border-slate-100">
                              <span className="block text-[10px] text-blue-600 font-bold mb-0.5">Tahap {i+1}</span>
                              <span className="text-xs text-slate-700">{namaTahap}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-slate-200">
                              <div className="font-bold text-slate-800 mb-1">{req.nama_kegiatan}</div>
                              <div className="text-xs font-medium text-emerald-600">Rp {Number(req.nilai_rab).toLocaleString('id-ID')}</div>
                            </td>

                            {TAHAPAN_HIBAH.map((_, index) => {
                              const stepNumber = index + 1;
                              const isSelesai = stepNumber < req.tahap_sekarang;
                              const isAktif = stepNumber === req.tahap_sekarang;

                              return (
                                <td key={index} className="p-2 border-r border-slate-100 text-center min-w-[160px]">
                                  {isSelesai && (
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-emerald-600 p-2.5">
                                      <div className="flex items-center space-x-1 mb-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-[10px] font-bold">Tuntas</span>
                                      </div>
                                      {/* Menggunakan updated_at atau created_at sebagai waktu tuntas */}
                                      <span className="text-[9px] text-slate-500 font-mono leading-tight">
                                        {formatTimestamp(req.updated_at || req.created_at)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {isAktif && req.status_tahap === 'Perlu Usulan' && (
                                    <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg flex flex-col items-center justify-center p-2.5">
                                      <span className="text-[10px] font-bold">Giliran Anda</span>
                                      <span className="text-[9px] mt-0.5 text-emerald-500">(Kirim Berkas)</span>
                                    </div>
                                  )}

                                  {isAktif && req.status_tahap === 'Diproses' && (
                                    <div className="w-full bg-blue-500 text-white rounded-lg shadow-sm flex flex-col items-center justify-center p-2.5">
                                      <div className="flex items-center space-x-1 mb-1">
                                        <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                        <span className="text-[10px] font-bold">Verifikasi...</span>
                                      </div>
                                      <span className="text-[9px] text-blue-100 font-mono leading-tight">
                                        {formatTimestamp(req.updated_at || req.created_at)}
                                      </span>
                                    </div>
                                  )}

                                  {isAktif && req.status_tahap === 'Ditolak' && (
                                    <div className="w-full bg-rose-500 text-white rounded-lg shadow-sm flex flex-col items-center justify-center group relative cursor-pointer p-2.5">
                                      <div className="flex items-center space-x-1 mb-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        <span className="text-[10px] font-bold">Direvisi</span>
                                      </div>
                                      <span className="text-[9px] text-rose-100 font-mono leading-tight">
                                        {formatTimestamp(req.updated_at)}
                                      </span>
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs p-3 rounded shadow-lg z-50 text-center whitespace-normal">
                                        <span className="block font-bold text-rose-300 mb-1">Catatan Provinsi:</span>
                                        {req.alasan_penolakan || 'Perlu perbaikan berkas.'}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  )}

                                  {stepNumber > req.tahap_sekarang && (
                                    <div className="w-full h-[65px] bg-slate-50/50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-300">
                                      <span className="font-black opacity-30">-</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'panduan' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Panduan & Dokumen 11 Tahap Hibah Non-Pemilihan</h1>
                <p className="text-slate-500 mt-1">Standar operasional dan rincian berkas yang perlu disiapkan oleh Bawaslu Kabupaten/Kota.</p>
              </div>

              <div className="space-y-4">
                {DETAIL_PANDUAN_TAHAP.map((item) => (
                  <div key={item.tahap} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {item.tahap}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base">{item.judul}</h3>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {item.aplikasi}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{item.uraian}</p>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Dokumen / Syarat yang Disiapkan:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {item.dokumen.map((doc, idx) => (
                          <li key={idx} className="flex items-start text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-blue-600 mr-2 font-bold">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Tahap 1: {TAHAPAN_HIBAH[0]}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sesuai Alur Resmi Bawaslu (Aplikasi SIPD)</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitPermohonan} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 mb-2">
                      <span className="font-bold">Informasi:</span> Lengkapi data kegiatan dan usulan permohonan ke Pemda.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul / Nama Kegiatan</label>
                      <input type="text" required value={formData.nama_kegiatan} onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})} placeholder="Cth: Dukungan Pengawasan Pilkada" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Tujuan Hibah</label>
                      <textarea required value={formData.tujuan_hibah} onChange={(e) => setFormData({...formData, tujuan_hibah: e.target.value})} placeholder="Jelaskan tujuan ringkas penggunaan dana" rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimasi Nilai RAB (Rp)</label>
                      <input type="text" required value={formData.nilai_rab} onChange={(e) => setFormData({...formData, nilai_rab: e.target.value})} placeholder="Cth: 150000000" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[380px] overflow-y-auto">
                    <div className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-200">
                      Upload berkas ke <b>Google Drive</b>, ubah akses menjadi <b>"Siapa saja yang memiliki tautan"</b>.
                    </div>
                    
                    {getDaftarInputTahap(1).map((field, idx) => (
                      <div key={field.key}>
                        <label className="block text-[12px] font-bold text-slate-700 mb-1">{idx + 1}. {field.label} <span className="text-rose-500">*</span></label>
                        <input 
                          type="url" 
                          required 
                          placeholder="https://drive.google.com/..." 
                          value={formData[field.key as keyof typeof formData] || ''}
                          onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-all disabled:opacity-70 shadow-md">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan & Kirim Tahap 1'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isActionModalOpen && activeReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {activeReq.status_tahap === 'Ditolak' ? 'Usulan Ulang' : 'Kirim Berkas'} Tahap {activeReq.tahap_sekarang}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{TAHAPAN_HIBAH[activeReq.tahap_sekarang - 1]}</p>
                </div>
                <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleUpdateBerkasTahap} className="p-6 space-y-4">
                {activeReq.status_tahap === 'Ditolak' ? (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <div className="text-xs font-bold text-rose-800 mb-1">Catatan Revisi dari Provinsi:</div>
                    <div className="text-xs text-rose-700 whitespace-pre-wrap">{activeReq.alasan_penolakan || 'Mohon periksa kembali kelengkapan dokumen.'}</div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700">
                    Lengkapi seluruh tautan berkas persyaratan untuk Tahap {activeReq.tahap_sekarang} sebelum dikirim ke Bawaslu Provinsi.
                  </div>
                )}

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 mt-2">
                  {getDaftarInputTahap(activeReq.tahap_sekarang).map((field, idx) => (
                    <div key={field.key}>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1">{idx + 1}. {field.label} <span className="text-rose-500">*</span></label>
                      <input 
                        type="url" 
                        required 
                        placeholder="https://drive.google.com/..." 
                        value={formData[field.key as keyof typeof formData] || ''}
                        onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs" 
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => setIsActionModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-50 transition-all">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-700 transition-all disabled:opacity-70 shadow-md">
                    {isSubmitting ? 'Mengirim...' : (activeReq.status_tahap === 'Ditolak' ? 'Kirim Ulang ke Provinsi' : `Kirim Tahap ${activeReq.tahap_sekarang}`)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}