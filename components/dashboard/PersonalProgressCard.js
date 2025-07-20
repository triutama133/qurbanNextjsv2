// components/dashboard/PersonalProgressCard.js
"use client";

import React from 'react';
import { CardSkeleton } from '@/components/common/Skeletons'; // Pastikan alias ini benar
import { formatRupiah, getMonthDifference } from '@/lib/utils'; // Pastikan alias ini benar

export default function PersonalProgressCard({ 
  profile, 
  globalConfig, 
  personalTotalRecorded, 
  personalUsed, 
  personalTransferred, 
  loadingPersonal 
}) {
  if (loadingPersonal) {
    return <CardSkeleton />;
  }

  if (!profile || !globalConfig) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
        <p className="text-gray-500">Data capaian pribadi tidak tersedia.</p>
      </div>
    );
  }

  // Rekomendasi Tabung Per Bulan
  const targetDateGlobal = globalConfig?.TanggalTargetQurban ? new Date(globalConfig.TanggalTargetQurban) : null;
  const today = new Date();
  let rekomendasiTabungPerBulan = 0;
  const currentNetSaving = personalTotalRecorded - personalUsed; // Dana tercatat yang bersih dari penggunaan
  const remainingToTarget = (profile.TargetPribadi || globalConfig.TargetPribadiDefault || 0) - currentNetSaving;

  if (targetDateGlobal && targetDateGlobal > today && remainingToTarget > 0) {
    const remainingMonths = getMonthDifference(today, targetDateGlobal);
    if (remainingMonths > 0) {
        rekomendasiTabungPerBulan = remainingToTarget / remainingMonths;
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
      <div id="personal-progress-container">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span id="personal-target-text" className="text-xs font-semibold inline-block text-gray-600">
                Progress menuju target {formatRupiah(profile.TargetPribadi || globalConfig.TargetPribadiDefault || 0)}
                {globalConfig.TanggalTargetQurban && (
                    ` (Target: ${new Date(globalConfig.TanggalTargetQurban).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})})`
                )}
              </span>
            </div>
          </div>
          {/* Progress Bar berdasarkan total tercatat (setoran - penggunaan) */}
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
            <div
              id="personal-progress-bar"
              style={{ width: `${(profile.TargetPribadi || globalConfig.TargetPribadiDefault) > 0 ? Math.min(((personalTotalRecorded - personalUsed) / (profile.TargetPribadi || globalConfig.TargetPribadiDefault)) * 100, 100) : 0}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>
        {/* Visualisasi Angka Capaian Pribadi yang Lebih Menarik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Tabungan Tercatat</p>
                <p className="text-2xl font-bold text-green-700">{formatRupiah(personalTotalRecorded)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Dana Terpakai</p>
                <p className="text-2xl font-bold text-red-600">{formatRupiah(personalUsed)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Ditransfer ke Panitia Qurban</p>
                <p className="text-2xl font-bold text-blue-600">{formatRupiah(personalTransferred)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                    Dana Sisa Tabungan <span className="text-gray-400 text-xs">*</span>
                </p>
                <p className="text-2xl font-bold text-gray-700">
                    {formatRupiah(personalTotalRecorded - personalUsed - personalTransferred)}
                </p>
            </div>
        </div>

        {profile && (
            <div className="mt-4 text-sm" id="personal-info">
                <p>Metode Anda: <span className="font-semibold">{profile.MetodeTabungan}</span></p>
                {rekomendasiTabungPerBulan > 0 && (
                    <p className="mt-2 text-base text-gray-700">
                    Rekomendasi tabung per bulan: <span className="font-bold text-green-700">{formatRupiah(rekomendasiTabungPerBulan)}</span>
                    </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    <span className="font-bold">* Dana Sisa Tabungan</span>: Dana Tercatat dikurangi Dana Terpakai.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}