'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      const userRole = profileData.role;

      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'verifikator') {
        router.push('/verifikator');
      } else if (userRole === 'atasan_kabkot') {
        router.push('/atasan-kabkot');
      } else if (userRole === 'atasan_prov') {
        router.push('/atasan-prov');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      alert("Login Gagal: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        
        {/* Sisi Kiri: Logo & Branding Resmi */}
        <div className="flex-1 text-center md:text-left px-4 space-y-4">
          <div className="flex justify-center md:justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
              <span className="text-xl font-black tracking-wider text-rose-600">SIHANDAL</span>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bawaslu Jabar</div>
            </div>
          </div>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Sistem Informasi Hibah, Administrasi dan Pengendalian terintegrasi untuk Bawaslu.
          </p>
        </div>

        {/* Sisi Kanan: Kartu Login */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200/80">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email atau Akun Bawaslu" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Kata Sandi" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md transition-all disabled:opacity-70">
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Silakan hubungi Administrator Provinsi untuk reset kata sandi.'); }} className="text-xs text-blue-600 hover:underline font-medium">
              Lupa kata sandi?
            </a>
          </div>

          <hr className="my-6 border-slate-100" />

          <div className="text-center">
            <Link href="/" className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              &larr; Kembali ke Beranda Utama
            </Link>
          </div>
        </div>

      </div>

      <footer className="text-xs text-slate-500 font-medium text-center">
        Bawaslu Provinsi Jawa Barat &copy; 2026
      </footer>
    </div>
  );
}