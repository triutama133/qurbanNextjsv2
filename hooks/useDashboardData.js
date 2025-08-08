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
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem("qurban_user") : null;
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
    } catch (err) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.")
      console.error("Dashboard fetch error - user:", err)
    }
  }, [])

  // Ambil profil user dari API custom
  const fetchProfile = useCallback(async (userId) => {
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/get-user-profile?userId=${userId}`)
      if (!res.ok) throw new Error("Gagal memuat profil.")
      const profileData = await res.json()
      setProfile(profileData)
    } catch (err) {
      setError(err.message || "Gagal memuat profil.")
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
      setError(err.message || "Gagal memuat konfigurasi global.")
    } finally {
      setLoadingAppConfig(false)
    }
  }, [])

  // Ambil data tabungan, penggunaan, dan transfer user dari API custom
  const fetchPersonalSectionData = useCallback(async (userId, currentProfile, currentAppConfig) => {
    setLoadingPersonal(true)
    try {
      const res = await fetch(`/api/get-user-savings?userId=${userId}`)
      if (!res.ok) throw new Error("Gagal memuat data tabungan.")
      const savingHistoryData = await res.json()
      setPersonalSavingHistory(savingHistoryData)

      // Perhitungan sama seperti sebelumnya
      let totalRecorded = 0
      let totalUsed = 0
      let initialDepositIncluded = false;
      savingHistoryData.forEach((item) => {
        if (item.Tipe === "Setoran") {
          if (item.Metode === "Setoran Awal") {
            initialDepositIncluded = true;
            if (currentProfile?.InitialDepositStatus === "Approved") {
              totalRecorded += item.Jumlah || 0;
            }
          } else {
            totalRecorded += item.Jumlah || 0;
          }
        } else if (item.Tipe === "Penggunaan") {
          totalUsed += item.Jumlah || 0;
        }
      });
      if (!initialDepositIncluded && currentProfile?.InitialDepositStatus === "Approved" && currentAppConfig?.InitialDepositAmount) {
        totalRecorded += currentAppConfig.InitialDepositAmount;
      }
      setPersonalTotalRecorded(totalRecorded);
      setPersonalUsed(totalUsed);

      // Ambil data transfer pelunasan dari API custom
      const resTransfer = await fetch(`/api/get-user-transfers?userId=${userId}`)
      if (!resTransfer.ok) throw new Error("Gagal memuat data transfer.")
      const transferData = await resTransfer.json()

      // Ambil data setoran awal yang sudah transfer & approved
      let initialDepositTransfer = null;
      if (currentProfile?.InitialDepositStatus === "Approved" && currentAppConfig?.InitialDepositAmount) {
        const initialDeposit = savingHistoryData.find(
          (item) => item.Tipe === "Setoran" && item.Metode === "Setoran Awal" && item.ProofLink
        );
        if (initialDeposit) {
          initialDepositTransfer = {
            ConfirmationId: `initial-${initialDeposit.TabunganId || initialDeposit.id || Math.random()}`,
            Amount: initialDeposit.Jumlah || currentAppConfig.InitialDepositAmount,
            Timestamp: initialDeposit.Tanggal || initialDeposit.CreatedAt || new Date().toISOString(),
            Status: "Approved",
            ProofLink: initialDeposit.ProofLink,
            Type: "Setoran Awal",
          };
        } else {
          initialDepositTransfer = {
            ConfirmationId: `initial-${userId}`,
            Amount: currentAppConfig.InitialDepositAmount,
            Timestamp: currentProfile.InitialDepositDate || new Date().toISOString(),
            Status: "Approved",
            ProofLink: currentProfile.InitialDepositProof || null,
            Type: "Setoran Awal",
          };
        }
      }
      // Simpan semua transfer (untuk riwayat)
      let allTransfersFull = [...transferData];
      if (initialDepositTransfer) {
        allTransfersFull = [initialDepositTransfer, ...allTransfersFull];
      }
      setAllPersonalTransferConfirmations(allTransfersFull);

      // Filter hanya transfer yang Approved (untuk progress)
      let allTransfers = allTransfersFull.filter(item => item.Status === "Approved");
      let totalTransferredApproved = allTransfers.reduce((sum, item) => sum + (item.Amount || 0), 0);
      setPersonalTransferConfirmations(allTransfers);
      setPersonalTransferred(totalTransferredApproved);
    } catch (err) {
      setError(err.message || "Gagal memuat data keuangan pribadi.")
      setPersonalSavingHistory([])
      setPersonalTransferConfirmations([])
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
      const res = await fetch(`/api/get-news?page=${page}`)
      if (!res.ok) throw new Error("Gagal memuat berita.")
      const { newsData, count } = await res.json()
      setNews(newsData)
      setNewsTotal(count)
    } catch (err) {
      setError(err.message || "Gagal memuat berita.")
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
      setError(err.message || "Gagal memuat milestone.")
    } finally {
      setLoadingMilestones(false)
    }
  }, [])

  // Ambil tiket helpdesk dari API custom
  const fetchHelpDeskTicketsSection = useCallback(async (userId) => {
    setLoadingHelpDeskTickets(true)
    try {
      const res = await fetch(`/api/get-helpdesk-tickets?userId=${userId}`)
      if (!res.ok) throw new Error("Gagal memuat tiket helpdesk.")
      const ticketsData = await res.json()
      setUserHelpDeskTickets(ticketsData)
    } catch (err) {
      setError(err.message || "Gagal memuat tiket helpdesk.")
    } finally {
      setLoadingHelpDeskTickets(false)
    }
  }, [])

  // Ambil dokumen/sumber daya dari API custom
  const fetchResourcesSection = useCallback(async (userId) => {
    setLoadingDocuments(true)
    try {
      const res = await fetch(`/api/get-resources?userId=${userId}`)
      if (!res.ok) throw new Error("Gagal memuat dokumen dan sumber daya.")
      const resourcesData = await res.json()
      setDocuments(resourcesData)
    } catch (err) {
      setError(err.message || "Gagal memuat dokumen dan sumber daya.")
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  return {
    // States
    user,
    setUser,
    profile,
    setProfile,
    appConfig,
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
