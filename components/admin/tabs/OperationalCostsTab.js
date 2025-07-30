import React from "react";

const OperationalCostsTab = ({
  loadingCosts,
  addCostLoading,
  handleAddOperationalCost,
  allOperationalCosts,
  formatRupiah,
  ListSkeleton,
  SmallSpinner
}) => (
  <>
    <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Biaya Operasional</h2>
    {/* Form Tambah Biaya Operasional */}
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg mb-2">Tambah Biaya Baru</h3>
      <form className="space-y-4" onSubmit={handleAddOperationalCost}>
        <div>
          <label htmlFor="costDescription" className="block text-sm font-medium text-gray-700">Deskripsi Biaya</label>
          <input type="text" id="costDescription" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="costAmount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
          <input type="text" id="costAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            onKeyUp={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, '');
              e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
            }}
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center justify-center"
            disabled={addCostLoading}
          >
            {addCostLoading ? <SmallSpinner /> : null}
            {addCostLoading ? 'Menyimpan...' : 'Tambah Biaya'}
          </button>
        </div>
      </form>
      <p id="addCostMessage" className="text-sm mt-3"></p>
    </div>
    {/* Daftar Biaya Operasional */}
    {loadingCosts ? <ListSkeleton /> : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Biaya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allOperationalCosts.map((cost) => (
              <tr key={cost.CostId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.CostId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.Deskripsi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(cost.Jumlah)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(cost.Tanggal).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => alert('Edit cost: ' + cost.CostId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                  <button onClick={() => alert('Delete cost: ' + cost.CostId)} className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

export default OperationalCostsTab;
