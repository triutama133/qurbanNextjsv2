//
// Contoh payload JSON yang harus dikirim frontend:
// {
//   "fileName": "dokumen.pdf",
//   "fileType": "application/pdf",
//   "fileData": "<base64 string>",
//   "UserId": "isi_dengan_UserId_yang_valid",
//   "title": "Judul Dokumen",
//   "description": "Deskripsi opsional"
// }

import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const GCS_CREDENTIALS_JSON_STRING = process.env.GCS_CREDENTIALS_JSON;

let storage;
try {
  if (!GCS_BUCKET_NAME) throw new Error("GCS_BUCKET_NAME environment variable is not set.");
  if (!GCS_CREDENTIALS_JSON_STRING) throw new Error("GCS_CREDENTIALS_JSON environment variable is not set.");
  let credentials;
  try {
    credentials = JSON.parse(GCS_CREDENTIALS_JSON_STRING);
  } catch (jsonError) {
    console.error("Invalid JSON in GCS_CREDENTIALS_JSON:", jsonError.message);
    throw new Error("GCS_CREDENTIALS_JSON is not valid JSON format");
  }
  storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  });
} catch (error) {
  console.error("Error initializing Google Cloud Storage:", error.message);
  storage = null;
}

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!storage) {
    console.error("GCS storage not initialized");
    return NextResponse.json({ error: "Gagal menginisialisasi Cloud Storage. Cek kredensial server." }, { status: 500 });
  }
  try {
    const body = await req.json();
    const { fileName, fileType, fileData, UserId, title, description } = body;

    if (!fileName || !fileType || !fileData || !UserId || !title) {
      return NextResponse.json({ error: "Data file tidak lengkap (fileName, fileType, fileData, UserId, title wajib diisi)." }, { status: 400 });
    }

    const timestamp = Date.now();
    const fileExt = fileName.split(".").pop();
    const fileNameInGCS = `user_documents/${UserId}/${timestamp}_${fileName}`;
    const buffer = Buffer.from(fileData, "base64");

    const bucket = storage.bucket(GCS_BUCKET_NAME);
    const gcsFile = bucket.file(fileNameInGCS);
    await gcsFile.save(buffer, { metadata: { contentType: fileType } });
    const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileNameInGCS}`;

    // Simpan metadata ke database (gunakan Supabase REST API)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL atau Service Role Key belum diatur");
      return NextResponse.json({ error: "Supabase URL atau Service Role Key belum diatur di environment." }, { status: 500 });
    }
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/user_documents`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        UserId,
        title,
        description,
        file_url: publicUrl,
        file_type: fileExt,
      })
    });
    const insertData = await insertRes.json();
    if (!insertRes.ok) {
      console.error("Gagal insert metadata ke Supabase:", insertData);
      return NextResponse.json({ error: insertData?.message || "Gagal menyimpan metadata dokumen." }, { status: 500 });
    }

    return NextResponse.json({ success: true, file_url: publicUrl }, { status: 200 });
  } catch (err) {
    console.error("UPLOAD USER DOCUMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
