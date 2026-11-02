import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Mengambil daftar user
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// Menambahkan user baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, instansi } = body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, 
    });

    if (authError) throw authError;

    if (authData?.user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: authData.user.id, full_name: name, role, asal_instansi: instansi,
      });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
    }
    return NextResponse.json({ message: 'Berhasil ditambahkan' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Mengubah password user (PATCH)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) throw new Error("Data tidak lengkap");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;
    return NextResponse.json({ message: 'Password berhasil diubah' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Menghapus user (DELETE)
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) throw new Error("ID Pengguna tidak ditemukan");

    // Hapus dari tabel profiles terlebih dahulu
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Lalu hapus dari sistem Auth Supabase
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}