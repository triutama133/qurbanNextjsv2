// app/api/upload-file/route.js
import { Storage } from "@google-cloud/storage"
import { NextResponse } from "next/server"

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME
const GCS_CREDENTIALS_JSON_STRING = process.env.GCS_CREDENTIALS_JSON

// Inisialisasi Google Cloud Storage client
let storage
try {
  if (!GCS_BUCKET_NAME) {
    throw new Error("GCS_BUCKET_NAME environment variable is not set.")
  }
  if (!GCS_CREDENTIALS_JSON_STRING) {
    throw new Error("GCS_CREDENTIALS_JSON environment variable is not set.")
  }

  // Perbaikan: Validasi format JSON sebelum parsing
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

export async function POST(request) {
  if (!storage) {
    return NextResponse.json({ error: "Gagal menginisialisasi Cloud Storage. Cek kredensial server." }, { status: 500 })
  }

  try {
    const formData = await request.json()
    // Ambil userId dan transactionId dari frontend untuk membuat path file yang terorganisir
    const { name, mimeType, data, userId, transactionId } = formData

    if (!name || !mimeType || !data || !userId || !transactionId) {
      return NextResponse.json(
        { error: "Data file tidak lengkap (nama, mimeType, data, userId, atau transactionId hilang)." },
        { status: 400 },
      )
    }

    const bucket = storage.bucket(GCS_BUCKET_NAME)

    // Buat nama file unik untuk mencegah konflik dan mengorganisir berdasarkan user/transaksi
    // Path file di GCS akan menjadi: userId/transactionId/nama_file_asli_timestamp.ext
    const timestamp = Date.now()
    const originalFileExtension = name.split(".").pop()
    const fileNameInGCS = `${userId}/${transactionId}/${name.replace(/\.[^/.]+$/, "")}_${timestamp}.${originalFileExtension}`

    const fileBuffer = Buffer.from(data, "base64")

    const file = bucket.file(fileNameInGCS)

    await file.save(fileBuffer, {
      metadata: { contentType: mimeType },
      // public: true // HAPUS baris ini!
    })

    // Mendapatkan URL publik dari file yang diunggah
    const publicUrl = `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${fileNameInGCS}`

    return NextResponse.json(
      {
        success: true,
        fileUrl: publicUrl,
        fileName: fileNameInGCS, // Nama file lengkap di GCS
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error uploading file to GCS:", error)
    let errorMessage = "Gagal mengunggah file. Terjadi kesalahan server."
    if (error.code === 403) {
      errorMessage =
        'Izin GCS ditolak. Pastikan Service Account memiliki peran "Storage Object Creator" dan "Storage Object Viewer" di bucket.'
    } else if (error.message.includes("bucket")) {
      errorMessage = "Nama bucket GCS tidak valid atau tidak ada."
    } else if (error.message.includes("JSON") || error.message.includes("credentials")) {
      // Tangkap error kredensial lebih luas
      errorMessage = "Gagal memuat kredensial GCS. Format kredensial di environment variable salah atau tidak lengkap."
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
