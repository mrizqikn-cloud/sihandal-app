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

export default function AtasanProvinsiDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [realisasiList, setRealisasiList] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    if (profileData && profileData.role !== 'atasan_prov' && profileData.role !== 'admin') {
      return router.push('/dashboard');
    }

    const { data: requestData } = await supabase
      .from('hibah_requests')
      .select('*, profiles(full_name, asal_instansi)')
      .order('created_at', { ascending: false });

    if (requestData) {
      setAllRequests(requestData);
    }
    setIsLoading(false);
  };

  const fetchChildData = async (requestId: string) => {
    const { data: realData } = await supabase.from('realisasi_bulanan').select('*').eq('hibah_request_id', requestId).order('created_at', { ascending: true });
    if (realData) setRealisasiList(realData);

    const { data: transData } = await supabase.from('transaksi_sp2hl_sp4hl').select('*').eq('hibah_request_id', requestId).order('created_at', { ascending: true });
    if (transData) setTransaksiList(transData);
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openDetailModal = (req: any) => {
    setSelectedReq(req);
    fetchChildData(req.id);
    setIsModalOpen(true);
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

  const handleDownloadResume = async (req: any) => {
    const { data: realData } = await supabase.from('realisasi_bulanan').select('*').eq('hibah_request_id', req.id);
    const { data: transData } = await supabase.from('transaksi_sp2hl_sp4hl').select('*').eq('hibah_request_id', req.id);
    
    const totalRealisasi = (realData || []).reduce((acc, curr) => acc + Number(curr.nilai_realisasi || 0), 0);
    const sisaAnggaran = Number(req.nominal_revisi_dipa || req.nilai_rab || 0) - totalRealisasi;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Resume Laporan Resmi - ${req.profiles?.asal_instansi || 'Bawaslu'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #111; line-height: 1.4; background: #fff; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 40px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid #334155; padding-bottom: 15px; margin-bottom: 25px; }
            .header h3 { margin: 0; font-size: 16px; font-weight: bold; }
            .header h2 { margin: 4px 0; font-size: 18px; font-weight: 900; color: #0f172a; }
            .header p { font-size: 11px; color: #475569; margin: 2px 0; }
            .title-sec { text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; color: #0f172a; letter-spacing: 0.5px; }
            .info-table { width: 100%; margin-bottom: 25px; font-size: 13px; }
            .info-table td { padding: 5px 0; vertical-align: top; }
            .content-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .content-table th, .content-table td { border: 1px solid #94a3b8; padding: 8px 12px; font-size: 11px; text-align: left; vertical-align: top; }
            .content-table th { background-color: #f1f5f9; text-align: center; font-weight: bold; color: #334155; }
            .footer-note { margin-top: 30px; font-size: 10px; color: #64748b; text-align: justify; }
            @media print {
              body { padding: 0; background: #fff; }
              .container { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h3>BADAN PENGAWAS PEMILIHAN UMUM</h3>
              <h2>PROVINSI JAWA BARAT</h2>
              <p>Jalan Turangga Nomor 25 Bandung 40264</p>
              <p>Telepon 022-7332604 Email: set.jabar@bawaslu.go.id</p>
              <p>Laman: http://jabar.bawaslu.go.id/</p>
            </div>

            <div class="title-sec">Ringkasan Pengelolaan Hibah Non-Pemilihan</div>

            <table class="info-table">
              <tr>
                <td style="width: 160px;"><b>1. Nama Pemberi Hibah</b></td>
                <td style="width: 10px;">:</td>
                <td>Pemerintah Daerah / Instansi Terkait</td>
              </tr>
              <tr>
                <td><b>2. Nama Kegiatan</b></td>
                <td>:</td>
                <td><b>${req.nama_kegiatan}</b></td>
              </tr>
              <tr>
                <td><b>3. Instansi Pengaju</b></td>
                <td>:</td>
                <td>${req.profiles?.asal_instansi || 'Bawaslu Provinsi Jawa Barat'}</td>
              </tr>
              <tr>
                <td><b>4. Posisi Tahap Saat Ini</b></td>
                <td>:</td>
                <td><b>Tahap ${req.tahap_sekarang} (${TAHAPAN_HIBAH[req.tahap_sekarang - 1]})</b></td>
              </tr>
              <tr>
                <td><b>5. Pagu Awal DIPA</b></td>
                <td>:</td>
                <td><b>Rp ${Number(req.nilai_rab || 0).toLocaleString('id-ID')},-</b></td>
              </tr>
            </table>

            <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #334155;">Rincian Kompilasi Data & Nomor Surat Tiap Tahapan:</div>

            <table class="content-table">
              <thead>
                <tr>
                  <th style="width: 50px;">TAHAP</th>
                  <th style="width: 160px;">NAMA TAHAPAN</th>
                  <th>KOMPILASI RINCIAN DATA & NOMOR SURAT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center; font-weight: bold;">1</td>
                  <td><b>Pengajuan Permohonan Hibah</b></td>
                  <td>No. Surat Permohonan Hibah: ${req.no_surat || '-'} - (Tgl: ${req.tgl_surat || '-'})</td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">2</td>
                  <td><b>Konsultasi Rencana Penerimaan</b></td>
                  <td>No. Surat Konsultasi: ${req.no_surat || '-'} - (Tgl: ${req.tgl_surat || '-'})</td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">3</td>
                  <td><b>Pengajuan Ijin Prinsip</b></td>
                  <td>
                    Surat Permohonan Izin Prinsip: ${req.no_surat || '-'}<br/>
                    Nomor Penetapan Izin Prinsip: ${req.no_surat_izin_prinsip || '-'} - (Tgl: ${req.tgl_surat_izin_prinsip || '-'})
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">4</td>
                  <td><b>Penandatanganan NPHD</b></td>
                  <td>
                    Nomor NPHD: ${req.nomor_nphd || '-'}<br/>
                    Nominal NPHD: <b>Rp ${Number(req.nilai_rab || 0).toLocaleString('id-ID')},-</b><br/>
                    Tanggal NPHD: ${req.tanggal_nphd || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">5</td>
                  <td><b>Pengajuan Register Hibah</b></td>
                  <td>
                    Surat Permohonan Register Hibah: ${req.surat_permohonan_register || '-'}<br/>
                    Surat Penetapan Register Hibah: ${req.surat_penetapan_register || '-'}<br/>
                    Nomor Register Hibah: ${req.nomor_register_hibah || '-'}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">6</td>
                  <td><b>Pembuatan Rekening RPDHL/RPDH</b></td>
                  <td>
                    No. Surat Permohonan Pembukaan Rekening: ${req.no_surat_permohonan_rekening || '-'}<br/>
                    No. Surat Izin Penetapan Rekening: ${req.no_surat_izin_penetapan_rekening || '-'}<br/>
                    Nama Bank Padanan/Penampung: ${req.nama_bank_padanan || '-'} (No. Rek: ${req.no_rekening || '-'})
                    ${req.tahap_sekarang < 6 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">7</td>
                  <td><b>Permohonan Pencairan</b></td>
                  <td>
                    Nomor Surat Permohonan Pencairan: ${req.no_surat_pencairan || '-'}<br/>
                    Nomor SP2D: ${req.nomor_sp2d || '-'}
                    ${req.tahap_sekarang < 7 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">8</td>
                  <td><b>Revisi DIPA</b></td>
                  <td>
                    Nomor Surat Pengajuan Revisi DIPA: ${req.no_surat_revisi_dipa || '-'}<br/>
                    Nominal Revisi DIPA (Pagu Awal): <b>Rp ${Number(req.nominal_revisi_dipa || req.nilai_rab || 0).toLocaleString('id-ID')},-</b>
                    ${req.tahap_sekarang < 8 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">9</td>
                  <td><b>Pelaksanaan Anggaran</b></td>
                  <td>
                    • Pagu Awal DIPA: Rp ${Number(req.nominal_revisi_dipa || req.nilai_rab || 0).toLocaleString('id-ID')},-<br/>
                    • Akumulasi Realisasi s.d. Bulan Berjalan: Rp ${totalRealisasi.toLocaleString('id-ID')},-<br/>
                    • <b>Sisa Anggaran: Rp ${sisaAnggaran.toLocaleString('id-ID')},-</b>
                    ${req.tahap_sekarang < 9 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">10</td>
                  <td><b>Pengajuan SP2HL & SP4HL</b></td>
                  <td>
                    ${transData && transData.length > 0 ? `${transData.length} Dokumen transaksi SP2HL/SP4HL tercatat` : 'Belum ada transaksi SP2HL / SP4HL tercatat'}
                    ${req.tahap_sekarang < 10 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; font-weight: bold;">11</td>
                  <td><b>Pertanggungjawaban & Pelaporan</b></td>
                  <td>
                    No. Surat Laporan Pertanggungjawaban: ${req.no_surat || '-'} - (Tgl: ${req.tgl_surat || '-'})
                    ${req.tahap_sekarang < 11 ? '<br/><span style="color:#64748b; font-style:italic;">Belum mencapai tahap ini</span>' : ''}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer-note">
              Kami menyatakan dengan sesungguhnya bahwa ringkasan naskah perjanjian hibah ini disusun berdasarkan dokumen dan bukti-bukti yang ada pada Pejabat Pembuat Komitmen sebagai dasar pengajuan dan penatausahaan hibah sebagaimana diusulkan dalam rangka mendukung kelancaran pengawasan pemilihan dan kegiatan non-pemilihan Bawaslu.
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const totalUsulan = allRequests.length;
  const tuntasCount = allRequests.filter(r => r.status_tahap === 'Selesai' || r.tahap_sekarang === 11).length;
  const prosesCount = allRequests.filter(r => r.status_tahap === 'Diproses').length;
  const revisiCount = allRequests.filter(r => r.status_tahap === 'Ditolak').length;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Panel Pimpinan Provinsi...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white mr-3 shadow-sm">P</div>
          <span className="font-bold text-white text-lg tracking-wide">SIHANDAL PROV</span>
        </div>
        
        <div className="px-4 mt-6 mb-2">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-inner">
            <div className="flex items-center mb-3 pb-3 border-b border-slate-700">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.full_name?.charAt(0) || 'P'}
              </div>
              <div className="ml-3 truncate">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase tracking-wider">
                  Atasan Provinsi
                </span>
              </div>
            </div>
            <div className="font-medium text-white text-sm mb-1 truncate">{profile?.full_name}</div>
            <div className="text-xs text-purple-400 font-medium mb-3 truncate">Bawaslu Provinsi Jawa Barat</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">Monitoring Lintas Wilayah</div>
          <div className="w-full flex items-center px-3 py-2.5 rounded-lg bg-purple-600 text-white shadow-sm">
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Rekap Kab / Kota
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <div className="flex items-center text-sm text-slate-500">
            <span>Dashboard Pimpinan Provinsi</span><span className="mx-2">/</span>
            <span className="font-medium text-slate-800">Monitoring & Evaluasi Hibah Se-Jawa Barat</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Eksekutif Provinsi</h1>
            <p className="text-slate-500 mt-1">Pantau progress penatausahaan hibah seluruh Kabupaten/Kota. Klik pada baris instansi untuk memeriksa detail tahapan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Usulan Wilayah</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{totalUsulan}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sedang Diproses</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{prosesCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perlu Revisi</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{revisiCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tuntas / Selesai</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{tuntasCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Daftar Progress Hibah Kabupaten / Kota</h2>
              <span className="text-xs text-slate-400">Klik baris untuk membuka rincian tahapan</span>
            </div>

            {allRequests.length === 0 ? (
              <div className="p-16 text-center text-slate-400">Belum ada data usulan masuk dari seluruh wilayah.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">Instansi / Wilayah</th>
                      <th className="p-4 font-semibold">Nama Kegiatan</th>
                      <th className="p-4 font-semibold">Nilai RAB / Pagu</th>
                      <th className="p-4 font-semibold">Posisi Tahap Saat Ini</th>
                      <th className="p-4 font-semibold">Status Berkas</th>
                      <th className="p-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {allRequests.map((req) => (
                      <tr key={req.id} onClick={() => openDetailModal(req)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="p-4 font-bold text-slate-800">{req.profiles?.asal_instansi || 'Kab/Kota'}</td>
                        <td className="p-4 text-slate-600">{req.nama_kegiatan}</td>
                        <td className="p-4 font-medium text-slate-700">Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-100">
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
                          <button onClick={(e) => { e.stopPropagation(); openDetailModal(req); }} className="text-purple-600 hover:text-purple-800 font-semibold text-xs bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 mr-2">
                            Detail
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDownloadResume(req); }} className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            Unduh Resume
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {isModalOpen && selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Detail Lengkap 11 Tahapan - {selectedReq.profiles?.asal_instansi}</h3>
                  <p className="text-xs text-slate-500">Kegiatan: {selectedReq.nama_kegiatan}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4 text-xs text-slate-700">
                <div className="bg-slate-100 p-4 rounded-xl border space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">Jejak Audit & Timestamp:</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>• Waktu Pengajuan Awal: <b>{formatTimestamp(selectedReq.created_at)}</b></div>
                    <div>• Terakhir Diperbarui: <b>{formatTimestamp(selectedReq.updated_at || selectedReq.created_at)}</b></div>
                    <div>• Posisi Tahap Aktif: <b>Tahap {selectedReq.tahap_sekarang}</b></div>
                    <div>• Status Berkas: <b className={selectedReq.status_tahap === 'Ditolak' ? 'text-rose-600' : 'text-blue-600'}>{selectedReq.status_tahap}</b></div>
                  </div>
                  {selectedReq.alasan_penolakan && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-rose-700">
                      ⚠️ <b>Catatan Penolakan/Revisi:</b> {selectedReq.alasan_penolakan}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 uppercase text-[11px]">Progres Keseluruhan 11 Tahapan Hibah:</div>
                  <div className="space-y-2">
                    {TAHAPAN_HIBAH.map((namaTahap, idx) => {
                      const noTahap = idx + 1;
                      const isDone = selectedReq.tahap_sekarang > noTahap || (selectedReq.tahap_sekarang === noTahap && selectedReq.status_tahap === 'Selesai');
                      const isCurrent = selectedReq.tahap_sekarang === noTahap;

                      return (
                        <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                          isDone ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' :
                          isCurrent ? 'bg-purple-50/60 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-600'
                            }`}>
                              {noTahap}
                            </span>
                            <div>
                              <div className="font-bold">{namaTahap}</div>
                              <div className="text-[11px] opacity-80">
                                {isDone ? 'Selesai & Disetujui Verifikator' : isCurrent ? `Sedang Berlangsung (Status: ${selectedReq.status_tahap})` : 'Belum Mencapai Tahap Ini'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={() => handleDownloadResume(selectedReq)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
                    Unduh Resume Laporan Wilayah Ini
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                    Tutup
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