import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function handler(req, res) {
  const supabase = createRouteHandlerClient({ cookies });

  // Cek autentikasi admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Cek role admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('Role')
    .eq('UserId', user.id)
    .single();
  if (userError || !userData || userData.Role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'POST') {
    // Tambah pengeluaran
    const { deskripsi, jumlah } = req.body;
    if (!deskripsi || !jumlah || isNaN(Number(jumlah))) {
      return res.status(400).json({ error: 'Deskripsi dan jumlah wajib diisi.' });
    }
    const { data, error } = await supabase
      .from('pengeluaran_admin')
      .insert({
        Deskripsi: deskripsi,
        Jumlah: Number(jumlah),
        Tanggal: new Date().toISOString(),
        AdminUserId: user.id,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'DELETE') {
    // Hapus pengeluaran
    const { costId } = req.body;
    if (!costId) return res.status(400).json({ error: 'costId wajib diisi.' });
    const { error } = await supabase
      .from('pengeluaran_admin')
      .delete()
      .eq('CostId', costId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
