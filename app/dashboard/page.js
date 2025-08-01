"use client"

import { useEffect, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
// import supabase from "@/lib/supabase" // Not needed anymore
import { formatRupiah, getMonthDifference } from "@/lib/utils"

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData"
import { useDashboardActions } from "@/hooks/useDashboardActions"

// Import komponen terpisah
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import ProfilePequrban from "@/components/dashboard/ProfilePequrban"
import PersonalProgress from "@/components/dashboard/PersonalProgress"
import MilestoneProgram from "@/components/dashboard/MilestoneProgram"
import NewsSection from "@/components/dashboard/NewsSection"
import DocumentsResources from "@/components/dashboard/DocumentsResources"
import TransactionForms from "@/components/dashboard/TransactionForms"
import SavingHistory from "@/components/dashboard/SavingHistory"
import TransferHistory from "@/components/dashboard/TransferHistory"
import HelpDeskSection from "@/components/dashboard/HelpDeskSection"

// Komponen untuk menangani useSearchParams dengan Suspense
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "main"

  // Custom hooks
  const dashboardData = useDashboardData()
  const {
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
    loadingInitial,
    setLoadingInitial,
    loadingProfile,
    loadingAppConfig,
    loadingPersonal,
    loadingNews,
    loadingMilestones,
    loadingHelpDeskTickets,
    loadingDocuments,
    error,
    setError,
    fetchUserAndInit,
    fetchProfile,
    fetchAppConfigSection,
    fetchPersonalSectionData,
    fetchNewsSection,
    fetchMilestonesSection,
    fetchHelpDeskTicketsSection,
    fetchResourcesSection,
    setNews,
    setMilestones,
    setDocuments,
  } = dashboardData

  const dashboardActions = useDashboardActions({
    user,
    profile,
    appConfig,
    personalTotalRecorded,
    personalUsed,
    setPersonalSavingHistory,
    setPersonalTotalRecorded,
    setPersonalUsed,
    setPersonalTransferConfirmations,
    setUserHelpDeskTickets,
    setProfile,
    formatRupiah,
  })

  const {
    addSavingLoading,
    useSavingLoading,
    confirmTransferLoading,
    helpDeskFormLoading,
    handleAddSaving,
    handleUseSaving,
    handleInitialDeposit,
    handleConfirmTransfer,
    handleHelpDeskSubmit,
    showConfirmModal,
    handleEditTransaction,
    handleDeleteSaving,
    handleDeleteTransferConfirmation,
  } = dashboardActions

  // --- Effects ---
  // Agar fetchUserAndInit hanya dipanggil sekali saat mount
  const hasInit = useRef(false)
  useEffect(() => {
    if (!hasInit.current) {
      fetchUserAndInit(router)
      hasInit.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserAndInit])

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id)
    }
    if (user && !appConfig) {
      fetchAppConfigSection()
    }
  }, [user, profile, appConfig, fetchProfile, fetchAppConfigSection])

  // --- Dashboard Data Caching ---
  useEffect(() => {
    if (user && profile && appConfig) {
      // Cek cache sessionStorage
      const cacheKey = `dashboard-data-${user.id}`
      const cache = sessionStorage.getItem(cacheKey)
      if (cache) {
        try {
          const parsed = JSON.parse(cache)
          if (
            parsed &&
            parsed.news &&
            parsed.milestones &&
            parsed.documents &&
            parsed.personalSavingHistory &&
            parsed.personalTransferConfirmations &&
            parsed.userHelpDeskTickets
          ) {
            // Set state dari cache (hanya jika belum ada data)
            if (!news.length) setNews(parsed.news)
            if (!milestones.length) setMilestones(parsed.milestones)
            if (!documents.length) setDocuments(parsed.documents)
            if (!personalSavingHistory.length) setPersonalSavingHistory(parsed.personalSavingHistory)
            if (!personalTransferConfirmations.length)
              setPersonalTransferConfirmations(parsed.personalTransferConfirmations)
            if (!userHelpDeskTickets.length) setUserHelpDeskTickets(parsed.userHelpDeskTickets)
            setLoadingInitial(false)
            return
          }
        } catch {}
      }
      // Jika tidak ada cache, fetch data seperti biasa
      Promise.allSettled([
        fetchPersonalSectionData(user.id, profile, appConfig),
        fetchNewsSection(newsPage),
        fetchMilestonesSection(),
        fetchHelpDeskTicketsSection(user.id),
        fetchResourcesSection(user.id),
      ]).then((results) => {
        // Simpan hasil ke cache
        const cacheData = {
          news,
          milestones,
          documents,
          personalSavingHistory,
          personalTransferConfirmations,
          userHelpDeskTickets,
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
        setLoadingInitial(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, appConfig, newsPage])


  // Cek session custom: jika user tidak ada di localStorage, redirect ke login
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("qurban_user")
      if (!userStr) {
        router.push("/login")
      }
    }
  }, [router])

  // --- Event Handlers ---
  const handleSignOut = async () => {
    setLoadingInitial(true)
    if (typeof window !== "undefined") {
      localStorage.removeItem("qurban_user")
      sessionStorage.clear()
    }
    router.push("/login")
    setLoadingInitial(false)
  }

  const handleRefreshDashboard = useCallback(() => {
    if (user && appConfig) {
      // Selalu fetch profile juga saat refresh
      fetchProfile(user.id)
      Promise.allSettled([
        fetchPersonalSectionData(user.id, profile, appConfig),
        fetchNewsSection(newsPage),
        fetchMilestonesSection(),
        fetchHelpDeskTicketsSection(user.id),
        fetchResourcesSection(user.id),
      ]).then(() => {
        // Hapus cache agar data baru di-fetch ulang
        const cacheKey = `dashboard-data-${user.id}`
        sessionStorage.removeItem(cacheKey)
      })
    }
  }, [
    user,
    profile,
    appConfig,
    newsPage,
    fetchProfile,
    fetchPersonalSectionData,
    fetchNewsSection,
    fetchMilestonesSection,
    fetchHelpDeskTicketsSection,
    fetchResourcesSection,
  ])

  // --- Render Logic ---
  if (loadingInitial || loadingAppConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <svg
          className="animate-spin h-12 w-12 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )
  }

  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>

  const totalNewsPages = Math.max(1, Math.ceil(newsTotal / NEWS_PER_PAGE))

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        profile={profile}
        handleRefreshDashboard={handleRefreshDashboard}
        handleSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentTab === "helpdesk" ? (
            <HelpDeskSection
              userHelpDeskTickets={userHelpDeskTickets}
              loadingHelpDeskTickets={loadingHelpDeskTickets}
              helpDeskFormLoading={helpDeskFormLoading}
              handleHelpDeskSubmit={handleHelpDeskSubmit}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri (2/3 lebar di layar besar) */}
              {/* Jika setoran awal belum approved, hanya tampilkan profil dan card setoran awal */}
              {profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Approved" ? (
                <>
                  <div className="lg:col-span-2 space-y-6">
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile} />
                    <PersonalProgress
                      profile={profile}
                      globalConfig={appConfig}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalTransferred={personalTransferred}
                      loadingPersonal={loadingPersonal}
                      formatRupiah={formatRupiah}
                      getMonthDifference={getMonthDifference}
                    />
                    <MilestoneProgram milestones={milestones} loadingMilestones={loadingMilestones} />
                    <NewsSection
                      news={news}
                      loadingNews={loadingNews}
                      newsPage={newsPage}
                      setNewsPage={setNewsPage}
                      totalNewsPages={totalNewsPages}
                    />
                    <DocumentsResources documents={documents} loadingDocuments={loadingDocuments} />
                  </div>
                  {/* Kolom Kanan */}
                  <div className="lg:col-span-1 space-y-6">
                    <TransactionForms
                      profile={profile}
                      appConfig={appConfig}
                      user={user}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalSavingHistory={personalSavingHistory}
                      personalTransferConfirmations={personalTransferConfirmations}
                      addSavingLoading={addSavingLoading}
                      useSavingLoading={useSavingLoading}
                      confirmTransferLoading={confirmTransferLoading}
                      handleAddSaving={handleAddSaving}
                      handleUseSaving={handleUseSaving}
                      handleInitialDeposit={handleInitialDeposit}
                      handleConfirmTransfer={handleConfirmTransfer}
                      handleDeleteSaving={handleDeleteSaving}
                      handleDeleteTransferConfirmation={handleDeleteTransferConfirmation}
                      formatRupiah={formatRupiah}
                    />
                    <SavingHistory
                      personalSavingHistory={personalSavingHistory}
                      loadingPersonal={loadingPersonal}
                      formatRupiah={formatRupiah}
                      showConfirmModal={showConfirmModal}
                      handleEditTransaction={handleEditTransaction}
                      handleDeleteTransaction={handleDeleteSaving}
                    />
                    <TransferHistory
                      profile={profile}
                      personalTransferConfirmations={personalTransferConfirmations}
                      loadingPersonal={loadingPersonal}
                      formatRupiah={formatRupiah}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="lg:col-span-3">
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile} />
                  </div>
                  <div className="lg:col-span-3">
                    <TransactionForms
                      profile={profile}
                      appConfig={appConfig}
                      user={user}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalSavingHistory={personalSavingHistory}
                      personalTransferConfirmations={personalTransferConfirmations}
                      addSavingLoading={addSavingLoading}
                      useSavingLoading={useSavingLoading}
                      confirmTransferLoading={confirmTransferLoading}
                      handleAddSaving={handleAddSaving}
                      handleUseSaving={handleUseSaving}
                      handleInitialDeposit={handleInitialDeposit}
                      handleConfirmTransfer={handleConfirmTransfer}
                      handleDeleteSaving={handleDeleteSaving}
                      handleDeleteTransferConfirmation={handleDeleteTransferConfirmation}
                      formatRupiah={formatRupiah}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Komponen utama dengan Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
