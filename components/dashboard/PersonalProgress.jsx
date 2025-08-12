"use client";
import { CardSkeleton } from "./LoadingSkeletons"

export default function PersonalProgress({
  profile,
  globalConfig,
  personalTotalRecorded,
  personalUsed,
  personalTransferred,
  loadingPersonal,
  formatRupiah,
  getMonthDifference,
  allPersonalTransferConfirmations,
}) {
  if (loadingPersonal) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
        <CardSkeleton />
      </div>
    )
  }


  // Perhitungan transferred: hanya Setoran Awal Approved dan Pelunasan Approved
  let totalTransferred = 0;
  let totalSetoranAwal = 0;
  let totalPelunasan = 0;
  const transferData = Array.isArray(allPersonalTransferConfirmations) && allPersonalTransferConfirmations.length > 0
    ? allPersonalTransferConfirmations
    : (profile && Array.isArray(profile.transferConfirmations) ? profile.transferConfirmations : []);
  totalSetoranAwal = transferData
    .filter(item => item.Status === "Approved" && item.Type?.toLowerCase() === "setoran awal")
    .reduce((sum, item) => sum + (item.Amount || 0), 0);
  totalPelunasan = transferData
    .filter(item => item.Status === "Approved" && item.Type?.toLowerCase() === "pelunasan")
    .reduce((sum, item) => sum + (item.Amount || 0), 0);
  totalTransferred = totalSetoranAwal + totalPelunasan;

  // Rekomendasi Tabung Per Bulan
  const targetDateGlobal = globalConfig?.TanggalTargetQurban ? new Date(globalConfig.TanggalTargetQurban) : null
  const today = new Date()
  let rekomendasiTabungPerBulan = 0
  const currentNetSaving = personalTotalRecorded - personalUsed
  const targetPribadi = profile?.TargetPribadi || globalConfig?.TargetPribadiDefault || 0;
  const jumlahPequrban = profile?.JumlahPequrban || 1;
  const targetTotal = targetPribadi * jumlahPequrban;
  const remainingToTarget = targetTotal - currentNetSaving;

  if (targetDateGlobal && targetDateGlobal > today && remainingToTarget > 0) {
    const remainingMonths = getMonthDifference(today, targetDateGlobal)
    if (remainingMonths > 0) {
      rekomendasiTabungPerBulan = remainingToTarget / remainingMonths
    }
  }

  // Notifikasi jika capaian sudah mencapai target (net saving)
  const sudahCapaiTarget = currentNetSaving >= targetTotal && targetTotal > 0;
  // Notifikasi jika sudah transfer ke panitia
  const sudahTransferKePanitia = totalTransferred >= targetTotal && targetTotal > 0;
  // Notifikasi jika setoran awal kurang dari target setoran awal
  const initialDepositPerPequrban = globalConfig?.InitialDepositAmount || 300000;
  const targetSetoranAwal = initialDepositPerPequrban * jumlahPequrban;
  const setoranAwalKurang = totalSetoranAwal < targetSetoranAwal;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-black">
      <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
      {/* Notifikasi: jika sudah transfer ke panitia, tampilkan ini saja */}
      {setoranAwalKurang ? (
        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
            <div>
              <span className="font-semibold text-yellow-800">Setoran awal Anda masih kurang dari target setoran awal. Silakan upload bukti setoran tambahan.</span>
              <div className="text-yellow-700 text-sm mt-1">Total setoran awal disetujui: <b>{formatRupiah(totalSetoranAwal)}</b> / Target: <b>{formatRupiah(targetSetoranAwal)}</b></div>
            </div>
          </div>
        </div>
      ) : sudahTransferKePanitia ? (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
            <div>
              <span className="font-semibold text-blue-800">Selamat Tabungan Kamu sudah di transfer ke panitia dan tercatat lunas.</span>
              <div className="text-blue-700 text-sm mt-1">Terima kasih sudah bergabung dalam program ini. Sampai jumpa di program selanjutnya ya!</div>
            </div>
          </div>
        </div>
      ) : sudahCapaiTarget ? (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
            <div>
              <span className="font-semibold text-blue-800">Selamat! Tabungan Kamu sudah mencapai target.</span>
              <div className="text-blue-700 text-sm mt-1">Segera lakukan transfer pelunasan ke panitia agar status Kamu tercatat lunas.</div>
            </div>
          </div>
        </div>
      ) : null}
      <div id="personal-progress-container">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-gray-600">
                Progress menuju target {formatRupiah(targetTotal)}
                {globalConfig?.TanggalTargetQurban &&
                  ` (Target: ${new Date(globalConfig.TanggalTargetQurban).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })})`}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{
                width: `${
                  targetTotal > 0
                    ? Math.min(
                        ((personalTotalRecorded - personalUsed) / targetTotal) * 100,
                        100,
                      )
                    : 0
                }%`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Tabungan Tercatat</p>
            <p className="text-2xl font-bold text-green-700">{formatRupiah(personalTotalRecorded)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Tabungan Terpakai</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(personalUsed)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Ditransfer ke Panitia Qurban</p>
            <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalTransferred)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">
              Dana Sisa Tabungan <span className="text-gray-400 text-xs">*</span>
            </p>
            <p className="text-2xl font-bold text-gray-700">
              {formatRupiah(personalTotalRecorded - personalUsed)}
            </p>
          </div>
        </div>

        {profile && (
          <div className="mt-4 text-sm">
            <p>
              Metode Anda: <span className="font-semibold">{profile.MetodeTabungan}</span>
            </p>
            {rekomendasiTabungPerBulan > 0 && (
              <p className="mt-2 text-base text-gray-700">
                Rekomendasi tabung per bulan:{" "}
                <span className="font-bold text-green-700">{formatRupiah(rekomendasiTabungPerBulan)}</span>
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              <span className="font-bold">* Dana Sisa Tabungan</span>: Tabungan Tercatat (Termasuk Setoran Awal) dikurangi Tabungan Terpakai.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
