"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMsg("Token verifikasi tidak ditemukan di URL.");
      setMsgType("error");
      setLoading(false);
      return;
    }
    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) {
          setMsg(result.error || "Token tidak valid/kadaluarsa.");
          setMsgType("error");
        } else {
          setMsg("Email berhasil diverifikasi! Silakan login.");
          setMsgType("success");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
        setLoading(false);
      })
      .catch((err) => {
        setMsg("Gagal verifikasi email: " + err.message);
        setMsgType("error");
        setLoading(false);
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Verifikasi Email</h2>
        {loading ? (
          <div className="text-center text-gray-500">Memproses...</div>
        ) : (
          <div className={`text-center text-lg ${msgType === "success" ? "text-green-600" : "text-red-600"}`}>{msg}</div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
