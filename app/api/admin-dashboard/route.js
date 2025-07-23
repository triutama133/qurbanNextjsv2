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

  // 2. Total tabungan transfer
  const { data: totalTransferData } = await supabase
    .from('tabungan')
    .select('Jumlah')
    .eq('Tipe', 'Transfer')
    .eq('Status', 'Confirmed');
  const totalTabunganTransfer = (totalTransferData || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // 3. Total tabungan terpakai
  const { data: totalTerpakaiData } = await supabase
    .from('tabungan')
    .select('Jumlah')
    .eq('Tipe', 'Penarikan')
    .eq('Status', 'Confirmed');
  const totalTabunganTerpakai = (totalTerpakaiData || []).reduce((acc, cur) => acc + Number(cur.Jumlah), 0);

  // 4. Total sisa tabungan
  const totalSisaTabungan = totalTabunganTercatat - totalTabunganTerpakai - totalTabunganTransfer;

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

  // 10. Notifikasi setoran awal pending
  const { data: setoranPending } = await supabase
    .from('users')
    .select('UserId, Nama, Email')
    .eq('IsInitialDepositMade', false)
    .eq('InitialDepositStatus', 'Pending');

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
    totalTabunganTransfer,
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
