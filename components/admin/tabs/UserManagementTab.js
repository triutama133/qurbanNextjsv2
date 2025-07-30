import React from "react";

const UserManagementTab = ({ loadingUsers, allUsers, ListSkeleton }) => (
  <>
    <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Pengguna</h2>
    {loadingUsers ? <ListSkeleton /> : (
      allUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pequrban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Setoran Awal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allUsers.map((userItem) => (
                <tr key={userItem.UserId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.UserId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.NamaPequrban || userItem.Nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.Email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.Role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userItem.InitialDepositStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                      userItem.InitialDepositStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {userItem.InitialDepositStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => alert('Edit user: ' + userItem.UserId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onClick={() => alert('View details: ' + userItem.UserId)} className="text-gray-600 hover:text-gray-900">Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Belum ada pengguna terdaftar.</p>
      )
    )}
  </>
);

export default UserManagementTab;
