"use client"

import { useState, useCallback } from "react"
import supabase from "@/lib/supabase"

export function useDashboardData() {
  // States
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [appConfig, setAppConfig] = useState(null)
  const [personalTotalRecorded, setPersonalTotalRecorded] = useState(0)
  const [personalUsed, setPersonalUsed] = useState(0)
  const [personalTransferred, setPersonalTransferred] = useState(0)
  const [personalSavingHistory, setPersonalSavingHistory] = useState([])
  const [personalTransferConfirmations, setPersonalTransferConfirmations] = useState([])
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
  const fetchUserAndInit = useCallback(async (router) => {
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

  const fetchProfile = useCallback(async (userId) => {
    setLoadingProfile(true)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select('*, "NamaPequrban", "StatusPequrban", "Benefits", "IsInitialDepositMade"')
        .eq("UserId", userId)
        .single()
      if (profileError || !profileData) throw new Error(profileError?.message || "Data profil tidak ditemukan.")
      setProfile(profileData)
    } catch (err) {
      setError(err.message || "Gagal memuat profil.")
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const fetchAppConfigSection = useCallback(async () => {
    setLoadingAppConfig(true)
    try {
      const { data: configData, error: configError } = await supabase
        .from("app_config")
        .select("*")
        .eq("id", "global_settings")
        .single()
      if (configError || !configData)
        throw new Error(configError?.message || "Data konfigurasi global tidak ditemukan.")
      setAppConfig(configData)
    } catch (err) {
      setError(err.message || "Gagal memuat konfigurasi global.")
    } finally {
      setLoadingAppConfig(false)
    }
  }, [])

  const fetchPersonalSectionData = useCallback(async (userId, currentProfile, currentAppConfig) => {
    setLoadingPersonal(true)
    try {
      const { data: savingHistoryData, error: savingHistoryError } = await supabase
        .from("tabungan")
        .select("*")
        .eq("UserId", userId)
        .order("Tanggal", { ascending: false })
      if (savingHistoryError) throw savingHistoryError
      setPersonalSavingHistory(savingHistoryData)


      // Hitung semua setoran ("Setoran") dan transfer ke panitia ("Transfer"), keduanya masuk ke tabungan tercatat
      let totalRecorded = 0
      let totalUsed = 0
      savingHistoryData.forEach((item) => {
        if (item.Tipe === "Setoran" || item.Tipe === "Transfer") {
          totalRecorded += item.Jumlah || 0
        } else if (item.Tipe === "Penggunaan") {
          totalUsed += item.Jumlah || 0
        }
      })
      setPersonalTotalRecorded(totalRecorded)
      setPersonalUsed(totalUsed)

      const { data: transferData, error: transferError } = await supabase
        .from("transfer_confirmations")
        .select("*")
        .eq("UserId", userId)
        .eq("Status", "Approved")
        .order("Timestamp", { ascending: false })
      if (transferError) throw transferError

      let totalTransferredApproved = transferData.reduce((sum, item) => sum + (item.Amount || 0), 0)

      if (currentProfile?.InitialDepositStatus === "Approved" && currentAppConfig?.InitialDepositAmount) {
        totalTransferredApproved += currentAppConfig.InitialDepositAmount
      }

      setPersonalTransferConfirmations(transferData)
      setPersonalTransferred(totalTransferredApproved)
    } catch (err) {
      setError(err.message || "Gagal memuat data keuangan pribadi.")
      console.error("fetchPersonalSectionData error:", err)
      setPersonalSavingHistory([])
      setPersonalTransferConfirmations([])
      setPersonalTotalRecorded(0)
      setPersonalUsed(0)
      setPersonalTransferred(0)
    } finally {
      setLoadingPersonal(false)
    }
  }, [])

  const fetchNewsSection = useCallback(async (page = 1) => {
    setLoadingNews(true)
    try {
      const offset = (page - 1) * NEWS_PER_PAGE
      const {
        data: newsData,
        error: newsError,
        count,
      } = await supabase
        .from("newsletters")
        .select("*", { count: "exact" })
        .order("DatePublished", { ascending: false })
        .range(offset, offset + NEWS_PER_PAGE - 1)
      if (newsError) throw newsError
      setNews(newsData)
      setNewsTotal(count)
    } catch (err) {
      setError(err.message || "Gagal memuat berita.")
    } finally {
      setLoadingNews(false)
    }
  }, [])

  const fetchMilestonesSection = useCallback(async () => {
    setLoadingMilestones(true)
    try {
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("program_milestones")
        .select("*")
        .order("Year", { ascending: true })
        .order("Order", { ascending: true })
      if (milestonesError) {
        if (milestonesError.code === "PGRST116") setMilestones([])
        else throw milestonesError
      } else {
        setMilestones(milestonesData)
      }
    } catch (err) {
      setError(err.message || "Gagal memuat milestone.")
    } finally {
      setLoadingMilestones(false)
    }
  }, [])

  const fetchHelpDeskTicketsSection = useCallback(async (userId) => {
    setLoadingHelpDeskTickets(true)
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from("help_desk_tickets")
        .select("*")
        .eq("UserId", userId)
        .order("Timestamp", { ascending: false })
      if (ticketsError) throw ticketsError
      setUserHelpDeskTickets(ticketsData)
    } catch (err) {
      setError(err.message || "Gagal memuat tiket helpdesk.")
    } finally {
      setLoadingHelpDeskTickets(false)
    }
  }, [])

  const fetchResourcesSection = useCallback(async (userId) => {
    setLoadingDocuments(true)
    try {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("app_resources")
        .select("*")
        .or(`IsGlobal.eq.true,UserId.eq.${userId}`)
        .order("CreatedAt", { ascending: false })

      if (resourcesData === null) {
        setDocuments([])
      } else if (resourcesError) {
        throw resourcesError
      } else {
        setDocuments(resourcesData)
      }
    } catch (err) {
      setError(err.message || "Gagal memuat dokumen dan sumber daya.")
      console.error("fetchResourcesSection error:", err)
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
    personalTransferConfirmations,
    setPersonalTransferConfirmations,
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
