// components/dashboard/ProfileCard.js
import React from 'react';
import { CardSkeleton } from '@/components/common/Skeletons'; // Asumsi Skeletons dipindah

export default function ProfileCard({ loading, profile }) {
  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Pequrban</h2>
      {profile ? (
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Nama Pequrban:</strong> {profile.NamaPequrban || profile.Nama}
          </p>
          <p>
            <strong>Status Pequrban:</strong>{' '}
            <span className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {profile.StatusPequrban || 'Normal'}
            </span>
          </p>
          {profile.Benefits && profile.Benefits.length > 0 ? (
            <div>
              <strong>Benefit Anda:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                {profile.Benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada benefit yang ditetapkan.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Profil tidak ditemukan.</p>
      )}
    </div>
  );
}