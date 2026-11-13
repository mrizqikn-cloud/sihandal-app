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

export default function VerifikatorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [realisasiList, setRealisasiList] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<any[]>([]);
  const [addendumList, setAddendumList] = useState<any[]>([]);

  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    if (profileData && profileData.role !== 'verifikator' && profileData.role !== 'admin') {
      return router.push('/dashboard');
    }

    const { data: requestData } = await supabase
      .from('hibah_requests')
      .select('*, profiles(full_name, asal_instansi)')
      .order('created_at', { ascending: false });

    if (requestData) {
      setRequests(requestData);
    }
    setIsLoading(false);
  };

  const fetchChildData = async (requestId: string) => {
    const { data: realData } = await supabase.from('realisasi_bulanan').select('*').eq('hibah_request_id', requestId).order('created_at', { ascending: true });
    if (realData) setRealisasiList(realData);

    const { data: transData } = await supabase.from('transaksi_sp2hl_sp4hl').select('*').eq('hibah_request_id', requestId).order('created_at', { ascending: true });
    if (transData) setTransaksiList(transData);

    const { data: addendumData } = await supabase.from('nphd_addendum').select('*').eq('hibah_request_id', requestId).order('created_at', { ascending: true });
    if (addendumData) setAddendumList(addendumData);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openVerifyModal = async (req: any) => {
    setSelectedReq(req);
    await fetchChildData(req.id);
    setAlasanPenolakan(req.alasan_penolakan || '');
    setIsModalOpen(true);
  };

  const handleSetujuAddendum = async (addendumId: string, nominalBaru: number) => {
    const confirm = window.confirm("Apakah Anda yakin menyetujui Addendum ini?\nPagu/Nilai RAB kegiatan ini akan otomatis diperbarui sesuai nominal addendum baru.");
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      await supabase.from('nphd_addendum').update({ status: 'Disetujui' }).eq('id', addendumId);
      
      await supabase.from('hibah_requests').update({ 
        nilai_rab: nominalBaru,
        nominal_revisi_dipa: nominalBaru 
      }).eq('id', selectedReq.id);
      
      alert("Addendum berhasil disetujui! Pagu kegiatan telah diperbarui.");
      fetchData(); 
      fetchChildData(selectedReq.id); 
    } catch (error: any) {
      alert("Gagal menyetujui addendum: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTolakAddendum = async (addendumId: string) => {
    const alasan = window.prompt("Masukkan alasan penolakan addendum ini:");
    if (alasan === null) return;
    
    setIsSubmitting(true);
    try {
      await supabase.from('nphd_addendum').update({ status: 'Ditolak' }).eq('id', addendumId);
      alert("Addendum berhasil ditolak.");
      fetchChildData(selectedReq.id);
    } catch (error: any) {
      alert("Gagal menolak addendum: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetuju = async () => {
    if (!selectedReq) return;

    if (selectedReq.status_tahap !== 'Diproses') {
      const lanjut = window.confirm(`Peringatan: Status tahap ini adalah "${selectedReq.status_tahap}" (Kab/Kota belum mengirim ulang berkas). Apakah Anda tetap ingin menyetujui dan melanjutkan ke tahap berikutnya?`);
      if (!lanjut) return;
    }

    // Jika berada di Tahap 9 atau 10 (Mode Paralel SAKTI), verifikasi keberadaan SP4HL sebelum melompat ke Tahap 11
    if (selectedReq.tahap_sekarang === 9 || selectedReq.tahap_sekarang === 10) {
      const hasSP4HL = transaksiList.some(t => t.tipe === 'SP4HL');
      if (!hasSP4HL) {
        const lanjutSP4HL = window.confirm('⚠️ Peringatan: Dokumen SP4HL (Nihil) belum diinput oleh Kabupaten/Kota. Apakah Anda yakin ingin lanjut ke Tahap 11 tanpa SP4HL?');
        if (!lanjutSP4HL) return;
      }
    }

    // Jika tahap sekarang 9 atau 10, langsung majukan ke tahap 11. Jika tidak, increment +1 biasa.
    const nextTahap = (selectedReq.tahap_sekarang === 9 || selectedReq.tahap_sekarang === 10) ? 11 : (selectedReq.tahap_sekarang < 11 ? selectedReq.tahap_sekarang + 1 : 11);
    const isSelesai = nextTahap > 11 || selectedReq.tahap_sekarang === 11;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hibah_requests').update({
        tahap_sekarang: nextTahap,
        status_tahap: isSelesai ? 'Selesai' : 'Perlu Usulan',
        alasan_penolakan: null
      }).eq('id', selectedReq.id);

      if (error) throw error;

      alert(`Berhasil! Usulan dilanjutkan ke Tahap ${nextTahap}.`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Gagal memproses: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTolak = async () => {
    if (!selectedReq) return;
    if (!alasanPenolakan.trim()) {
      alert('Harap isi alasan penolakan/revisi terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('hibah_requests').update({
        status_tahap: 'Ditolak',
        alasan_penolakan: alasanPenolakan
      }).eq('id', selectedReq.id);

      if (error) throw error;

      alert('Usulan dikembalikan ke Kabupaten/Kota untuk diperbaiki.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Gagal menolak: ' + err.message);
    } finally {
      setIsSubmitting(false);
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

  const renderDetailDataByTahap = (req: any) => {
    const tahap = req.tahap_sekarang;
    switch (tahap) {
      case 1:
        return (
          <div className="space-y-1">
            <div>Nama Kegiatan: <b>{req.nama_kegiatan}</b></div>
            <div>Tujuan Hibah: <b>{req.tujuan_hibah}</b></div>
            <div>Estimasi RAB: <b>Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')}</b></div>
            <div>No. Surat Permohonan Hibah: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-1">
            <div>No. Surat Konsultasi: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>
            <div>RAB Sesuai Kesepakatan: <b>Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')}</b></div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-1">
            <div>Surat Permohonan Izin Prinsip ke Bawaslu RI: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-1">
            <div>Nomor Surat Persetujuan / Izin Prinsip Bawaslu RI: <b>{req.no_surat_izin_prinsip || '-'}</b> (Tgl: {req.tgl_surat_izin_prinsip || '-'})</div>
            <div>Nomor NPHD: <b>{req.nomor_nphd || '-'}</b> (Tgl: {req.tanggal_nphd || '-'})</div>
            <div>Nominal NPHD: <b>Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')}</b></div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-1">
            <div>Nomor Surat Permohonan Register Hibah ke Kanwil DJPb: <b>{req.surat_permohonan_register || '-'}</b></div>
            <div>Tanggal Surat Permohonan: <b>{req.tgl_surat || '-'}</b></div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-1">
            <div>No. Surat Permohonan Pembukaan Rekening ke KPPN: <b>{req.no_surat_permohonan_rekening || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-1">
            <div>No. Surat Persetujuan Rekening KPPN: <b>{req.no_surat_izin_penetapan_rekening || '-'}</b></div>
            <div>Nomor Rekening RPDHL/RPDH Resmi: <b className="text-emerald-700">{req.no_rekening || '-'}</b> (Bank: <span className="uppercase font-bold">{req.nama_bank_padanan || '-'}</span>)</div>
            <div>Nomor Surat Permohonan Pencairan: <b>{req.no_surat_pencairan || '-'}</b></div>
            <div>Nomor SP2D Pemda: <b>{req.nomor_sp2d || '-'}</b></div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-1">
            <div>Nomor Surat Pengajuan Revisi DIPA: <b>{req.no_surat_revisi_dipa || '-'}</b></div>
            <div>Nominal Revisi DIPA (Pagu Awal): <b>Rp {Number(req.nominal_revisi_dipa || req.nilai_rab || 0).toLocaleString('id-ID')}</b></div>
          </div>
        );
      case 9:
      case 10:
        return (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-800">
              ⚡ <b>Mode Paralel SAKTI Aktif:</b> Tahap 9 (Realisasi Bulanan) dan Tahap 10 (SP2HL/SP4HL) berjalan berdampingan.
            </div>
            <div>Pagu DIPA Aktif: <b>Rp {Number(req.nominal_revisi_dipa || req.nilai_rab || 0).toLocaleString('id-ID')}</b></div>
            <div>Total Realisasi Tercatat: <b>Rp {realisasiList.reduce((acc, curr) => acc + Number(curr.nilai_realisasi || 0), 0).toLocaleString('id-ID')}</b></div>
            <div>Total Dokumen SP2HL/SP4HL Tercatat: <b>{transaksiList.length} Dokumen</b></div>
            <div>Status SP4HL: <b className={transaksiList.some(t => t.tipe === 'SP4HL') ? 'text-emerald-600' : 'text-amber-600'}>{transaksiList.some(t => t.tipe === 'SP4HL') ? 'Sudah Diinput (Lengkap)' : 'Belum Diinput (Belum Lengkap)'}</b></div>
          </div>
        );
      case 11:
        return (
          <div className="space-y-1">
            <div>No. Surat Laporan Pertanggungjawaban: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>
          </div>
        );
      default:
        return <div>Belum ada data spesifik.</div>;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Panel Verifikator...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <img 
            src="/logo-sihandal.png" 
            alt="Logo SIHANDAL" 
            className="h-12 md:h-14 w-auto object-contain bg-white px-2.5 py-1.5 rounded-xl shadow-sm" 
          />
        </div>
        
        <div className="px-4 mt-6 mb-2">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-inner">
            <div className="flex items-center mb-3 pb-3 border-b border-slate-700">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.full_name?.charAt(0) || 'V'}
              </div>
              <div className="ml-3 truncate">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider">
                  Verifikator Provinsi
                </span>
              </div>
            </div>
            <div className="font-medium text-white text-sm mb-1 truncate">{profile?.full_name}</div>
            <div className="text-xs text-indigo-400 font-medium mb-3 truncate">Bawaslu Provinsi Jawa Barat</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">Panel Utama</div>
          <div className="w-full flex items-center px-3 py-2.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            Verifikasi Usulan
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center text-sm text-slate-500">
            <span>Panel Verifikator</span><span className="mx-2">/</span>
            <span className="font-medium text-slate-800">Daftar Masuk Usulan Hibah Kabupaten/Kota</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Verifikasi Berkas & Tahapan Hibah</h1>
              <p className="text-slate-500 mt-1">Periksa kelengkapan dokumen, realisasi anggaran, serta transaksi SP2HL/SP4HL dari Bawaslu Kabupaten/Kota.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {requests.length === 0 ? (
                <div className="p-16 text-center text-slate-400">Belum ada usulan masuk dari Kabupaten/Kota.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4 font-semibold">Instansi Pengaju</th>
                        <th className="p-4 font-semibold">Nama Kegiatan</th>
                        <th className="p-4 font-semibold">Posisi Tahap</th>
                        <th className="p-4 font-semibold">Status Berkas</th>
                        <th className="p-4 font-semibold text-right">Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-medium text-slate-800">{req.profiles?.asal_instansi || 'Kab/Kota'}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{req.nama_kegiatan}</div>
                            <div className="text-xs text-slate-500">RAB/Pagu: Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')}</div>
                          </td>
                          <td className="p-4">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100">
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
                            <button onClick={() => openVerifyModal(req)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                              Verifikasi Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {isModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Verifikasi Tahap {selectedReq.tahap_sekarang}: {TAHAPAN_HIBAH[selectedReq.tahap_sekarang - 1]}</h3>
                  <p className="text-xs text-slate-500">{selectedReq.nama_kegiatan} ({selectedReq.profiles?.asal_instansi})</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4 text-xs text-slate-700">
                
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[11px] tracking-wide flex items-center">
                    <svg className="w-4 h-4 mr-1 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Histori & Jejak Audit (Audit Trail):
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Waktu Pengajuan Awal: <b>{formatTimestamp(selectedReq.created_at)}</b></div>
                    <div>Terakhir Diperbarui: <b>{formatTimestamp(selectedReq.updated_at || selectedReq.created_at)}</b></div>
                    <div>Posisi Tahap Aktif: <b>Tahap {selectedReq.tahap_sekarang}</b></div>
                    <div>Status Saat Ini: <b className={selectedReq.status_tahap === 'Ditolak' ? 'text-rose-600' : 'text-blue-600'}>{selectedReq.status_tahap}</b></div>
                  </div>
                  {selectedReq.alasan_penolakan && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-rose-700">
                      ⚠️ <b>Catatan Penolakan/Revisi Sebelumnya:</b> {selectedReq.alasan_penolakan}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">Rincian Data Tahap {selectedReq.tahap_sekarang} ({TAHAPAN_HIBAH[selectedReq.tahap_sekarang - 1]}):</div>
                  {renderDetailDataByTahap(selectedReq)}
                </div>

                {addendumList.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                    <div className="font-bold text-amber-900 uppercase text-[11px]">Riwayat Pengajuan Addendum NPHD ({addendumList.length}):</div>
                    <div className="space-y-2">
                      {addendumList.map((addendum, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-amber-100 flex flex-col space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm text-slate-800">{addendum.nomor_addendum}</div>
                              <div className="text-xs text-slate-500">Tanggal: {addendum.tanggal_addendum}</div>
                              <div className="text-xs font-bold text-emerald-600 mt-1">Nominal Pagu Baru: Rp {Number(addendum.nominal_baru).toLocaleString('id-ID')}</div>
                              <div className="text-xs mt-1">
                                Berkas Addendum: <a href={addendum.file_addendum} target="_blank" className="text-blue-600 underline font-bold">Lihat Dokumen GDrive</a>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                addendum.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                addendum.status === 'Ditolak' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>
                                {addendum.status}
                              </span>
                            </div>
                          </div>

                          {addendum.status === 'Menunggu Verifikasi' && (
                            <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100">
                              <button onClick={() => handleTolakAddendum(addendum.id)} disabled={isSubmitting} className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold py-2 rounded-lg border border-rose-200 transition-colors">
                                Tolak Addendum
                              </button>
                              <button onClick={() => handleSetujuAddendum(addendum.id, addendum.nominal_baru)} disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold py-2 rounded-lg shadow-sm transition-colors">
                                Setujui (Update Pagu)
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedReq.tahap_sekarang === 9 || selectedReq.tahap_sekarang === 10) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* MODUL 1: REALISASI BULANAN */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
                      <div className="font-bold text-blue-900 uppercase text-[11px]">Realisasi Bulanan ({realisasiList.length}):</div>
                      {realisasiList.length === 0 ? (
                        <div className="italic text-slate-400 text-xs">Belum ada input realisasi</div>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {realisasiList.map((r, i) => (
                            <div key={i} className="bg-white p-2 rounded border text-xs flex justify-between">
                              <span><b>{r.bulan}</b>: Rp {Number(r.nilai_realisasi).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MODUL 2: TRANSAKSI SP2HL / SP4HL */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                      <div className="font-bold text-emerald-900 uppercase text-[11px]">Dokumen SP2HL / SP4HL ({transaksiList.length}):</div>
                      {transaksiList.length === 0 ? (
                        <div className="italic text-slate-400 text-xs">Belum ada transaksi SP</div>
                      ) : (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {transaksiList.map((t, i) => (
                            <div key={i} className="bg-white p-2 rounded border text-xs flex justify-between">
                              <span><b>{t.tipe}</b> ({t.nomor_dokumen})</span>
                              <span className="font-bold text-emerald-700">Rp {Number(t.nilai_transaksi).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!transaksiList.some(t => t.tipe === 'SP4HL') && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                          ⚠️ SP4HL belum diinput. Sistem akan meminta konfirmasi jika Anda meloloskan ke Tahap 11.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <label className="block font-bold text-slate-800">Tautan Berkas Pendukung (Google Drive):</label>
                  <div className="space-y-1 font-mono text-[11px]">
                    {selectedReq.file_surat && <div>Berkas Utama: <a href={selectedReq.file_surat} target="_blank" className="text-blue-600 underline truncate block">{selectedReq.file_surat}</a></div>}
                    {selectedReq.file_rab && <div>Berkas RAB/Rincian: <a href={selectedReq.file_rab} target="_blank" className="text-blue-600 underline truncate block">{selectedReq.file_rab}</a></div>}
                    {selectedReq.file_tor && <div>Berkas TOR/Proposal: <a href={selectedReq.file_tor} target="_blank" className="text-blue-600 underline truncate block">{selectedReq.file_tor}</a></div>}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <label className="block font-bold text-slate-800">Catatan / Alasan Penolakan (Jika Berkas Ditolak/Revisi):</label>
                  <textarea rows={2} value={alasanPenolakan} onChange={(e) => setAlasanPenolakan(e.target.value)} placeholder="Tuliskan kekurangan berkas yang harus diperbaiki..." className="w-full p-2.5 border rounded-xl resize-none"></textarea>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button type="button" onClick={handleTolak} disabled={isSubmitting} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-3 rounded-xl transition-colors">
                    Tolak / Minta Revisi
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSetuju} 
                    disabled={isSubmitting} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Setujui & Lanjut Tahap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}