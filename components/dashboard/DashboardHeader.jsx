"use client"

export default function DashboardHeader({ profile, handleRefreshDashboard, handleSignOut }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Dashboard Tabungan Qurban</h1>
          {profile && <p className="text-gray-600">Selamat datang, {profile.Nama}!</p>}
        </div>
        <div className="flex items-center space-x-4">
          <a href="/settings" className="text-sm font-medium text-gray-600 hover:text-green-700">
            Pengaturan Akun
          </a>
          <button
            onClick={handleRefreshDashboard}
            className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center space-x-1"
            title="Refresh Data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
