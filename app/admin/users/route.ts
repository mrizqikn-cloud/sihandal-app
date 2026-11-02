import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Fungsi GET untuk mengambil daftar pengguna dari tabel profiles
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Fungsi POST untuk mendaftarkan akun ke Auth sekaligus ke tabel profiles
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, instansi } = body;

    // 1. Daftarkan di sistem Auth Supabase (tanpa perlu konfirmasi email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
    });

    if (authError) throw authError;

    // 2. Simpan data detailnya ke tabel profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      full_name: name,
      role: role,
      asal_instansi: instansi,
    });

    // Jika gagal simpan profil, batalkan (hapus) akun auth-nya
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({ message: 'Pengguna berhasil ditambahkan' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}