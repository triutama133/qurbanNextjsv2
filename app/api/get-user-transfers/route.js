
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
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from("transfer_confirmations")
    .select("*")
    .eq("UserId", userId)
    .order("Timestamp", { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate signed URL untuk setiap file bukti transfer (jika ada field fileName/file_path)
  let result = []
  if (!storage) {
    // Jika storage gagal diinisialisasi, tetap kirim data tanpa ProofLink
    result = data.map(item => ({ ...item, ProofLink: null }))
  } else {
    result = await Promise.all(
      data.map(async item => {
        // Ganti field sesuai nama field path file di database, misal: item.fileName atau item.file_path
        const filePath = item.fileName || item.file_path || item.proof_path
        let ProofLink = null
        if (filePath) {
          try {
            const bucket = storage.bucket(GCS_BUCKET_NAME)
            const file = bucket.file(filePath)
            const [signedUrl] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
            })
            ProofLink = signedUrl
          } catch (e) {
            ProofLink = null
          }
        }
        return { ...item, ProofLink }
      })
    )
  }
  return NextResponse.json(result)
}
