import { createClient } from '@supabase/supabase-js';

// Gunakan env var untuk keamanan
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  // 1. Total tabungan tercatat
  const { data: totalSetoranData } = await supabase
    .from('tabungan')
    .select('Jumlah')
    .eq('Tipe', 'Setoran')
    .eq('Status', 'Confirmed');
  const totalTabunganTercatat = (totalSetoranData || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // 2. Dana terkonfirmasi (Setoran Awal + Pelunasan Approved)
  // Setoran Awal (Confirmed)
  const { data: setoranAwalConfirmed } = await supabase
    .from('tabungan')
    .select('Jumlah')
    .eq('Metode', 'Setoran Awal')
    .eq('Status', 'Confirmed');
  const totalSetoranAwalConfirmed = (setoranAwalConfirmed || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // Semua transfer_confirmations yang Status-nya Approved
  const { data: pelunasanApproved } = await supabase
    .from('transfer_confirmations')
    .select('Amount, Status')
    .eq('Status', 'Approved');
  const totalPelunasanApproved = (pelunasanApproved || []).reduce((acc, cur) => acc + Number(cur.Amount), 0);

  // Dana terkonfirmasi = Setoran Awal Confirmed + Pelunasan Approved
  const totalDanaTerkonfirmasi = totalSetoranAwalConfirmed + totalPelunasanApproved;

  // 3. Total tabungan terpakai
  const { data: totalTerpakaiData } = await supabase
    .from('tabungan')
    .select('Jumlah')
    .eq('Tipe', 'Penarikan')
    .eq('Status', 'Confirmed');
  const totalTabunganTerpakai = (totalTerpakaiData || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // 4. Total sisa tabungan
  const totalSisaTabungan = totalTabunganTercatat - totalTabunganTerpakai - totalDanaTerkonfirmasi;

  // 5. Total biaya operasional
  const { data: biayaData } = await supabase
    .from('biayaoperasional')
    .select('Jumlah');
  const totalBiayaOperasional = (biayaData || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // 6. Total voucher terpakai
  const { data: voucherLogData } = await supabase
    .from('voucherlogs')
    .select('VoucherCode');
  let totalVoucher = 0;
  if (voucherLogData && voucherLogData.length > 0) {
    const voucherCodes = voucherLogData.map(v => v.VoucherCode);
    const { data: voucherData } = await supabase
      .from('vouchers')
      .select('Amount, VoucherCode')
      .in('VoucherCode', voucherCodes);
    totalVoucher = (voucherData || []).reduce((acc, cur) => acc + Number(cur.Amount), 0);
  }

  // 7. Pendapatan bersih
  const pendapatanBersih = totalTabunganTercatat - totalBiayaOperasional - totalVoucher;

  // 8. List pengeluaran admin
  const { data: pengeluaranList } = await supabase
    .from('biayaoperasional')
    .select('*')
    .order('Tanggal', { ascending: false });

  // 9. List user & riwayat transaksi
  const { data: userList } = await supabase
    .from('users')
    .select('UserId, Nama, Email, StatusSetoran, IsInitialDepositMade, InitialDepositStatus, TargetPribadi');
  const { data: transaksiList } = await supabase
    .from('tabungan')
    .select('*');



  // 10. Notifikasi setoran awal pending (hanya user, exclude admin, dan IsInitialDepositMade true)
  const { data: setoranPendingUsers } = await supabase
    .from('users')
    .select('UserId, Nama, Email, Role, IsInitialDepositMade, InitialDepositStatus')
    .eq('IsInitialDepositMade', true)
    .eq('InitialDepositStatus', 'Pending')
    .not('Role', 'eq', 'admin');

  // Ambil data tabungan untuk user-user pending (Metode=Setoran Awal, VerificationStatus=Pending)
  let setoranPending = [];
  if (setoranPendingUsers && setoranPendingUsers.length > 0) {
    const userIds = setoranPendingUsers.map(u => u.UserId);
    const { data: tabunganSetoran } = await supabase
      .from('tabungan')
      .select('UserId, Jumlah, ProofLink, VerificationStatus, Metode')
      .in('UserId', userIds)
      .eq('Metode', 'Setoran Awal')
      .eq('VerificationStatus', 'Pending');

    setoranPending = setoranPendingUsers.map(user => {
      // Ambil data tabungan terkait user ini
      const tabungan = (tabunganSetoran || []).find(t => t.UserId === user.UserId);
      return {
        ...user,
        Amount: tabungan ? tabungan.Jumlah : null,
        ProofLink: tabungan ? tabungan.ProofLink : null,
      };
    });
  }

  // 11. Verifikasi transfer pending
  const { data: transferPending } = await supabase
    .from('transfer_confirmations')
    .select('*')
    .eq('Status', 'Pending');

  // 12. List berita/newsletter
  const { data: newsList } = await supabase
    .from('newsletters')
    .select('*')
    .order('DatePublished', { ascending: false });

  // 13. List file/resource
  const { data: resourceList } = await supabase
    .from('app_resources')
    .select('*')
    .eq('IsActive', true)
    .order('CreatedAt', { ascending: false });

  return Response.json({
    totalTabunganTercatat,
    totalDanaTerkonfirmasi,
    totalTabunganTerpakai,
    totalSisaTabungan,
    totalBiayaOperasional,
    totalVoucher,
    pendapatanBersih,
    pengeluaranList,
    userList,
    transaksiList,
    setoranPending,
    transferPending,
    newsList,
    resourceList
  });
}
