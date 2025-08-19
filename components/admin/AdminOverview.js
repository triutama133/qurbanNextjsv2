import React from "react"

export default function AdminOverview({ loadingOverview, overallProgramProgress, globalConfig, formatRupiah }) {
  // Calculate profit/loss
  const profitLoss = (overallProgramProgress.confirmedAmount ?? 0) - (overallProgramProgress.totalUsedAmount ?? 0) - (overallProgramProgress.totalCosts ?? 0)

  return (
    <div className="lg:col-span-3 p-6 rounded-xl shadow-lg" style={{ backgroundColor: '#fff' }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#2b6cb0' }}>Overview Program</h2>
      {loadingOverview ? (
        <div>Loading...</div>
      ) : overallProgramProgress && globalConfig ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
          <div style={{ backgroundColor: '#ebf4fb' }} className="p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#718096' }}>Total Dana Tercatat</p>
            <p className="text-2xl font-bold" style={{ color: '#2b6cb0' }}>{formatRupiah(overallProgramProgress.totalCollectedAmount)}</p>
          </div>
          <div style={{ backgroundColor: '#f0fff4' }} className="p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#718096' }}>Dana Terkonfirmasi (Siap Beli)</p>
            <p className="text-2xl font-bold" style={{ color: '#38a169' }}>{formatRupiah(overallProgramProgress.confirmedAmount)}</p>
          </div>
          <div style={{ backgroundColor: '#fff5f5' }} className="p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#718096' }}>Total Dana Terpakai</p>
            <p className="text-2xl font-bold" style={{ color: '#e53e3e' }}>{formatRupiah(overallProgramProgress.totalUsedAmount)}</p>
          </div>
          <div style={{ backgroundColor: '#f7fafc' }} className="p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#718096' }}>Total Biaya Operasional</p>
            <p className="text-2xl font-bold" style={{ color: '#4a5568' }}>{formatRupiah(overallProgramProgress.totalCosts)}</p>
          </div>
          <div style={{ backgroundColor: '#fffbea' }} className="p-4 rounded-lg">
            <p className="text-sm" style={{ color: '#718096' }}>Profit / Loss</p>
            <p className="text-2xl font-bold" style={{ color: profitLoss >= 0 ? '#b7791f' : '#c53030' }}>{formatRupiah(profitLoss)}</p>
          </div>
          <div className="lg:col-span-5 mt-4">
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#38a169' }}>Progress Sapi</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {(() => {
                // Ambil data target dan progress
                const fullTarget = overallProgramProgress.cowStatus?.fullTarget || 6; // fallback 6 sapi
                const hargaSapi = globalConfig?.HargaSapi || 15000000; // fallback harga
                const danaTerkonfirmasi = overallProgramProgress.confirmedAmount || 0;
                // Hitung progress: berapa sapi sudah "terbeli"
                const sapiTerbeli = Math.floor(danaTerkonfirmasi / hargaSapi);
                const persenSapi = Math.min(danaTerkonfirmasi / (fullTarget * hargaSapi), 1);
                return [...Array(fullTarget)].map((_, i) => {
                  let cowColorClass = 'text-gray-300';
                  if (i < sapiTerbeli) {
                    cowColorClass = 'text-green-600';
                  } else if (i === sapiTerbeli && persenSapi < 1 && danaTerkonfirmasi > 0) {
                    cowColorClass = 'text-yellow-400';
                  }
                  return (
                    <span key={i} className={cowColorClass}>
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.5,18A0.5,0.5 0 0,1 11,18.5A0.5,0.5 0 0,1 10.5,19A0.5,0.5 0 0,1 10,18.5A0.5,0.5 0 0,1 10.5,18M13.5,18A0.5,0.5 0 0,1 14,18.5A0.5,0.5 0 0,1 13.5,19A0.5,0.5 0 0,1 13,18.5A0.5,0.5 0 0,1 13.5,18M10,11A1,1 0 0,1 11,12A1,1 0 0,1 10,13A1,1 0 0,1 9,12A1,1 0 0,1 10,11M14,11A1,1 0 0,1 15,12A1,1 0 0,1 14,13A1,1 0 0,1 13,12A1,1 0 0,1 14,11M18,18C18,20.21 15.31,22 12,22C8.69,22 6,20.21 6,18C6,17.1 6.45,16.27 7.2,15.6C6.45,14.6 6,13.35 6,12L6.12,10.78C5.58,10.93 4.93,10.93 4.4,10.78C3.38,10.5 1.84,9.35 2.07,8.55C2.3,7.75 4.21,7.6 5.23,7.9C5.82,8.07 6.45,8.5 6.82,8.96L7.39,8.15C6.79,7.05 7,4 10,3L9.91,3.14V3.14C9.63,3.58 8.91,4.97 9.67,6.47C10.39,6.17 11.17,6 12,6C12.83,6 13.61,6.17 14.33,6.47C15.09,4.97 14.37,3.58 14.09,3.14L14,3C17,4 17.21,7.05 16.61,8.15L17.18,8.96C17.55,8.5 18.18,8.07 18.77,7.9C19.79,7.6 21.7,7.75 21.93,8.55C22.16,9.35 20.62,10.5 19.6,10.78C19.07,10.93 18.42,10.93 17.88,10.78L18,12C18,13.35 17.55,14.6 16.8,15.6C17.55,16.27 18,17.1 18,18M12,16C9.79,16 8,16.9 8,18C8,19.1 9.79,20 12,20C14.21,20 16,19.1 16,18C16,16.9 14.21,16 12,16M12,14C13.12,14 14.17,14.21 15.07,14.56C15.65,13.87 16,13 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13 8.35,13.87 8.93,14.56C9.83,14.21 10.88,14 12,14M14.09,3.14V3.14Z" />
                      </svg>
                    </span>
                  );
                });
              })()}
            </div>
            {/* Progress bar di bawah icon sapi */}
            <div className="w-full max-w-md mx-auto mt-2">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-green-500 rounded-full"
                  style={{ width: `${Math.round((overallProgramProgress.confirmedAmount || 0) / ((overallProgramProgress.cowStatus?.fullTarget || 6) * (globalConfig?.HargaSapi || 15000000)) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1 text-center">
                Progress: {formatRupiah(overallProgramProgress.confirmedAmount || 0)} / {formatRupiah((overallProgramProgress.cowStatus?.fullTarget || 6) * (globalConfig?.HargaSapi || 15000000))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total User Terdaftar: {overallProgramProgress.totalUsers}
              <br />
              Verified User (Sudah Setoran Awal): {overallProgramProgress.verifiedInitialDepositUsers}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Data overview belum tersedia.</p>
      )}
    </div>
  )
}
