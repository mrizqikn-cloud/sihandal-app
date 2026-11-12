'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  asal_instansi: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoadingFetch, setIsLoadingFetch] = useState(true);
  
  // State default diubah dari 'user_biasa' ke 'user'
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'user', instansi: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingFetch(true);
    try {
      const response = await fetch('/api/admin/users');
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (response.ok) setUsers(data);
      }
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setIsLoadingFetch(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) alert(`Gagal: ${result.error}`);
      else {
        alert('Pengguna baru berhasil ditambahkan!');
        setFormData({ name: '', email: '', password: '', role: 'user', instansi: '' });
        fetchUsers();
      }
    } catch (error: any) {
      alert(`Kesalahan sistem: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (id: string, name: string) => {
    const newPassword = window.prompt(`Masukkan kata sandi baru untuk ${name}\n(Minimal 6 karakter):`);
    if (!newPassword) return; 
    if (newPassword.length < 6) return alert("Gagal: Kata sandi minimal 6 karakter!");

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) alert(`Gagal: ${result.error}`);
      else alert(`Kata sandi ${name} berhasil diperbarui!`);
    } catch (error) {
      alert('Terjadi kesalahan sistem.');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`PERINGATAN!\nYakin ingin menghapus akses untuk ${name}?\nAksi ini tidak dapat dibatalkan.`);
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      const result = await response.json();
      if (!response.ok) alert(`Gagal menghapus: ${result.error}`);
      else {
        alert(`Pengguna ${name} berhasil dihapus.`);
        fetchUsers();
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem.');
    }
  };

  // Helper untuk melabeli dan mewarnai badge role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'atasan_kabkot':
        return { label: 'Atasan Kab/Kota', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
      case 'atasan_prov':
        return { label: 'Atasan Provinsi', bg: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' };
      case 'verifikator':
        return { label: 'Verifikator', bg: 'bg-orange-50 text-orange-700 border-orange-100', dot: 'bg-orange-500' };
      default:
        return { label: 'Staf Pengaju', bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-blue-100">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-white mr-3 shadow-sm">S</div>
          <span className="font-bold text-white text-lg tracking-wide">SIHANDAL</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu Utama</div>
          <a href="#" className="flex items-center px-3 py-2.5 bg-blue-600 text-white rounded-lg group shadow-sm">
            <svg className="w-5 h-5 mr-3 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Manajemen Pengguna
          </a>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">SA</div>
            <div className="ml-3"><p className="text-sm font-medium text-white">Super Admin</p></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center text-sm text-slate-500">
            <span>Admin Panel</span><span className="mx-2">/</span><span className="font-medium text-slate-800">Manajemen Pengguna</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md transition-colors">Keluar</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Pengguna Sistem</h1>
              <p className="text-slate-500 mt-1">Kelola hak akses dan akun fungsional SIHANDAL.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Form Tambah Pengguna */}
              <div className="xl:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center">Tambah Pengguna</h2>
                  <form className="space-y-4" onSubmit={handleCreateUser}>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Cth: Budi Santoso" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email / NIP</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@bawaslu.go.id" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi Awal</label>
                      <input type="text" required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Minimal 6 karakter" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    
                    {/* Dropdown Role */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Peran Akses</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                        <option value="user">Staf Pengaju (Kabupaten/Kota)</option>
                        <option value="atasan_kabkot">Atasan Kabupaten/Kota (Pimpinan Wilayah)</option>
                        <option value="atasan_prov">Atasan Provinsi (Pemantau Lintas Wilayah)</option>
                        <option value="verifikator">Verifikator Provinsi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Asal Instansi</label>
                      <input type="text" required value={formData.instansi} onChange={(e) => setFormData({...formData, instansi: e.target.value})} placeholder="Cth: Bawaslu Kota Sukabumi" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-70">
                        {isSubmitting ? 'Memproses...' : 'Simpan Pengguna Baru'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Data Table */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-slate-200 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Daftar Pengguna Aktif</h2>
                  </div>
                  
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                          <th className="p-4 font-semibold w-1/2">Informasi Pengguna</th>
                          <th className="p-4 font-semibold">Tipe Akun</th>
                          <th className="p-4 font-semibold text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100">
                        {isLoadingFetch ? (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                        ) : users.length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada pengguna terdaftar.</td></tr>
                        ) : (
                          users.map((u) => {
                            const badge = getRoleBadge(u.role);
                            return (
                              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center">
                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm mr-3 border border-slate-200">
                                      {u.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-800">{u.full_name}</div>
                                      <div className="text-slate-500 text-xs mt-0.5">{u.asal_instansi}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  {/* Badge Role Dinamis */}
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`}></span>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => handleUpdatePassword(u.id, u.full_name)} className="text-blue-600 hover:text-blue-800 font-medium text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                      Ubah Sandi
                                    </button>
                                    <button onClick={() => handleDeleteUser(u.id, u.full_name)} className="text-rose-600 hover:text-rose-800 font-medium text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}