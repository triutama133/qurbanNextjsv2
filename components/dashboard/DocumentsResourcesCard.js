// components/dashboard/DocumentsResourcesCard.js
"use client";

import React from 'react';
import { ListSkeleton } from '@/components/common/Skeletons'; // Pastikan alias ini benar

export default function DocumentsResourcesCard({ documents, loadingDocuments }) {
  if (loadingDocuments) {
    return <ListSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Dokumen & Sumber Daya</h2>
      <div className="space-y-3">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.ResourceId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{doc.Title}</h3>
                  {doc.Description && <p className="text-sm text-gray-600 mt-1">{doc.Description}</p>}
                  <div className="flex items-center mt-2 space-x-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.Type === "PDF"
                          ? "bg-red-100 text-red-800"
                          : doc.Type === "Link"
                            ? "bg-blue-100 text-blue-800"
                            : doc.Type === "WhatsApp"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {doc.Type}
                    </span>
                    {doc.CreatedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(doc.CreatedAt).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={doc.ResourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 flex-shrink-0"
                >
                  {doc.Type === "PDF" ? "Unduh" : doc.Type === "WhatsApp" ? "Gabung" : "Buka"}
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