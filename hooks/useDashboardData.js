"use client"

import { useState, useCallback } from "react"

export function useDashboardData() {
  // States
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [appConfig, setAppConfig] = useState(null)
  const [personalTotalRecorded, setPersonalTotalRecorded] = useState(0)
  const [personalUsed, setPersonalUsed] = useState(0)
  const [personalTransferred, setPersonalTransferred] = useState(0)
  const [personalSavingHistory, setPersonalSavingHistory] = useState([])
  const [personalTransferConfirmations, setPersonalTransferConfirmations] = useState([]) // hanya Approved
  const [allPersonalTransferConfirmations, setAllPersonalTransferConfirmations] = useState([]) // semua status
  const [userHelpDeskTickets, setUserHelpDeskTickets] = useState([])
  const [news, setNews] = useState([])
  const [milestones, setMilestones] = useState(null)
  const [documents, setDocuments] = useState([])
  const [newsPage, setNewsPage] = useState(1)
  const [newsTotal, setNewsTotal] = useState(0)

  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAppConfig, setLoadingAppConfig] = useState(true)
  const [loadingPersonal, setLoadingPersonal] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingMilestones, setLoadingMilestones] = useState(true)
  const [loadingHelpDeskTickets, setLoadingHelpDeskTickets] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(true)

  // Error State
  const [error, setError] = useState(null)

  // Constants
  const NEWS_PER_PAGE = 3

  // Fetch Functions
  // Ambil user dari localStorage dan redirect jika tidak ada
  const fetchUserAndInit = useCallback((router) => {
    setError(null)
    setLoadingInitial(true)
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem("qurban_user") : null
      const u = userStr ? JSON.parse(userStr) : null
      if (!u) {
        router.push("/login")
        return
      }
      setUser(u)
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan yang tidak diketahui.")
      console.error("Dashboard fetch error - user:", err)
    } finally {
      setLoadingInitial(false)
    }
  }, [])

  // Ambil profil user dari API custom
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/get-user-profile?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error("Gagal memuat profil.")
      const profileData = await res.json()
      setProfile(profileData)
    } catch (err) {
      setError(err?.message || "Gagal memuat profil.")
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  // Ambil konfigurasi global dari API custom
  const fetchAppConfigSection = useCallback(async () => {
    setLoadingAppConfig(true)
    try {
      const res = await fetch(`/api/get-app-config`)
      if (!res.ok) throw new Error("Gagal memuat konfigurasi global.")
      const configData = await res.json()
      setAppConfig(configData)
    } catch (err) {
      setError(err?.message || "Gagal memuat konfigurasi global.")
    } finally {
      setLoadingAppConfig(false)
    }
  }, [])

  // Ambil data tabungan, penggunaan, dan transfer user dari API custom
  const fetchPersonalSectionData = useCallback(async (userId, currentProfile, currentAppConfig) => {
    if (!userId) return
    setLoadingPersonal(true)
    try {
      // --- Savings history ---
      const res = await fetch(`/api/get-user-savings?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error("Gagal memuat data tabungan.")
      const savingHistoryData = await res.json()

      // Normalisasi minimal agar tahan input string/null
      const normSavings = Array.isArray(savingHistoryData)
        ? savingHistoryData.map((it) => ({
            ...it,
            Jumlah: Number(it?.Jumlah ?? 0),
            Tipe: String(it?.Tipe ?? ""),
            Metode: String(it?.Metode ?? ""),
            Tanggal: it?.Tanggal || it?.CreatedAt || null,
          }))
        : []

      setPersonalSavingHistory(normSavings)

      // === PERHITUNGAN TANPA DOUBLE COUNT SETORAN AWAL ===
      // 1) Hitung tabungan rutin SAJA (tanpa "Setoran Awal")
      let totalRecorded = 0
      let totalUsed = 0
      for (const item of normSavings) {
        if (item.Tipe === "Setoran" && item.Metode !== "Setoran Awal") {
          totalRecorded += item.Jumlah
        } else if (item.Tipe === "Penggunaan") {
          totalUsed += item.Jumlah
        }
      }

      // 2) Tambahkan "Setoran Awal" tepat SATU kali jika Approved (total = per pequrban * jumlah pequrban)
      const jumlahPequrban = Number(currentProfile?.JumlahPequrban) || 1
      const initialDepositPerPequrban = Number(currentAppConfig?.InitialDepositAmount) || 0
      const initialDepositTotal = initialDepositPerPequrban * jumlahPequrban
      if (currentProfile?.InitialDepositStatus === "Approved" && initialDepositTotal > 0) {
        totalRecorded += initialDepositTotal
      }

      setPersonalTotalRecorded(totalRecorded)
      setPersonalUsed(totalUsed)

      // --- Transfers / pelunasan ---
      const resTransfer = await fetch(`/api/get-user-transfers?userId=${encodeURIComponent(userId)}`)
      if (!resTransfer.ok) throw new Error("Gagal memuat data transfer.")
      const transferDataRaw = await resTransfer.json()

      const transferData = Array.isArray(transferDataRaw)
        ? transferDataRaw.map((t) => ({
            ...t,
            Amount: Number(t?.Amount ?? 0),
            Status: String(t?.Status ?? ""),
            Type: String(t?.Type ?? ""),
            Timestamp: t?.Timestamp || t?.CreatedAt || null,
            ConfirmationId: String(t?.ConfirmationId ?? ""),
          }))
        : []

      // Synthetic transfer untuk Setoran Awal (hanya untuk riwayat) — tetap aman meski upload ulang
      let initialDepositTransfer = null
      if (currentProfile?.InitialDepositStatus === "Approved" && initialDepositTotal > 0) {
        // Kalau ada entri saving "Setoran Awal" dengan ProofLink, pakai itu
        const initialDepositSaving = normSavings.find(
          (item) => item.Tipe === "Setoran" && item.Metode === "Setoran Awal" && item.ProofLink
        )
        if (initialDepositSaving) {
          initialDepositTransfer = {
            ConfirmationId: `initial-${initialDepositSaving.TabunganId || initialDepositSaving.id || Math.random()}`,
            Amount: Number(initialDepositSaving.Jumlah || initialDepositTotal),
            Timestamp: initialDepositSaving.Tanggal || new Date().toISOString(),
            Status: "Approved",
            ProofLink: initialDepositSaving.ProofLink,
            Type: "Setoran Awal",
          }
        } else {
          initialDepositTransfer = {
            ConfirmationId: `initial-${userId}`,
            Amount: Number(initialDepositTotal),
            Timestamp: currentProfile?.InitialDepositDate || new Date().toISOString(),
            Status: "Approved",
            ProofLink: currentProfile?.InitialDepositProof || null,
            Type: "Setoran Awal",
          }
        }
      }

      // Gabungkan → sort DESC by Timestamp → dedupe by ConfirmationId
      let allTransfersFull = [...transferData]
      if (initialDepositTransfer) {
        allTransfersFull = [initialDepositTransfer, ...allTransfersFull]
      }

      allTransfersFull.sort(
        (a, b) => new Date(b.Timestamp || 0) - new Date(a.Timestamp || 0)
      )

      const seen = new Set()
      allTransfersFull = allTransfersFull.filter((t) => {
        const key = t.ConfirmationId || `${t.Type}-${t.Timestamp}-${t.Amount}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setAllPersonalTransferConfirmations(allTransfersFull)

      // Hanya Approved untuk progress
      const approvedTransfers = allTransfersFull.filter((item) => item.Status === "Approved")
      const totalTransferredApproved = approvedTransfers.reduce(
        (sum, item) => sum + Number(item.Amount || 0),
        0
      )
      setPersonalTransferConfirmations(approvedTransfers)
      setPersonalTransferred(totalTransferredApproved)
    } catch (err) {
      setError(err?.message || "Gagal memuat data keuangan pribadi.")
      setPersonalSavingHistory([])
      setPersonalTransferConfirmations([])
      setAllPersonalTransferConfirmations([])
      setPersonalTotalRecorded(0)
      setPersonalUsed(0)
      setPersonalTransferred(0)
    } finally {
      setLoadingPersonal(false)
    }
  }, [])

  // Ambil berita dari API custom
  const fetchNewsSection = useCallback(async (page = 1) => {
    setLoadingNews(true)
    try {
      const res = await fetch(`/api/get-news?page=${encodeURIComponent(page)}`)
      if (!res.ok) throw new Error("Gagal memuat berita.")
      const { newsData, count } = await res.json()
      setNews(Array.isArray(newsData) ? newsData : [])
      setNewsTotal(Number(count || 0))
    } catch (err) {
      setError(err?.message || "Gagal memuat berita.")
    } finally {
      setLoadingNews(false)
    }
  }, [])

  // Ambil milestones dari API custom
  const fetchMilestonesSection = useCallback(async () => {
    setLoadingMilestones(true)
    try {
      const res = await fetch(`/api/get-milestones`)
      if (!res.ok) throw new Error("Gagal memuat milestone.")
      const milestonesData = await res.json()
      setMilestones(milestonesData)
    } catch (err) {
      setError(err?.message || "Gagal memuat milestone.")
    } finally {
      setLoadingMilestones(false)
    }
  }, [])

  // Ambil tiket helpdesk dari API custom
  const fetchHelpDeskTicketsSection = useCallback(async (userId) => {
    if (!userId) return
    setLoadingHelpDeskTickets(true)
    try {
      const res = await fetch(`/api/get-helpdesk-tickets?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error("Gagal memuat tiket helpdesk.")
      const ticketsData = await res.json()
      setUserHelpDeskTickets(Array.isArray(ticketsData) ? ticketsData : [])
    } catch (err) {
      setError(err?.message || "Gagal memuat tiket helpdesk.")
      setUserHelpDeskTickets([])
    } finally {
      setLoadingHelpDeskTickets(false)
    }
  }, [])

  // Ambil dokumen/sumber daya dari API custom
  const fetchResourcesSection = useCallback(async (userId) => {
    if (!userId) return
    setLoadingDocuments(true)
    try {
      const res = await fetch(`/api/get-resources?userId=${encodeURIComponent(userId)}`)
      if (!res.ok) throw new Error("Gagal memuat dokumen dan sumber daya.")
      const resourcesData = await res.json()
      setDocuments(Array.isArray(resourcesData) ? resourcesData : [])
    } catch (err) {
      setError(err?.message || "Gagal memuat dokumen dan sumber daya.")
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  // Derived
  const personalNet = personalTotalRecorded - personalUsed

  return {
    // States
    user,
    setUser,
    profile,
    setProfile,
    appConfig,
    setAppConfig,
    personalTotalRecorded,
    setPersonalTotalRecorded,
    personalUsed,
    setPersonalUsed,
    personalTransferred,
    personalSavingHistory,
    setPersonalSavingHistory,
    personalTransferConfirmations, // hanya Approved
    setPersonalTransferConfirmations,
    allPersonalTransferConfirmations, // semua status untuk riwayat
    userHelpDeskTickets,
    setUserHelpDeskTickets,
    news,
    milestones,
    documents,
    newsPage,
    setNewsPage,
    newsTotal,
    NEWS_PER_PAGE,

    // Derived
    personalNet,

    // Loading States
    loadingInitial,
    setLoadingInitial,
    loadingProfile,
    loadingAppConfig,
    loadingPersonal,
    loadingNews,
    loadingMilestones,
    loadingHelpDeskTickets,
    loadingDocuments,

    // Error
    error,
    setError,

    // Fetch Functions
    fetchUserAndInit,
    fetchProfile,
    fetchAppConfigSection,
    fetchPersonalSectionData,
    fetchNewsSection,
    fetchMilestonesSection,
    fetchHelpDeskTicketsSection,
    fetchResourcesSection,
  }
}
