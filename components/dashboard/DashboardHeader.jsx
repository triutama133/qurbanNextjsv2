"use client"

export default function DashboardHeader({ profile, handleRefreshDashboard, handleSignOut, handleGoToHelpDesk, children }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 w-full">
          <div className="flex justify-center sm:justify-start">
            <img src="/logo.png" alt="Logo Qurban" className="h-28 w-auto" style={{maxWidth: 180}} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#E53935] text-center sm:text-left w-full">Dashboard Tabungan Qurban Keluarga Peduli</h1>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-center sm:text-left">
            {profile && <p className="text-gray-600">Selamat datang, {profile.Nama}!</p>}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            {children}
            <a
              href="/qurban/settings"
              className="inline-flex items-center justify-center border border-gray-300 bg-white text-sm font-medium text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-green-50 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Pengaturan Akun
            </a>
            <button
              id="refresh-dashboard-btn"
              onClick={handleRefreshDashboard}
              className="inline-flex items-center justify-center border border-gray-300 bg-white text-sm font-medium text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-green-50 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 gap-1"
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
            {/* Tombol Help Desk di antara Refresh dan Logout */}
            <button
              onClick={handleGoToHelpDesk}
              className="inline-flex items-center justify-center border border-gray-300 bg-white text-sm font-medium text-indigo-700 px-4 py-2 rounded-md shadow-sm hover:bg-indigo-50 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              title="Help Desk"
            >
              Help Desk
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
