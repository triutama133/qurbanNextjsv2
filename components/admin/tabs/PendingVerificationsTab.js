import React from "react";


const PendingVerificationsTab = ({
  loadingOverview,
  pendingInitialDeposits,
  pendingTransferConfirmations,
  formatRupiah,
  handleVerifyInitialDeposit,
  handleVerifyTransferConfirmation,
  ListSkeleton
}) => {
  // Filter admin dari pendingInitialDeposits dan pendingTransferConfirmations
  // Robust filter: exclude admin regardless of case or missing Role
  const filteredInitialDeposits = pendingInitialDeposits.filter(item => (item.Role || '').toLowerCase() !== 'admin');
  const filteredTransferConfirmations = pendingTransferConfirmations.filter(item => (item.Role || '').toLowerCase() !== 'admin');

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-indigo-800">Verifikasi Pending</h2>
      {loadingOverview ? <ListSkeleton /> : (
        filteredInitialDeposits.length > 0 || filteredTransferConfirmations.length > 0 ? (
          <>
            {/* Verifikasi Setoran Awal */}
            <h3 className="font-semibold text-lg mb-2">Setoran Awal</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama (Email)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInitialDeposits.map((item) => (
                    <tr key={item.UserId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.UserId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama} ({item.Email})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.Amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.ProofLink && item.ProofLink.trim() !== '' ? (
                          <span className="text-blue-600">{item.ProofLink}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                        <button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verifikasi Konfirmasi Transfer Cicilan */}
            <h3 className="font-semibold text-lg mb-2">Transfer ke Panitia</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User (Email)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransferConfirmations.map((item) => (
                    <tr key={item.ConfirmationId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ConfirmationId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama} ({item.Email})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.Amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.Timestamp).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ProofLink && <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat</a>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleVerifyTransferConfirmation(item.ConfirmationId, 'Approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                        <button onClick={() => handleVerifyTransferConfirmation(item.ConfirmationId, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Tidak ada verifikasi pending saat ini.</p>
        )
      )}
    </>
  );
};

export default PendingVerificationsTab;
