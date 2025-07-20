// File: app/components/dashboard/DocumentsResourcesCard.js
"use client";
import React from 'react';
import { ListSkeleton } from '@/components/common/Skeletons';

export default function DocumentsResourcesCard({ loading, documents }) {
  if (loading) {
    return <ListSkeleton />;
  }

  const getButtonText = (type) => {
    switch (type) {
      case 'PDF': return 'Unduh';
      case 'WhatsApp': return 'Gabung';
      default: return 'Buka';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-800';
      case 'Link': return 'bg-blue-100 text-blue-800';
      case 'WhatsApp': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Dokumen & Sumber Daya</h2>
      <div className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.ResourceId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{doc.Title}</h3>
                  {doc.Description && <p className="text-sm text-gray-600 mt-1">{doc.Description}</p>}
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(doc.Type)}`}>
                      {doc.Type}
                    </span>
                    {doc.CreatedAt && (
                      <span className="text-xs text-gray-500">{new Date(doc.CreatedAt).toLocaleDateString("id-ID")}</span>
                    )}
                  </div>
                </div>
                <a href={doc.ResourceUrl} target="_blank" rel="noopener noreferrer" className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 flex-shrink-0">
                  {getButtonText(doc.Type)}
                </a>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Belum ada dokumen atau sumber daya tersedia.</p>
        )}
      </div>
    </div>
  );
}