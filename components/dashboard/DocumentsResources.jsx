"use client";

import React, { useRef, useState, useEffect } from "react";
import { ListSkeleton } from "./LoadingSkeletons";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose, // tetap diimport kalau nanti ingin dipakai
} from "../ui/dialog";

/**
 * Komponen Dokumen & Link
 * - Tetap memuat: upload dokumen (modal), daftar dokumen user, dan daftar dokumen/link umum.
 * - Props:
 *    - documents: array dokumen/link umum
 *    - loadingDocuments: boolean loading untuk dokumen/link umum
 */
export default function DocumentsAndLinks({
  documents = [],
  loadingDocuments = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [loadingUserDocs, setLoadingUserDocs] = useState(false);
  const formRef = useRef(null);

  // Ambil user_id dari localStorage/session (atau props jika sudah ada)
  const user_id =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : "";

  // Fetch dokumen milik user
  useEffect(() => {
    if (!user_id) return;
    setLoadingUserDocs(true);
    fetch(`/api/get-user-documents?user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setUserDocuments(data.documents || []);
        setLoadingUserDocs(false);
      })
      .catch(() => setLoadingUserDocs(false));
  }, [user_id, uploadSuccess]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");
    setUploading(true);

    try {
      const form = formRef.current;
      const fileInput = form.querySelector('input[name="file"]');
      const file = fileInput.files[0];
      if (!file) {
        setUploadError("File wajib diisi");
        setUploading(false);
        return;
      }
      // Convert file to base64
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // Remove prefix: data:<type>;base64,
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
      });
      const fileData = await toBase64(file);

      const payload = {
        fileName: file.name,
        fileType: file.type,
        fileData,
        UserId: user_id,
        title: form.title.value,
        description: form.description.value,
      };

      console.log("Payload upload dokumen:", payload);
      const res = await fetch("/api/upload-user-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadSuccess("Dokumen berhasil diupload!");
        if (formRef.current) formRef.current.reset();
        setOpen(false);
      } else {
        setUploadError(data.error || "Gagal upload dokumen");
      }
    } catch (err) {
      setUploadError("Gagal upload dokumen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg text-black">
      <h2 className="text-xl font-bold mb-4 text-black">Dokumen & Link</h2>

      {/* Tombol buka modal upload dokumen */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Upload Dokumen
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Upload Dokumen</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Judul Dokumen
              </label>
              <input
                name="title"
                type="text"
                required
                className="w-full border rounded px-3 py-2 text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Deskripsi (opsional)
              </label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2 text-black bg-white"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                File
              </label>
              <input
                name="file"
                type="file"
                required
                className="w-full border rounded px-3 py-2 text-black bg-white"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {uploading ? "Mengupload..." : "Upload Dokumen"}
            </button>
            {uploadError && (
              <p className="text-red-600 text-sm mt-1">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-green-600 text-sm mt-1">{uploadSuccess}</p>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* List dokumen milik user */}
      {user_id && (
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-2">Dokumen Saya</h3>
          {loadingUserDocs ? (
            <ListSkeleton />
          ) : userDocuments.length > 0 ? (
            <div className="space-y-2">
              {userDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-black">{doc.title}</div>
                    {doc.description && (
                      <div className="text-sm text-gray-600">
                        {doc.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(doc.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                  >
                    Unduh
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Belum ada dokumen yang diupload.
            </div>
          )}
        </div>
      )}

  {/* Divider antara dokumen saya dan dokumen/link umum */}
  <div className="my-8 border-t border-gray-200" />

  {/* Judul section dokumen/link umum */}
  <h3 className="text-base font-semibold mb-2">Dokumen & Link Umum</h3>

      {/* List dokumen/link umum */}
      {loadingDocuments ? (
        <ListSkeleton />
      ) : (
        <div className="space-y-3">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.ResourceId || doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {doc.Title || doc.title}
                    </h3>
                    {(doc.Description || doc.description) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {doc.Description || doc.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (doc.Type || doc.file_type) === "PDF"
                            ? "bg-red-100 text-red-800"
                            : (doc.Type || doc.file_type) === "Link"
                            ? "bg-blue-100 text-blue-800"
                            : (doc.Type || doc.file_type) === "WhatsApp"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.Type || doc.file_type}
                      </span>
                      {(doc.CreatedAt || doc.created_at) && (
                        <span className="text-xs text-gray-500">
                          {new Date(
                            doc.CreatedAt || doc.created_at
                          ).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={doc.ResourceUrl || doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 flex-shrink-0"
                  >
                    {(doc.Type || doc.file_type) === "PDF"
                      ? "Unduh"
                      : (doc.Type || doc.file_type) === "WhatsApp"
                      ? "Gabung"
                      : "Buka"}
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              Belum ada dokumen atau sumber daya tersedia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
