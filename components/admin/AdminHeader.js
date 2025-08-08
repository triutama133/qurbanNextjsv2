import React from "react"

export default function AdminHeader({ profile, handleRefreshAdminDashboard, handleSignOut }) {
  return (
    <header className="bg-indigo-700 shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Qurban" className="h-12 w-auto" style={{maxWidth: 80}} />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            {profile && <p className="text-indigo-200">Selamat datang, {profile.Nama} (Admin)!</p>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefreshAdminDashboard}
            className="text-white hover:text-indigo-200 text-sm font-medium flex items-center space-x-1"
            title="Refresh Data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Refresh</span>
          </button>
          <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">Logout</button>
        </div>
      </div>
    </header>
  )
}
