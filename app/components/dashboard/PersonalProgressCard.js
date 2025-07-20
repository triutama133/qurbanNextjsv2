// File: app/components/dashboard/PersonalProgressCard.js
"use client";
import React from 'react';
import { CardSkeleton } from '@/components/common/Skeletons';

export default function PersonalProgressCard({ loading, profile, globalConfig, personalTotalRecorded, personalUsed, personalTransferred, rekomendasiTabungPerBulan, formatRupiah }) {
  if (loading) {
    return <CardSkeleton />;
  }

  const targetPribadi = profile?.TargetPribadi || globalConfig?.TargetPribadiDefault || 0;
  const currentNetSaving = personalTotalRecorded - personalUsed;
  const progressPercentage = targetPribadi > 0 ? Math.min(((currentNetSaving / targetPribadi) * 100), 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">
            Progress menuju target {formatRupiah(targetPribadi)}
            {globalConfig?.TanggalTargetQurban && ` (Target: ${new Date(globalConfig.TanggalTargetQurban).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})})`}
          </span>
        </div>
        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
          <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"></div>
        </div>
      </div>
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
          <p className="text-sm text-gray-500">Ditransfer ke Panitia</p>
          <p className="text-2xl font-bold text-blue-600">{formatRupiah(personalTransferred)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Dana Sisa Tabungan</p>
          <p className="text-2xl font-bold text-gray-700">{formatRupiah(personalTotalRecorded - personalUsed - personalTransferred)}</p>
        </div>
      </div>
      {profile && (
        <div className="mt-4 text-sm" id="personal-info">
          <p>Metode Anda: <span className="font-semibold">{profile.MetodeTabungan}</span></p>
          {rekomendasiTabungPerBulan > 0 && (
            <p className="mt-2 text-base text-gray-700">Rekomendasi tabung per bulan: <span className="font-bold text-green-700">{formatRupiah(rekomendasiTabungPerBulan)}</span></p>
          )}
        </div>
      )}
    </div>
  );
}