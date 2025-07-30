import React from "react";

const ContentManagementTab = ({ loadingContent, allResources, allMilestones, allNewsletters, CardSkeleton }) => (
  <>
    <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Konten</h2>
    {loadingContent ? <CardSkeleton /> : (
      <div className="space-y-6">
        {/* Dokumen & Sumber Daya */}
        <h3 className="font-semibold text-lg mb-2">Dokumen & Sumber Daya</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global/User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allResources.map((resource) => (
                <tr key={resource.ResourceId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.Type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.IsGlobal ? 'Global' : 'User'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href={resource.Link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">Lihat</a>
                    <button onClick={() => alert('Edit resource: ' + resource.ResourceId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onClick={() => alert('Delete resource: ' + resource.ResourceId)} className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Milestone Program */}
        <h3 className="font-semibold text-lg mb-2 mt-8">Milestone Program</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan & Tahun</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allMilestones.map((milestone) => (
                <tr key={milestone.MilestoneId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.Month} {milestone.Year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.Activity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert('Edit milestone: ' + milestone.MilestoneId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onClick={() => alert('Delete milestone: ' + milestone.MilestoneId)} className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Berita & Informasi */}
        <h3 className="font-semibold text-lg mb-2 mt-8">Berita & Informasi</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allNewsletters.map((newsItem) => (
                <tr key={newsItem.NewsletterId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{newsItem.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{newsItem.AuthorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(newsItem.DatePublished).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert('Edit news: ' + newsItem.NewsletterId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onClick={() => alert('Delete news: ' + newsItem.NewsletterId)} className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
);

export default ContentManagementTab;
