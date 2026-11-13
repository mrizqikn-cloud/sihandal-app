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
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan permohonan hibah non pemilihan kepada Pemerintah Daerah sebagai bentuk dukungan pelaksanaan tugas dan fungsi pengawasan pemilu di daerah.",
    dokumen: [
      "BA Pleno persetujuan pengajuan hibah non pemilihan",
      "Surat permohonan hibah non pemilihan",
      "Proposal hibah",
      "RAB (Rencana Anggaran Biaya) hibah"
    ]
  },
  {
    tahap: 2,
    judul: "Konsultasi Rencana Penerimaan Hibah Non Pemilihan",
    aplikasi: "SRIKANDI & Satria Hibah",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota menyampaikan surat permohonan konsultasi rencana penerimaan hibah non pemilihan kepada Sekretaris Jenderal Bawaslu RI melalui Biro Keuangan dan BMN paling lambat tanggal 31 Agustus tahun anggaran berjalan.",
    dokumen: [
      "Surat permohonan konsultasi rencana penerimaan hibah",
      "RAB hibah sesuai nilai yang disepakati Pemerintah Daerah",
      "Data pegawai dan data BMN eksisting (apabila ada pengadaan belanja modal)",
      "BA/Surat Penetapan/Perda/informasi dari Pemda perihal rencana alokasi hibah",
      "TOR/KAK atau gambaran penggunaan dana"
    ]
  },
  {
    tahap: 3,
    judul: "Tahap Permohonan Persetujuan Penerimaan Hibah",
    aplikasi: "Biro Keuangan & BMN / Bawaslu RI",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan surat permohonan persetujuan penerimaan hibah non pemilihan kepada Ketua Bawaslu RI, disertai reviu RAB dan dokumen pendukung.",
    dokumen: [
      "Surat permohonan persetujuan penerimaan dana hibah",
      "Perubahan Rencana Kerja",
      "RAB yang ditandatangani oleh KPA/PPK non satker",
      "TOR/KAK per RO yang ditandatangani oleh KPA/PPK non satker",
      "SPTJM yang ditandatangani KPA/PPK non satker",
      "HPS / Hasil Survei",
      "Data pegawai dan data BMN eksisting"
    ]
  },
  {
    tahap: 4,
    judul: "Tahap Penandatanganan NPHD",
    aplikasi: "Kesbangpol / Pemerintah Daerah",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota melakukan penandatanganan Naskah Perjanjian Hibah Daerah (NPHD) dengan Pemerintah Daerah sebagai dasar hukum penerimaan hibah non pemilihan.",
    dokumen: [
      "Surat Permohonan Penandatanganan NPHD dan Draf NPHD",
      "RAB Lampiran NPHD",
      "Surat Ijin Prinsip Bawaslu RI"
    ]
  },
  {
    tahap: 5,
    judul: "Tahap Pengajuan Register Hibah",
    aplikasi: "SEHATI (Sistem Pengelolaan Hibah Terintegrasi)",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan permohonan penerbitan Nomor Register Hibah kepada Kanwil DJPb Provinsi sebagai dasar pencantuman penerimaan hibah non pemilihan dalam DIPA.",
    dokumen: [
      "Surat Permohonan Penerbitan Nomor Register Hibah",
      "Ringkasan Hibah (formulir sesuai ketentuan Kemenkeu)",
      "NPHD yang dilegalisir (pada halaman tanda tangan)",
      "RAB yang dilegalisir (menjadi lampiran NPHD)"
    ]
  },
  {
    tahap: 6,
    judul: "Tahap Pembukaan Rekening RPDHL/RPDH",
    aplikasi: "KPPN & Bank Pemerintah",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan permohonan pembukaan rekening RPDHL/RPDH melalui Bawaslu RI untuk menampung dana hibah non pemilihan sesuai ketentuan yang berlaku.",
    dokumen: [
      "BA Pleno penetapan Bank Penampungan Dana Hibah",
      "Surat permohonan pembukaan rekening RPDHL/RPDH",
      "Surat penerbitan nomor register hibah dari Kanwil DJPb Provinsi"
    ]
  },
  {
    tahap: 7,
    judul: "Tahap Permohonan Pencairan",
    aplikasi: "Kesbangpol / BPKAD Pemerintah Daerah",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan permohonan pencairan hibah kepada Pemerintah Daerah agar langsung masuk ke rekening penampungan RPDHL.",
    dokumen: [
      "Surat Permohonan Pencairan hibah non pemilihan",
      "NPHD dan RAB",
      "Pakta Integritas / Surat Pernyataan Tanggung Jawab",
      "Surat Keterangan Bank (rekening aktif) & Fotokopi KTP KPA",
      "Dokumen lainnya yang termuat dalam NPHD pasal pencairan"
    ]
  },
  {
    tahap: 8,
    judul: "Tahap Revisi DIPA",
    aplikasi: "SAKTI & Kanwil DJPb",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan revisi DIPA untuk menganggarkan hibah non pemilihan (paling lambat 2 bulan setelah dana hibah diterima).",
    dokumen: [
      "Surat Permohonan Revisi DIPA",
      "NPHD dan RAB yang dilegalisir",
      "Ringkasan Hibah (formulir Kemenkeu)",
      "Surat Penerbitan Nomor Register Hibah",
      "Surat Ijin Pembukaan Rekening"
    ]
  },
  {
    tahap: 9,
    judul: "Tahap Pelaksanaan Anggaran",
    aplikasi: "SAKTI (Penatausahaan Belanja & Pajak)",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota melaksanakan anggaran hibah yang telah tercantum dalam DIPA sesuai rencana, TOR/KAK, serta melakukan pungut setor pajak.",
    dokumen: [
      "RAB (Rencana Anggaran Biaya)",
      "TOR/KAK (Term of Reference/Kerangka Acuan Kerja)",
      "Kalender Kegiatan (pelaksanaan hibah)",
      "Kartu Pengawasan Pelaksanaan Anggaran (Karwas)",
      "SPK / Dokumen Pengadaan"
    ]
  },
  {
    tahap: 10,
    judul: "Tahap Pengajuan SP2HL dan SP4HL",
    aplikasi: "SAKTI ke KPPN Mitra Kerja",
    uraian: "Bawaslu Provinsi/Kabupaten/Kota mengajukan SP2HL dan SP4HL kepada KPPN mitra kerja sebagai pertanggungjawaban atas penggunaan dan/oder pengembalian sisa hibah.",
    dokumen: [
      "DRPP (Daftar Rincian Penggunaan Dana)",
      "SPP (Surat Permintaan Pembayaran)",
      "SP2HL (Surat Permintaan Pengesahan Hibah Langsung)",
      "SP4HL (Surat Permintaan Pengesahan Pengembalian Hibah Langsung)",
      "Bukti setor/transfer pengembalian sisa hibah"
    ]
  },
  {
    tahap: 11,
    judul: "Tahap Pertanggungjawaban dan Pelaporan",
    aplikasi: "SAKTI & Bawaslu RI / Pemda",
    uraian: "Menyusun dan menyampaikan laporan penggunaan hibah sesuai ketentuan yang berlaku paling lambat tanggal 10 Januari Tahun Anggaran berikutnya.",
    dokumen: [
      "Surat Laporan Penggunaan Hibah",
      "Karwas Penggunaan Hibah (Pagu, Realisasi dan Sisa)",
      "SPHL (Surat Pertanggungjawaban Hibah Langsung)",
      "SP3HL (Surat Pemberitahuan Penyelesaian Hibah Langsung)",
      "Bukti Pengembalian Sisa Hibah"
    ]
  }
];

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'proses' | 'monitoring' | 'panduan' | 'resume'>('proses');
  
  const [realisasiList, setRealisasiList] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama_kegiatan: '', 
    tujuan_hibah: '', 
    nilai_rab: '',
    file_ba_pleno: '',
    file_surat: '',
    file_rab: '',
    file_tor: '',
    no_surat: '',
    tgl_surat: '',
    no_izin_prinsip: '',
    no_surat_permohonan_ttd: '',
    no_register: '',
    no_surat_register: '',
    no_surat_pengusulan_rekening: '',
    no_surat_persetujuan_rekening: '',
    no_rekening: '',
    nama_rekening: '',
    bank_rekening: 'mandiri',
    nominal_revisi_dipa: '',
    no_surat_izin_prinsip: '',
    tgl_surat_izin_prinsip: '',
    nomor_nphd: '',
    tanggal_nphd: '',
    surat_permohonan_register: '',
    surat_penetapan_register: '',
    nomor_register_hibah: '',
    no_surat_permohonan_rekening: '',
    no_surat_izin_penetapan_rekening: '',
    nama_bank_padanan: '',
    no_surat_pencairan: '',
    nomor_sp2d: '',
    no_surat_revisi_dipa: '',
    bulan_realisasi: 'Januari',
    tahun_realisasi: '2026',
    nilai_realisasi_bulan: '',
    keterangan_realisasi: '',
    tipe_transaksi_sp: 'SP2HL',
    tahapan_sp2d_ke: '1',
    nomor_dokumen_sp: '',
    nilai_transaksi_sp: '',
    tanggal_sp: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<any>(null);

  // STATE UNTUK ADDENDUM NPHD
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [selectedHibahForAddendum, setSelectedHibahForAddendum] = useState<any>(null);
  const [addendumForm, setAddendumForm] = useState({
    nomor_addendum: '',
    tanggal_addendum: '',
    nominal_baru: '',
    file_addendum: ''
  });
  const [isSubmittingAddendum, setIsSubmittingAddendum] = useState(false);

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
      
      if (requestData && requestData.length > 0) {
        setRequests(requestData);
        const activeId = requestData[0].id;
        fetchChildData(activeId);
      } else {
        setRequests([]);
      }
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

  const handleNominalAddendumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const formatted = value ? Number(value).toLocaleString('id-ID') : '';
    setAddendumForm({ ...addendumForm, nominal_baru: formatted });
  };

  const handleSubmitAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddendum(true);
    
    try {
      const rawNominal = addendumForm.nominal_baru.replace(/[^0-9]/g, '');

      const { error } = await supabase.from('nphd_addendum').insert({
        hibah_request_id: selectedHibahForAddendum.id,
        nomor_addendum: addendumForm.nomor_addendum,
        tanggal_addendum: addendumForm.tanggal_addendum,
        nominal_baru: Number(rawNominal),
        file_addendum: addendumForm.file_addendum,
        status: 'Menunggu Verifikasi'
      });

      if (error) throw error;
      
      alert('Berhasil! Addendum NPHD telah diajukan dan sedang menunggu verifikasi Provinsi.');
      setIsAddendumModalOpen(false);
      setAddendumForm({ nomor_addendum: '', tanggal_addendum: '', nominal_baru: '', file_addendum: '' });
      fetchData(); 
    } catch (error: any) {
      alert('Gagal mengajukan addendum: ' + error.message);
    } finally {
      setIsSubmittingAddendum(false);
    }
  };

  const openModalBaru = () => {
    setFormData({
      nama_kegiatan: '', tujuan_hibah: '', nilai_rab: '',
      file_ba_pleno: '', file_surat: '', file_rab: '', file_tor: '',
      no_surat: '', tgl_surat: '', no_izin_prinsip: '', no_surat_permohonan_ttd: '',
      no_register: '', no_surat_register: '', no_surat_pengusulan_rekening: '',
      no_surat_persetujuan_rekening: '', no_rekening: '', nama_rekening: '', bank_rekening: 'mandiri',
      nominal_revisi_dipa: '', no_surat_izin_prinsip: '', tgl_surat_izin_prinsip: '', nomor_nphd: '', tanggal_nphd: '',
      surat_permohonan_register: '', surat_penetapan_register: '', nomor_register_hibah: '',
      no_surat_permohonan_rekening: '', no_surat_izin_penetapan_rekening: '', nama_bank_padanan: '',
      no_surat_pencairan: '', nomor_sp2d: '', no_surat_revisi_dipa: '',
      bulan_realisasi: 'Januari', tahun_realisasi: '2026', nilai_realisasi_bulan: '', keterangan_realisasi: '',
      tipe_transaksi_sp: 'SP2HL', tahapan_sp2d_ke: '1', nomor_dokumen_sp: '', nilai_transaksi_sp: '', tanggal_sp: ''
    });
    setIsModalOpen(true);
  };

  const openActionModal = (req: any) => {
    setActiveReq(req);
    fetchChildData(req.id);
    
    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };

    setFormData({
      nama_kegiatan: req.nama_kegiatan || '',
      tujuan_hibah: req.tujuan_hibah || '',
      nilai_rab: req.nilai_rab || '',
      file_ba_pleno: req.file_ba_pleno || '',
      file_surat: req.file_surat || '',
      file_rab: req.file_rab || '',
      file_tor: req.file_tor || '',
      no_surat: req.no_surat || '',
      tgl_surat: formatDateForInput(req.tgl_surat),
      no_izin_prinsip: req.no_izin_prinsip || '',
      no_surat_permohonan_ttd: req.no_surat_permohonan_ttd || '',
      no_register: req.no_register || '',
      no_surat_register: req.no_surat_register || '',
      no_surat_pengusulan_rekening: req.no_surat_pengusulan_rekening || '',
      no_surat_persetujuan_rekening: req.no_surat_persetujuan_rekening || '',
      no_rekening: req.no_rekening || '',
      nama_rekening: req.nama_rekening || '',
      bank_rekening: req.bank_rekening || 'mandiri',
      nominal_revisi_dipa: req.nominal_revisi_dipa || '',
      no_surat_izin_prinsip: req.no_surat_izin_prinsip || '',
      tgl_surat_izin_prinsip: formatDateForInput(req.tgl_surat_izin_prinsip),
      nomor_nphd: req.nomor_nphd || '',
      tanggal_nphd: formatDateForInput(req.tanggal_nphd),
      surat_permohonan_register: req.surat_permohonan_register || '',
      surat_penetapan_register: req.surat_penetapan_register || '',
      nomor_register_hibah: req.nomor_register_hibah || '',
      no_surat_permohonan_rekening: req.no_surat_permohonan_rekening || '',
      no_surat_izin_penetapan_rekening: req.no_surat_izin_penetapan_rekening || '',
      nama_bank_padanan: req.nama_bank_padanan || '',
      no_surat_pencairan: req.no_surat_pencairan || '',
      nomor_sp2d: req.nomor_sp2d || '',
      no_surat_revisi_dipa: req.no_surat_revisi_dipa || '',
      bulan_realisasi: 'Januari', tahun_realisasi: '2026', nilai_realisasi_bulan: '', keterangan_realisasi: '',
      tipe_transaksi_sp: 'SP2HL', tahapan_sp2d_ke: '1', nomor_dokumen_sp: '', nilai_transaksi_sp: '', tanggal_sp: ''
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
        file_tor: formData.file_tor,
        no_surat: formData.no_surat,
        tgl_surat: formData.tgl_surat
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

  const handleTambahRealisasiBulanan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    const nilaiNum = parseFloat(formData.nilai_realisasi_bulan.replace(/[^0-9]/g, ''));
    if (isNaN(nilaiNum) || nilaiNum <= 0) {
      alert('Masukkan nilai realisasi bulanan yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('realisasi_bulanan').insert({
        hibah_request_id: activeReq.id,
        bulan: formData.bulan_realisasi,
        tahun: parseInt(formData.tahun_realisasi),
        nilai_realisasi: nilaiNum,
        keterangan_kegiatan: formData.keterangan_realisasi
      });
      if (error) throw error;
      alert(`Realisasi bulan ${formData.bulan_realisasi} berhasil disimpan!`);
      setFormData({...formData, nilai_realisasi_bulan: '', keterangan_realisasi: ''});
      fetchChildData(activeReq.id);
    } catch (err: any) {
      alert('Gagal menambah realisasi: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTambahTransaksiSP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    const nilaiNum = parseFloat(formData.nilai_transaksi_sp.replace(/[^0-9]/g, ''));
    if (isNaN(nilaiNum) || nilaiNum <= 0) {
      alert('Masukkan nilai transaksi yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transaksi_sp2hl_sp4hl').insert({
        hibah_request_id: activeReq.id,
        tipe: formData.tipe_transaksi_sp,
        tahapan_ke: formData.tipe_transaksi_sp === 'SP2HL' ? parseInt(formData.tahapan_sp2d_ke) : 0,
        nomor_dokumen: formData.nomor_dokumen_sp,
        nilai_transaksi: nilaiNum,
        tanggal: formData.tanggal_sp
      });
      if (error) throw error;
      alert(`Transaksi ${formData.tipe_transaksi_sp} berhasil ditambahkan!`);
      setFormData({...formData, nomor_dokumen_sp: '', nilai_transaksi_sp: '', tanggal_sp: ''});
      fetchChildData(activeReq.id);
    } catch (err: any) {
      alert('Gagal menambah transaksi SP: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBerkasTahap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;

    if (activeReq.tahap_sekarang === 10) {
      const hasSP4HL = transaksiList.some(t => t.tipe === 'SP4HL');
      if (!hasSP4HL) {
        const lanjut = window.confirm("Anda belum menginput dokumen SP4HL (pengesahan pengembalian/nihil). Apakah Anda yakin ingin lanjut ke tahap berikutnya tanpa SP4HL?");
        if (!lanjut) return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Definisikan payload dasar yang selalu ada
      const updatePayload: any = {
        status_tahap: 'Diproses',
        alasan_penolakan: null,
        file_ba_pleno: formData.file_ba_pleno,
        file_surat: formData.file_surat,
        file_rab: formData.file_rab,
        file_tor: formData.file_tor,
        no_surat: formData.no_surat,
        tgl_surat: formData.tgl_surat,
      };

      // 2. KHUSUS TAHAP 4: Masukkan nomor/tanggal izin prinsip & NPHD ke payload!
      if (activeReq.tahap_sekarang === 4) {
        updatePayload.no_surat_izin_prinsip = formData.no_surat_izin_prinsip;
        updatePayload.tgl_surat_izin_prinsip = formData.tgl_surat_izin_prinsip;
        updatePayload.nomor_nphd = formData.nomor_nphd;
        updatePayload.tanggal_nphd = formData.tanggal_nphd;

        if (formData.nilai_rab) {
          const cleanedNilai = String(formData.nilai_rab).replace(/[^0-9]/g, '');
          const numericRAB = parseFloat(cleanedNilai);
          if (!isNaN(numericRAB) && numericRAB > 0) {
            updatePayload.nilai_rab = numericRAB;
          }
        }
      }

      // Kirim ke database Supabase
      const { error } = await supabase.from('hibah_requests')
        .update(updatePayload)
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

  const renderDynamicInputsForTahap = (tahap: number) => {
    switch (tahap) {
      case 1:
        return (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Surat Permohonan Hibah *</label>
              <input type="text" required placeholder="Cth: 001/BAWASLU-KAB/..." value={formData.no_surat} onChange={(e) => setFormData({...formData, no_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat *</label>
              <input type="date" required value={formData.tgl_surat} onChange={(e) => setFormData({...formData, tgl_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Surat Konsultasi *</label>
              <input type="text" required placeholder="No. Surat Konsultasi" value={formData.no_surat} onChange={(e) => setFormData({...formData, no_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat *</label>
              <input type="date" required value={formData.tgl_surat} onChange={(e) => setFormData({...formData, tgl_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      case 3: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Permohonan Persetujuan Penerimaan Hibah ke Bawaslu RI *</label>
              <input type="text" required placeholder="No. Surat Permohonan ke RI" value={formData.no_surat} onChange={(e) => setFormData({...formData, no_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat Permohonan *</label>
              <input type="date" required value={formData.tgl_surat} onChange={(e) => setFormData({...formData, tgl_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      case 4: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Persetujuan / Izin Prinsip (Bawaslu RI) *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="No. Surat Persetujuan RI" 
                  value={formData.no_surat_izin_prinsip || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, no_surat_izin_prinsip: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat Persetujuan *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.tgl_surat_izin_prinsip || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, tgl_surat_izin_prinsip: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor NPHD *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nomor NPHD" 
                  value={formData.nomor_nphd || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, nomor_nphd: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal NPHD *</label>
                <input 
                  type="date" 
                  required 
                  value={formData.tanggal_nphd || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggal_nphd: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal NPHD (Rp) *</label>
              <input 
                type="text" 
                required 
                placeholder="Cth: 0" 
                value={formData.nilai_rab || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, nilai_rab: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg text-xs" 
              />
            </div>
          </div>
        );
      case 5: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Permohonan Register Hibah ke Kanwil DJPb *</label>
              <input 
                type="text" 
                required 
                placeholder="No. Surat Permohonan Register" 
                value={formData.surat_permohonan_register} 
                onChange={(e) => setFormData(prev => ({ ...prev, surat_permohonan_register: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg text-xs" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat Permohonan *</label>
              <input 
                type="date" 
                required 
                value={formData.tgl_surat} 
                onChange={(e) => setFormData(prev => ({ ...prev, tgl_surat: e.target.value }))} 
                className="w-full px-3 py-2 border rounded-lg text-xs" 
              />
            </div>
          </div>
        );
      case 6: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
            {/* Input Register yang tadinya di Tahap 5, sekarang ditaruh di sini karena sudah diterbitkan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Penerbitan Register (Kanwil DJPb) *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="No. Surat Penetapan Register" 
                  value={formData.surat_penetapan_register} 
                  onChange={(e) => setFormData(prev => ({ ...prev, surat_penetapan_register: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Register Hibah Resmi *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nomor Register Resmi" 
                  value={formData.nomor_register_hibah} 
                  onChange={(e) => setFormData(prev => ({ ...prev, nomor_register_hibah: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Permohonan Pembukaan Rekening *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="No. Surat Permohonan Rekening" 
                  value={formData.no_surat_permohonan_rekening} 
                  onChange={(e) => setFormData(prev => ({ ...prev, no_surat_permohonan_rekening: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Persetujuan Rekening KPPN *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="No. Surat Persetujuan KPPN" 
                  value={formData.no_surat_izin_penetapan_rekening} 
                  onChange={(e) => setFormData(prev => ({ ...prev, no_surat_izin_penetapan_rekening: e.target.value }))} 
                  className="w-full px-3 py-2 border rounded-lg text-xs" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Rekening RPDHL/RPDH *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Nomor Rekening" 
                    value={formData.no_rekening} 
                    onChange={(e) => setFormData(prev => ({ ...prev, no_rekening: e.target.value }))} 
                    className="w-full px-3 py-2 border rounded-lg text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Bank *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Cth: Bank Mandiri / BSI" 
                    value={formData.nama_bank_padanan} 
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_bank_padanan: e.target.value }))} 
                    className="w-full px-3 py-2 border rounded-lg text-xs" 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 7: 
        return (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Permohonan Pencairan *</label>
              <input type="text" required placeholder="No. Surat Permohonan Pencairan" value={formData.no_surat_pencairan} onChange={(e) => setFormData({...formData, no_surat_pencairan: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor SP2D Pemda *</label>
              <input type="text" required placeholder="Nomor SP2D Pencairan" value={formData.nomor_sp2d} onChange={(e) => setFormData({...formData, nomor_sp2d: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      case 8: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Surat Pengajuan Revisi DIPA *</label>
              <input type="text" required placeholder="No. Surat Pengajuan Revisi DIPA" value={formData.no_surat_revisi_dipa} onChange={(e) => setFormData({...formData, no_surat_revisi_dipa: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal Revisi DIPA / Pagu (Rp) *</label>
              <input type="text" required placeholder="Cth: 150000000" value={formData.nominal_revisi_dipa} onChange={(e) => setFormData({...formData, nominal_revisi_dipa: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      case 9: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="font-bold text-xs text-blue-900 uppercase">Input Realisasi Penyerapan Bulanan (Dapat Diisi Berulang)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bulan *</label>
                <select value={formData.bulan_realisasi} onChange={(e) => setFormData({...formData, bulan_realisasi: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white">
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahun *</label>
                <input type="text" value={formData.tahun_realisasi} onChange={(e) => setFormData({...formData, tahun_realisasi: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nilai Realisasi (Rp) *</label>
              <input type="text" placeholder="Cth: 25000000" value={formData.nilai_realisasi_bulan} onChange={(e) => setFormData({...formData, nilai_realisasi_bulan: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Keterangan / Uraian Kegiatan</label>
              <input type="text" placeholder="Cth: Pembayaran honorarium pengawas bulan berjalan" value={formData.keterangan_realisasi} onChange={(e) => setFormData({...formData, keterangan_realisasi: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
            </div>
            <button type="button" onClick={handleTambahRealisasiBulanan} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors">
              + Tambah / Simpan Realisasi Bulan Ini
            </button>

            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-[11px] font-bold text-slate-700 mb-2">Riwayat Realisasi Tercatat ({realisasiList.length} Bulan):</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {realisasiList.map((r, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex justify-between text-xs">
                    <span><b>{r.bulan} {r.tahun}</b>: Rp {Number(r.nilai_realisasi).toLocaleString('id-ID')}</span>
                    <span className="text-slate-500 italic truncate max-w-[150px]">{r.keterangan_realisasi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 10: 
        return (
          <div className="space-y-3 mt-3 pt-3 border-t border-slate-200 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="font-bold text-xs text-emerald-900 uppercase">Input Dokumen SP2HL (Hingga 6x) & SP4HL (Final)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Dokumen *</label>
                <select value={formData.tipe_transaksi_sp} onChange={(e) => setFormData({...formData, tipe_transaksi_sp: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white">
                  <option value="SP2HL">SP2HL (Pengesahan Pendapatan)</option>
                  <option value="SP4HL">SP4HL (Pengesahan Pengembalian / Nihil)</option>
                </select>
              </div>
              {formData.tipe_transaksi_sp === 'SP2HL' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tahapan SP2HL Ke- *</label>
                  <select value={formData.tahapan_sp2d_ke} onChange={(e) => setFormData({...formData, tahapan_sp2d_ke: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>SP2HL Ke-{n}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Dokumen</label>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">Finalisasi / Nihil</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nomor Dokumen *</label>
                <input type="text" placeholder="Cth: SP2HL-01/..." value={formData.nomor_dokumen_sp} onChange={(e) => setFormData({...formData, nomor_dokumen_sp: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nilai Transaksi (Rp) *</label>
                <input type="text" placeholder="Cth: 50000000" value={formData.nilai_transaksi_sp} onChange={(e) => setFormData({...formData, nilai_transaksi_sp: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Dokumen *</label>
              <input type="date" value={formData.tanggal_sp} onChange={(e) => setFormData({...formData, tanggal_sp: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs bg-white" />
            </div>
            <button type="button" onClick={handleTambahTransaksiSP} disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow-sm transition-colors">
              + Tambah Transaksi {formData.tipe_transaksi_sp}
            </button>

            <div className="mt-3 pt-3 border-t border-emerald-200">
              <div className="text-[11px] font-bold text-slate-700 mb-2">Riwayat Transaksi SP Tercatat ({transaksiList.length} Dokumen):</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {transaksiList.map((t, idx) => (
                  <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex justify-between text-xs">
                    <span><b>{t.tipe} {t.tipe === 'SP2HL' ? `(Ke-${t.tahapan_ke})` : ''}</b> - {t.nomor_dokumen}</span>
                    <span className="font-bold text-emerald-700">Rp {Number(t.nilai_transaksi).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              {!transaksiList.some(t => t.tipe === 'SP4HL') && (
                <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ Catatan: Step 10 baru bisa diselesaikan/dilanjut ke Tahap 11 setelah Anda menginput dokumen **SP4HL**.
                </div>
              )}
            </div>
          </div>
        );
      case 11:
        return (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">No. Surat Laporan Penggunaan *</label>
              <input type="text" required placeholder="No. Surat Laporan" value={formData.no_surat} onChange={(e) => setFormData({...formData, no_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tanggal Surat *</label>
              <input type="date" required value={formData.tgl_surat} onChange={(e) => setFormData({...formData, tgl_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Ruang Kerja...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden selection:bg-blue-100">
      
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 flex-shrink-0 print:hidden">
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

          <button onClick={() => setActiveMenu('resume')} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${activeMenu === 'resume' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Resume Laporan
          </button>

          <button onClick={() => setActiveMenu('panduan')} className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${activeMenu === 'panduan' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'}`}>
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253"></path></svg>
            Panduan 11 Tahap
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0 print:hidden">
          <div className="flex items-center text-sm text-slate-500">
            <span>Dashboard</span><span className="mx-2">/</span>
            <span className="font-medium text-slate-800">
              {activeMenu === 'proses' ? 'Usulan Hibah' : activeMenu === 'monitoring' ? 'Monitoring Usulan' : activeMenu === 'resume' ? 'Resume Laporan Resmi' : 'Panduan 11 Tahap'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {activeMenu === 'proses' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-end">
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

                                {req.tahap_sekarang >= 4 && (
                                  <button 
                                    onClick={() => {
                                      setSelectedHibahForAddendum(req);
                                      setIsAddendumModalOpen(true);
                                    }}
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1"
                                    title="Ajukan Addendum NPHD"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    Addendum
                                  </button>
                                )}

                                {req.status_tahap === 'Perlu Usulan' && (
                                  <button onClick={() => openActionModal(req)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors">
                                    Kirim ke Provinsi
                                  </button>
                                )}
                                
                                {req.status_tahap === 'Ditolak' && (
                                  <button onClick={() => openActionModal(req)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center">
                                    Usulkan Ulang
                                  </button>
                                )}
                                
                                {req.status_tahap === 'Diproses' && (
                                  <button onClick={() => openActionModal(req)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 transition-colors">
                                    Update Step / Berkas
                                  </button>
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

          {activeMenu === 'resume' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Resume Laporan Resmi</h1>
                  <p className="text-slate-500 mt-1">Format ringkasan kompilasi 11 tahap hibah.</p>
                </div>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Cetak / Download PDF
                </button>
              </div>

              <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6 print:shadow-none print:border-none print:p-0">
                
                <div className="text-center border-b-2 border-slate-800 pb-5 space-y-1">
                  <div className="font-bold text-slate-900 text-sm tracking-wide">BADAN PENGAWAS PEMILIHAN UMUM</div>
                  <div className="font-extrabold text-slate-900 text-base uppercase">PROVINSI JAWA BARAT</div>
                  <div className="text-[11px] text-slate-600">Jalan Turangga Nomor 25 Bandung 40264</div>
                  <div className="text-[11px] text-slate-600">Telepon 022-7332604 Email: set.jabar@bawaslu.go.id</div>
                  <div className="text-[11px] text-slate-600">Laman: http://jabar.bawaslu.go.id/</div>
                </div>

                <div className="text-center font-bold text-slate-900 text-sm uppercase tracking-wider py-2">
                  RINGKASAN PENGELOLAAN HIBAH NON-PEMILIHAN
                </div>

                {requests.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Belum ada data usulan untuk disusun dalam ringkasan laporan.</div>
                ) : (
                  requests.map((req) => {
                    const totalRealisasi = realisasiList.reduce((acc, curr) => acc + Number(curr.nilai_realisasi || 0), 0);
                    const paguAwal = Number(req.nominal_revisi_dipa || req.nilai_rab || 0);
                    const sisaAnggaran = paguAwal - totalRealisasi;

                    return (
                      <div key={req.id} className="space-y-6">
                        <div className="space-y-3 text-xs text-slate-800">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 font-bold">1.</div>
                            <div className="col-span-4 text-slate-600">Nama Pemberi Hibah</div>
                            <div className="col-span-7 font-semibold">: Pemerintah Daerah / Instansi Terkait</div>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 font-bold">2.</div>
                            <div className="col-span-4 text-slate-600">Nama Kegiatan</div>
                            <div className="col-span-7 font-semibold">: {req.nama_kegiatan}</div>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 font-bold">3.</div>
                            <div className="col-span-4 text-slate-600">Instansi Pengaju</div>
                            <div className="col-span-7 font-semibold">: {profile?.asal_instansi}</div>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 font-bold">4.</div>
                            <div className="col-span-4 text-slate-600">Posisi Tahap Saat Ini</div>
                            <div className="col-span-7 font-semibold">: Tahap {req.tahap_sekarang} ({TAHAPAN_HIBAH[req.tahap_sekarang - 1]})</div>
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-1 font-bold">5.</div>
                            <div className="col-span-4 text-slate-600">Pagu Awal DIPA</div>
                            <div className="col-span-7 font-semibold">: Rp {paguAwal.toLocaleString('id-ID')},-</div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <div className="font-bold text-xs uppercase text-slate-900 mb-2">Rincian Kompilasi Data & Nomor Surat Tiap Tahapan:</div>
                          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 text-slate-800 uppercase text-[10px] border-b border-slate-300">
                                  <th className="p-2.5 w-14 text-center border-r border-slate-300">Tahap</th>
                                  <th className="p-2.5 w-48 border-r border-slate-300">Nama Tahapan</th>
                                  <th className="p-2.5">Kompilasi Rincian Data & Nomor Surat</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {TAHAPAN_HIBAH.map((namaTahap, i) => {
                                  const stepNum = i + 1;
                                  return (
                                    <tr key={i} className={stepNum === req.tahap_sekarang ? 'bg-blue-50/40 font-medium' : ''}>
                                      <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-200">{stepNum}</td>
                                      <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-200">{namaTahap}</td>
                                      <td className="p-2.5 text-slate-700">
                                        {stepNum === 1 && <div>No. Surat Permohonan Hibah: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>}
                                        {stepNum === 2 && <div>No. Surat Konsultasi: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>}
                                        {stepNum === 3 && (
                                          <div>
                                            Surat Permohonan Persetujuan: <b>{req.no_surat || '-'}</b><br />
                                            Nomor Surat Persetujuan (Bawaslu RI): <b>{req.no_surat_izin_prinsip || '-'}</b> (Tgl: {req.tgl_surat_izin_prinsip || '-'})
                                          </div>
                                        )}
                                        {stepNum === 4 && (
                                          <div>
                                            Nomor NPHD: <b>{req.nomor_nphd || '-'}</b><br />
                                            Nominal NPHD: <b>Rp {Number(req.nilai_rab || 0).toLocaleString('id-ID')},-</b><br />
                                            Tanggal NPHD: <b>{req.tanggal_nphd || '-'}</b>
                                          </div>
                                        )}
                                        {stepNum === 5 && (
                                          <div>
                                            Surat Permohonan Register Hibah: <b>{req.surat_permohonan_register || '-'}</b><br />
                                            Surat Penerbitan Register Hibah: <b>{req.surat_penetapan_register || '-'}</b><br />
                                            Nomor Register Hibah: <b>{req.nomor_register_hibah || '-'}</b>
                                          </div>
                                        )}
                                        {stepNum === 6 && (
                                          <div>
                                            No. Surat Permohonan Pembukaan Rekening: <b>{req.no_surat_permohonan_rekening || '-'}</b><br />
                                            No. Surat Persetujuan KPPN: <b>{req.no_surat_izin_penetapan_rekening || '-'}</b><br />
                                            Nama Bank / Rekening: <span className="uppercase font-bold">{req.nama_bank_padanan || '-'}</span> (No. Rek: {req.no_rekening || '-'})
                                          </div>
                                        )}
                                        {stepNum === 7 && (
                                          <div>
                                            Nomor Surat Permohonan Pencairan: <b>{req.no_surat_pencairan || '-'}</b><br />
                                            Nomor SP2D: <b>{req.nomor_sp2d || '-'}</b>
                                          </div>
                                        )}
                                        {stepNum === 8 && (
                                          <div>
                                            Nomor Surat Pengajuan Revisi DIPA: <b>{req.no_surat_revisi_dipa || '-'}</b><br />
                                            Nominal Revisi DIPA (Pagu): <b>Rp {paguAwal.toLocaleString('id-ID')},-</b>
                                          </div>
                                        )}
                                        {stepNum === 9 && (
                                          <div className="space-y-1.5">
                                            <div>• <b>Pagu Awal DIPA</b>: Rp {paguAwal.toLocaleString('id-ID')},-</div>
                                            <div>• <b>Akumulasi Realisasi s.d. Bulan Berjalan</b>: Rp {totalRealisasi.toLocaleString('id-ID')},-</div>
                                            <div className={`font-bold ${sisaAnggaran < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                              • <b>Sisa Anggaran</b>: Rp {sisaAnggaran.toLocaleString('id-ID')},-
                                            </div>
                                            {realisasiList.length > 0 && (
                                              <div className="mt-2 pt-2 border-t border-slate-200">
                                                <div className="text-[11px] font-bold text-slate-700 mb-1">Rincian Realisasi Bulanan:</div>
                                                <ul className="space-y-1 pl-2 border-l-2 border-blue-200">
                                                  {realisasiList.map((r, ri) => (
                                                    <li key={ri}>• <b>{r.bulan} {r.tahun}</b>: Rp {Number(r.nilai_realisasi).toLocaleString('id-ID')} ({r.keterangan_realisasi || '-'})</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {stepNum === 10 && (
                                          <div>
                                            {transaksiList.length === 0 ? (
                                              <span className="text-slate-400 italic">Belum ada transaksi SP2HL / SP4HL tercatat</span>
                                            ) : (
                                              <ul className="space-y-1 pl-2 border-l-2 border-emerald-200">
                                                {transaksiList.map((t, ti) => (
                                                  <li key={ti}>• <b>{t.tipe} {t.tipe === 'SP2HL' ? `(Ke-${t.tahapan_ke})` : ''}</b> ({t.nomor_dokumen}): <b>Rp {Number(t.nilai_transaksi).toLocaleString('id-ID')}</b></li>
                                                ))}
                                              </ul>
                                            )}
                                          </div>
                                        )}
                                        {stepNum === 11 && <div>No. Surat Laporan Pertanggungjawaban: <b>{req.no_surat || '-'}</b> (Tgl: {req.tgl_surat || '-'})</div>}
                                        {stepNum > req.tahap_sekarang && <span className="text-slate-400 italic">Belum mencapai tahap ini</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="text-xs text-slate-700 leading-relaxed pt-2">
                          Kami menyatakan dengan sesungguhnya bahwa ringkasan naskah perjanjian hibah ini disusun berdasarkan dokumen dan bukti-bukti yang ada pada Pejabat Pembuat Komitmen sebagai dasar pengajuan dan penatausahaan hibah sebagaimana diusulkan dalam rangka mendukung kelancaran pengawasan pemilihan dan kegiatan non-pemilihan Bawaslu.
                        </div>
                      </div>
                    );
                  })
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
                              const isStep10Tuntas = stepNumber === 10 && transaksiList.some(t => t.tipe === 'SP4HL');

                              return (
                                <td key={index} className="p-2 border-r border-slate-100 text-center min-w-[160px]">
                                  {(isSelesai || isStep10Tuntas) ? (
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-emerald-600 p-2.5">
                                      <div className="flex items-center space-x-1 mb-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-[10px] font-bold">Tuntas</span>
                                      </div>
                                      <span className="text-[9px] text-slate-500 font-mono leading-tight">
                                        {formatTimestamp(req.updated_at || req.created_at)}
                                      </span>
                                    </div>
                                  ) : isAktif ? (
                                    req.status_tahap === 'Perlu Usulan' ? (
                                      <div className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg flex flex-col items-center justify-center p-2.5">
                                        <span className="text-[10px] font-bold">Giliran Anda</span>
                                        <span className="text-[9px] mt-0.5 text-emerald-500">(Kirim Berkas)</span>
                                      </div>
                                    ) : req.status_tahap === 'Diproses' ? (
                                      <div className="w-full bg-blue-500 text-white rounded-lg shadow-sm flex flex-col items-center justify-center p-2.5">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <span className="text-[10px] font-bold">Verifikasi...</span>
                                        </div>
                                        <span className="text-[9px] text-blue-100 font-mono leading-tight">
                                          {formatTimestamp(req.updated_at || req.created_at)}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="w-full bg-rose-500 text-white rounded-lg shadow-sm flex flex-col items-center justify-center p-2.5">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <span className="text-[10px] font-bold">Direvisi</span>
                                        </div>
                                        <span className="text-[9px] text-rose-100 font-mono leading-tight">
                                          {formatTimestamp(req.updated_at)}
                                        </span>
                                      </div>
                                    )
                                  ) : (
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
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Panduan & Infografis 11 Tahap Hibah</h1>
                  <p className="text-slate-500 mt-1 text-sm">Infografis resmi alur pengelolaan hibah non-pemilihan Bawaslu Jabar.</p>
                </div>
                <a 
                  href="/SIHANDAL_Ceklis_Kelengkapan_Dokumen_Penerimaan_Hibah_Non_Pemilihan.xlsx" 
                  download 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Master Ceklis Excel (.xlsx)
                </a>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    0
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overview Keseluruhan</span>
                    <h3 className="font-bold text-slate-900 text-lg">Alur Pengelolaan Hibah Non-Pemilihan 11 Tahap</h3>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 flex justify-center items-center shadow-inner">
                  <img 
                    src="/infografis/tahap-0.jpg" 
                    alt="Alur Utama 11 Tahap Hibah Bawaslu Jabar" 
                    className="w-full h-auto object-contain rounded-lg max-h-[850px] hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              </div>

              <div className="space-y-8">
                {DETAIL_PANDUAN_TAHAP.map((item) => (
                  <div key={item.tahap} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                      <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {item.tahap}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Infografis Resmi Tahap {item.tahap}</span>
                        <h3 className="font-bold text-slate-900 text-lg">{item.judul}</h3>
                      </div>
                    </div>

                    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 flex justify-center items-center shadow-inner">
                      <img 
                        src={`/infografis/tahap-${item.tahap}.jpg`} 
                        alt={`Infografis Tahap ${item.tahap} - ${item.judul}`} 
                        className="w-full h-auto object-contain rounded-lg max-h-[750px] hover:scale-[1.01] transition-transform duration-300"
                      />
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
                <h3 className="text-lg font-bold text-slate-800">Tahap 1: {TAHAPAN_HIBAH[0]}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleSubmitPermohonan} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul / Nama Kegiatan</label>
                  <input type="text" required value={formData.nama_kegiatan} onChange={(e) => setFormData({...formData, nama_kegiatan: e.target.value})} placeholder="Cth: Dukungan Pengawasan Pilkada" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tujuan Hibah</label>
                  <textarea required value={formData.tujuan_hibah} onChange={(e) => setFormData({...formData, tujuan_hibah: e.target.value})} rows={2} className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimasi Nilai RAB (Rp)</label>
                  <input type="text" required value={formData.nilai_rab} onChange={(e) => setFormData({...formData, nilai_rab: e.target.value})} placeholder="Cth: 150000000" className="w-full px-4 py-2.5 border rounded-xl text-sm" />
                </div>

                {renderDynamicInputsForTahap(1)}

                <div className="bg-slate-50 p-4 rounded-xl border space-y-3 mt-4">
                  <div className="text-xs font-bold text-slate-700">Tautan Berkas Google Drive Wajib (Tahap 1):</div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">1. BA Pleno Persetujuan</label>
                    <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_ba_pleno} onChange={(e) => setFormData({...formData, file_ba_pleno: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">2. Surat Permohonan Hibah</label>
                    <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">3. Proposal Hibah</label>
                    <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">4. RAB Hibah</label>
                    <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border py-3 rounded-xl text-sm">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-md">Simpan & Kirim</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isActionModalOpen && activeReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Kelola Tahap {activeReq.tahap_sekarang}: {TAHAPAN_HIBAH[activeReq.tahap_sekarang - 1]}</h3>
                <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleUpdateBerkasTahap} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {renderDynamicInputsForTahap(activeReq.tahap_sekarang)}

                {activeReq.tahap_sekarang !== 9 && activeReq.tahap_sekarang !== 10 && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-slate-700">Tautan Berkas Google Drive Wajib (Tahap {activeReq.tahap_sekarang}):</div>
                    
                    {activeReq.tahap_sekarang === 1 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link BA Pleno Persetujuan</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_ba_pleno} onChange={(e) => setFormData({...formData, file_ba_pleno: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link Surat Permohonan Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Proposal Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">4. Link RAB Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 2 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan Konsultasi Rencana Penerimaan</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link RAB & TOR/KAK Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Dokumen Pendukung (BA/Surat Pemda / Data BMN)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 3 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan Persetujuan & Perubahan Rencana Kerja</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link RAB, TOR/KAK, & SPTJM (Ttd KPA/PPK)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link HPS/Survei & Data Pegawai/BMN Eksisting</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 4 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan TTD & Draf NPHD</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link RAB Lampiran NPHD</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Surat Ijin Prinsip Bawaslu RI</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 5 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan Penerbitan Nomor Register & Ringkasan Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link NPHD Dilegalisir (Halaman Tanda Tangan)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link RAB Dilegalisir (Lampiran NPHD)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 6 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link BA Pleno Penetapan Bank Penampungan</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_ba_pleno} onChange={(e) => setFormData({...formData, file_ba_pleno: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link Surat Permohonan Pembukaan Rekening RPDHL/RPDH</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Surat Penerbitan Nomor Register Hibah (Kanwil DJPb)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 7 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan Pencairan & NPHD/RAB</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link Pakta Integritas / SPTJM & Keterangan Bank/KTP KPA</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Dokumen Pendukung Lainnya Sesuai NPHD</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 8 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Permohonan Revisi DIPA & Ringkasan Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link NPHD & RAB Dilegalisir</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Surat Register & Surat Ijin Pembukaan Rekening</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}

                    {activeReq.tahap_sekarang === 11 && (
                      <>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">1. Link Surat Laporan Penggunaan Hibah</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_surat} onChange={(e) => setFormData({...formData, file_surat: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">2. Link Karwas Penggunaan & SPHL / SP3HL</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_rab} onChange={(e) => setFormData({...formData, file_rab: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">3. Link Bukti Pengembalian Sisa Hibah (Jika Ada)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.file_tor} onChange={(e) => setFormData({...formData, file_tor: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t flex gap-3">
                  <button type="button" onClick={() => setIsActionModalOpen(false)} className="flex-1 bg-white border py-3 rounded-xl text-sm">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md">Simpan & Majukan Tahap</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddendumModalOpen && selectedHibahForAddendum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Form Addendum NPHD</h3>
                  <p className="text-xs text-amber-700">Kegiatan: {selectedHibahForAddendum.nama_kegiatan}</p>
                </div>
                <button onClick={() => setIsAddendumModalOpen(false)} className="text-amber-500 hover:text-amber-700 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleSubmitAddendum} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Addendum *</label>
                  <input 
                    type="text" required 
                    value={addendumForm.nomor_addendum} 
                    onChange={(e) => setAddendumForm({...addendumForm, nomor_addendum: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    placeholder="Cth: 900/123/Add-Pemkab/2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Addendum *</label>
                  <input 
                    type="date" required 
                    value={addendumForm.tanggal_addendum} 
                    onChange={(e) => setAddendumForm({...addendumForm, tanggal_addendum: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pagu / Nominal Baru (Setelah Addendum) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold text-sm">Rp</span>
                    <input 
                      type="text" required 
                      value={addendumForm.nominal_baru} 
                      onChange={handleNominalAddendumChange}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold text-emerald-700"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Isi dengan total nominal final setelah ditambahkan/dikurangi sesuai addendum.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Dokumen Addendum (Google Drive) *</label>
                  <input 
                    type="url" required 
                    value={addendumForm.file_addendum} 
                    onChange={(e) => setAddendumForm({...addendumForm, file_addendum: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://drive.google.com/..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Pastikan hak akses link Google Drive diatur menjadi "Siapa saja yang memiliki link".</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddendumModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingAddendum} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm transition-all disabled:opacity-70 flex justify-center items-center">
                    {isSubmittingAddendum ? 'Memproses...' : 'Kirim Pengajuan'}
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