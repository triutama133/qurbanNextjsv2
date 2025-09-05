import { createSupabaseAdmin, isSupabaseAvailable } from '../../lib/supabase-admin';

export default async function handler(req, res) {
  if (!isSupabaseAvailable()) {
    return res.status(503).json({ error: 'Database service tidak tersedia' });
  }

  const supabase = createSupabaseAdmin();

  // Note: Since we're using admin client, we need to implement auth differently
  // This would typically require implementing session verification separately
  
  if (req.method === 'POST') {
    // Tambah pengeluaran
    const { deskripsi, jumlah, adminUserId } = req.body;
    if (!deskripsi || !jumlah || isNaN(Number(jumlah)) || !adminUserId) {
      return res.status(400).json({ error: 'Deskripsi, jumlah, dan adminUserId wajib diisi.' });
    }

    // Verify admin role first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('Role')
      .eq('UserId', adminUserId)
      .single();
    
    if (userError || !userData || userData.Role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    const { data, error } = await supabase
      .from('pengeluaran_admin')
      .insert({
        Deskripsi: deskripsi,
        Jumlah: Number(jumlah),
        Tanggal: new Date().toISOString(),
        AdminUserId: adminUserId,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === 'DELETE') {
    // Hapus pengeluaran
    const { costId, adminUserId } = req.body;
    if (!costId || !adminUserId) return res.status(400).json({ error: 'costId dan adminUserId wajib diisi.' });
    
    // Verify admin role first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('Role')
      .eq('UserId', adminUserId)
      .single();
    
    if (userError || !userData || userData.Role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

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
