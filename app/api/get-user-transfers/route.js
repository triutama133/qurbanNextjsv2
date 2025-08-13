
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME
const GCS_CREDENTIALS_JSON_STRING = process.env.GCS_CREDENTIALS_JSON

let storage
try {
  if (!GCS_BUCKET_NAME) throw new Error("GCS_BUCKET_NAME environment variable is not set.")
  if (!GCS_CREDENTIALS_JSON_STRING) throw new Error("GCS_CREDENTIALS_JSON environment variable is not set.")
  let credentials
  try {
    credentials = JSON.parse(GCS_CREDENTIALS_JSON_STRING)
  } catch (jsonError) {
    console.error("Invalid JSON in GCS_CREDENTIALS_JSON:", jsonError.message)
    throw new Error("GCS_CREDENTIALS_JSON is not valid JSON format")
  }
  storage = new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key.replace(/\\n/g, "\n"),
    },
  })
} catch (error) {
  console.error("Error initializing Google Cloud Storage:", error.message)
  storage = null
}

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GET /api/get-user-transfers?userId=xxx
export async function GET(request) {
  // ...existing code...
  // (pindahkan log ke bawah setelah deklarasi setoranAwal dan pelunasan)
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 })
  }
  // Ambil transfer_confirmations (pelunasan) dan tabungan (setoran awal)
  const [transferRes, tabunganRes] = await Promise.all([
    supabaseAdmin
      .from("transfer_confirmations")
      .select("*")
      .eq("UserId", userId),
    supabaseAdmin
      .from("tabungan")
      .select("*")
      .eq("UserId", userId)
  ]);

  if (transferRes.error) {
    return NextResponse.json({ error: transferRes.error.message }, { status: 500 })
  }
  if (tabunganRes.error) {
    return NextResponse.json({ error: tabunganRes.error.message }, { status: 500 })
  }


  // Format pelunasan (transfer_confirmations)
  const pelunasan = transferRes.data.map(item => ({
    ...item,
    Type: item.Type || "Pelunasan",
    Amount: item.Amount,
    Timestamp: item.Timestamp || item.created_at,
    Status: item.Status,
    ProofLink: item.ProofLink || item.fileName || item.file_path || item.proof_path || null,
    ConfirmationId: item.ConfirmationId || `pelunasan-${item.id}`,
  }));

  // Format setoran awal (tabungan): hanya Metode 'Setoran Awal' dan Tipe 'Setoran', semua status
  const setoranAwal = tabunganRes.data
    .filter(item =>
      (item.Metode || '').toLowerCase() === 'setoran awal' &&
      (item.Tipe || '').toLowerCase() === 'setoran'
    )
    .map(item => {
      let amount = item.Jumlah ?? item.Amount ?? 0;
      let status = item.VerificationStatus ?? item.Status ?? "";
      let tanggal = item.Tanggal || item.Timestamp || item.created_at;
      if (!tanggal || isNaN(new Date(tanggal).getTime())) {
        tanggal = item.created_at;
      }
      // Gunakan TransaksiId sebagai ConfirmationId jika tidak ada
      let confirmationId = item.ConfirmationId || item.TransaksiId || `setoranawal-${item.id}`;
      return {
        ...item,
        Type: "Setoran Awal",
        Amount: amount,
        Timestamp: tanggal,
        Status: status,
        ProofLink: item.ProofLink || item.fileName || item.file_path || item.proof_path || null,
        ConfirmationId: confirmationId,
      };
    });

  // DEBUG LOG: tampilkan di terminal setelah inisialisasi
  console.log('[API get-user-transfers] setoranAwal:', JSON.stringify(setoranAwal, null, 2));
  console.log('[API get-user-transfers] pelunasan:', JSON.stringify(pelunasan, null, 2));

  // Gabungkan dan urutkan berdasarkan Timestamp DESC
  let all = [...pelunasan, ...setoranAwal];
  all.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

  // Generate signed URL untuk setiap file bukti transfer (jika ada field fileName/file_path)
  let result = [];
  if (!storage) {
    result = all.map(item => ({ ...item, ProofLink: null }));
  } else {
    result = await Promise.all(
      all.map(async item => {
        let ProofLink = null;
        if (item.ProofLink && item.ProofLink.startsWith('http')) {
          ProofLink = item.ProofLink;
        } else {
          const filePath = item.ProofLink;
          if (filePath) {
            try {
              const bucket = storage.bucket(GCS_BUCKET_NAME);
              const file = bucket.file(filePath);
              const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
              });
              ProofLink = signedUrl;
            } catch (e) {
              ProofLink = null;
            }
          }
        }
        return { ...item, ProofLink };
      })
    );
  }
  return NextResponse.json(result)
}
