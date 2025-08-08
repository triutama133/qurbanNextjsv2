"use client"

import { useEffect, useCallback, useRef, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRupiah, getMonthDifference } from "@/lib/utils"

// Import custom hooks
import { useDashboardData } from "@/hooks/useDashboardData"
import { useDashboardActions } from "@/hooks/useDashboardActions"

// Import komponen terpisah
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import NotificationBell from "@/components/dashboard/NotificationBell"
import ProfilePequrban from "@/components/dashboard/ProfilePequrban"
import PersonalProgress from "@/components/dashboard/PersonalProgress"
import MilestoneProgram from "@/components/dashboard/MilestoneProgram"
import NewsSection from "@/components/dashboard/NewsSection"
import DocumentsResources from "@/components/dashboard/DocumentsResources"
import TransactionForms from "@/components/dashboard/TransactionForms"
import SavingHistory from "@/components/dashboard/SavingHistory"
import TransferHistory from "@/components/dashboard/TransferHistory"
import HelpDeskSection from "@/components/dashboard/HelpDeskSection"

// Komponen tab menu mobile: Capaian & Transaksi (default), Milestone, Berita & Info, Dokumen & Link
function MobileDashboardTabs({
  user, readNewsIds, setReadNewsIds,
  profile, loadingProfile, appConfig, personalTotalRecorded, personalUsed, personalTransferred, loadingPersonal, formatRupiah, getMonthDifference,
  transactionProps,
  milestones, loadingMilestones,
  news, loadingNews, newsPage, setNewsPage, totalNewsPages,
  documents, loadingDocuments,
  openNewsModal
}) {
  const [activeTab, setActiveTab] = useState("progress")
  return (
    <div className="block lg:hidden">
      <div className="flex mb-4 border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-sm font-medium focus:outline-none ${activeTab === "progress" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500"}`}
          onClick={() => setActiveTab("progress")}
        >
          Capaian & Transaksi
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium focus:outline-none ${activeTab === "milestone" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500"}`}
          onClick={() => setActiveTab("milestone")}
        >
          Milestone
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium focus:outline-none ${activeTab === "news" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500"}`}
          onClick={() => setActiveTab("news")}
        >
          Berita & Info
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium focus:outline-none ${activeTab === "docs" ? "border-b-2 border-green-600 text-green-700" : "text-gray-500"}`}
          onClick={() => setActiveTab("docs")}
        >
          Dokumen & Link
        </button>
      </div>
      <div>
        {activeTab === "progress" && (
          <>
            <PersonalProgress
              profile={profile}
              globalConfig={appConfig}
              personalTotalRecorded={personalTotalRecorded}
              personalUsed={personalUsed}
              personalTransferred={transactionProps.personalTransferred}
              loadingPersonal={loadingPersonal}
              formatRupiah={formatRupiah}
              getMonthDifference={getMonthDifference}
            />
            <TransactionForms {...transactionProps} />
            <SavingHistory
              personalSavingHistory={transactionProps.personalSavingHistory}
              loadingPersonal={loadingPersonal}
              formatRupiah={formatRupiah}
              showConfirmModal={transactionProps.showConfirmModal}
              handleEditTransaction={transactionProps.handleEditTransaction}
              handleDeleteTransaction={transactionProps.handleDeleteSaving}
            />
            <TransferHistory
              profile={profile}
              allPersonalTransferConfirmations={transactionProps.allPersonalTransferConfirmations}
              loadingPersonal={loadingPersonal}
              formatRupiah={formatRupiah}
            />
          </>
        )}
        {activeTab === "milestone" && (
          <MilestoneProgram milestones={milestones} loadingMilestones={loadingMilestones} />
        )}
        {activeTab === "news" && (
          <NewsSection
            userId={user?.id}
            readNewsIds={readNewsIds}
            setReadNewsIds={setReadNewsIds}
          />
        )}
        {activeTab === "docs" && (
          <DocumentsResources documents={documents} loadingDocuments={loadingDocuments} />
        )}
      </div>
    </div>
  )
}

// Komponen untuk menangani useSearchParams dengan Suspense
function DashboardContent() {
  // Fetch all news for notification bell (tanpa paging)
  const [allNews, setAllNews] = useState([])
  useEffect(() => {
    async function fetchAllNews() {
      try {
        const res = await fetch('/api/get-news?page=1&all=1')
        if (res.ok) {
          const data = await res.json()
          setAllNews(data.newsData || data.news || [])
        }
      } catch {}
    }
    fetchAllNews()
  }, [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "main"

  // Custom hooks
  const dashboardData = useDashboardData()
  const {
    user, setUser, profile, setProfile, appConfig,
    personalTotalRecorded, setPersonalTotalRecorded, personalUsed, setPersonalUsed, personalTransferred,
    personalSavingHistory, setPersonalSavingHistory, personalTransferConfirmations, setPersonalTransferConfirmations,
    allPersonalTransferConfirmations, // <-- tambahkan ini agar tidak ReferenceError
    userHelpDeskTickets, setUserHelpDeskTickets, news, milestones, documents, newsPage, setNewsPage, newsTotal,
    NEWS_PER_PAGE, loadingInitial, setLoadingInitial, loadingProfile, loadingAppConfig, loadingPersonal,
    loadingNews, loadingMilestones, loadingHelpDeskTickets, loadingDocuments, error, setError,
    fetchUserAndInit, fetchProfile, fetchAppConfigSection, fetchPersonalSectionData,
    fetchNewsSection, fetchMilestonesSection, fetchHelpDeskTicketsSection, fetchResourcesSection,
    setNews, setMilestones, setDocuments,
  } = dashboardData

  const dashboardActions = useDashboardActions({
    user, profile, appConfig, personalTotalRecorded, personalUsed,
    setPersonalSavingHistory, setPersonalTotalRecorded, setPersonalUsed, setPersonalTransferConfirmations,
    setUserHelpDeskTickets, setProfile, formatRupiah,
    fetchPersonalSectionData, // Pastikan diteruskan ke hook actions
  })

  const {
    addSavingLoading, useSavingLoading, confirmTransferLoading, helpDeskFormLoading,
    handleAddSaving, handleUseSaving, handleInitialDeposit, handleConfirmTransfer, handleHelpDeskSubmit,
    showConfirmModal, handleEditTransaction, handleDeleteSaving, handleDeleteTransferConfirmation,
  } = dashboardActions

  // --- Notification State (like original NewsSection) ---
  // NewsSection now manages modal and paging. Only notification state here.
  // (already declared above, do not redeclare)
  const [readNewsIds, setReadNewsIds] = useState([])

  // Load read news from backend (manual userId)
  // Gunakan ref agar state readNewsIds tetap up-to-date di event handler
  const readNewsIdsRef = useRef(readNewsIds)
  useEffect(() => {
    readNewsIdsRef.current = readNewsIds
  }, [readNewsIds])

  useEffect(() => {
    async function fetchReadNews() {
      let userId = null
      // Try to get userId from user object (from dashboardData), fallback to localStorage
      if (user && user.id) {
        userId = user.id
      } else if (typeof window !== 'undefined') {
        try {
          const userStr = localStorage.getItem('qurban_user')
          if (userStr) {
            const parsed = JSON.parse(userStr)
            userId = parsed.id
          }
        } catch {}
      }
      if (!userId) return
      try {
        const res = await fetch("/api/read-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action: "get" })
        })
        if (res.ok) {
          const data = await res.json()
          setReadNewsIds(data.readNewsIds || [])
        }
      } catch {}
    }
    fetchReadNews()

    // Listen for custom event from NewsSection/modal to update readNewsIds real-time
    function handleNewsRead(e) {
      const { newsId } = e.detail || {}
      if (newsId && !readNewsIdsRef.current.includes(newsId)) {
        setReadNewsIds((prev) => [...prev, newsId])
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('newsRead', handleNewsRead)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('newsRead', handleNewsRead)
      }
    }
  }, [user])

  // Compute notifications
  const notifications = (allNews && allNews.length > 0)
    ? allNews.map((item) => ({
        title: "Berita Baru",
        message: item.Title,
        time: new Date(item.DatePublished).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        read: readNewsIds.includes(item.NewsletterId),
        action: () => {
          // Open modal in NewsSection via custom event
          const event = new CustomEvent("openNewsModal", { detail: item })
          window.dispatchEvent(event)
        },
        actionLabel: "Read More"
      }))
    : [];
  // News modal and paging now handled in NewsSection
  if (profile) {
    if (!profile.IsInitialDepositMade) {
      notifications.push({
        title: "Setoran Awal",
        message: "Anda belum melakukan setoran awal.",
        read: false
      })
    } else if (profile.InitialDepositStatus === "Pending") {
      notifications.push({
        title: "Setoran Awal",
        message: "Setoran awal Anda sedang menunggu verifikasi admin.",
        read: false
      })
    } else if (profile.InitialDepositStatus === "Rejected") {
      notifications.push({
        title: "Setoran Awal Ditolak",
        message: profile.InitialDepositAdminNotes ? `Alasan: ${profile.InitialDepositAdminNotes}` : "Setoran awal Anda ditolak oleh admin.",
        read: false
      })
    } else if (profile.InitialDepositStatus === "Approved") {
      notifications.push({
        title: "Setoran Awal Disetujui",
        message: "Setoran awal Anda telah diverifikasi admin.",
        read: true
      })
    }
  }

  // News modal and paging now handled in NewsSection
  const hasInit = useRef(false)
  useEffect(() => {
    if (!hasInit.current) {
  // Render NewsSection with only notification props
  // <NewsSection /> should now handle its own paging, fetch, and modal
      fetchUserAndInit(router)
      hasInit.current = true
    }
  }, [fetchUserAndInit])

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id)
    }
    if (user && !appConfig) {
      fetchAppConfigSection()
    }
  }, [user, profile, appConfig, fetchProfile, fetchAppConfigSection])

  useEffect(() => {
    if (user && profile && appConfig) {
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
      Promise.allSettled([
        fetchPersonalSectionData(user.id, profile, appConfig),
        fetchNewsSection(newsPage),
        fetchMilestonesSection(),
        fetchHelpDeskTicketsSection(user.id),
        fetchResourcesSection(user.id),
      ]).then(() => {
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
  }, [user, profile, appConfig, newsPage])

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
      fetchProfile(user.id)
      Promise.allSettled([
        fetchPersonalSectionData(user.id, profile, appConfig),
        fetchNewsSection(newsPage),
        fetchMilestonesSection(),
        fetchHelpDeskTicketsSection(user.id),
        fetchResourcesSection(user.id),
      ]).then(() => {
        const cacheKey = `dashboard-data-${user.id}`
        sessionStorage.removeItem(cacheKey)
      })
    }
  }, [
    user, profile, appConfig, newsPage,
    fetchProfile, fetchPersonalSectionData, fetchNewsSection,
    fetchMilestonesSection, fetchHelpDeskTicketsSection, fetchResourcesSection,
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
      >
        <div className="ml-2">
          <NotificationBell notifications={notifications} />
        </div>
      </DashboardHeader>

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
              {profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Approved" ? (
                <>
                  <div className="lg:col-span-2 space-y-6">
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile} />
                    {/* Mobile: Tab menu below profile, default tab = capaian & transaksi */}
                    <MobileDashboardTabs
                      user={user}
                      readNewsIds={readNewsIds}
                      setReadNewsIds={setReadNewsIds}
                      profile={profile}
                      loadingProfile={loadingProfile}
                      appConfig={appConfig}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalTransferred={personalTransferred}
                      loadingPersonal={loadingPersonal}
                      formatRupiah={formatRupiah}
                      getMonthDifference={getMonthDifference}
                      transactionProps={{
                        profile,
                        appConfig,
                        user,
                        personalTotalRecorded,
                        personalUsed,
                        personalSavingHistory,
                        personalTransferConfirmations,
                        allPersonalTransferConfirmations,
                        addSavingLoading,
                        useSavingLoading,
                        confirmTransferLoading,
                        handleAddSaving,
                        handleUseSaving,
                        handleInitialDeposit,
                        handleConfirmTransfer,
                        handleDeleteSaving,
                        handleDeleteTransferConfirmation,
                        formatRupiah,
                        showConfirmModal,
                        handleEditTransaction,
                        handleDeleteSaving,
                        personalTransferred,
                        // for SavingHistory/TransferHistory
                        personalSavingHistory,
                        personalTransferConfirmations,
                      }}
                      milestones={milestones}
                      loadingMilestones={loadingMilestones}
                      news={news}
                      loadingNews={loadingNews}
                      newsPage={newsPage}
                      setNewsPage={setNewsPage}
                      totalNewsPages={totalNewsPages}
                      documents={documents}
                      loadingDocuments={loadingDocuments}
                      // openNewsModal removed
                    />
                    {/* Desktop: as before (tidak dobel) */}
                    <div className="hidden lg:block space-y-6">
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
                        userId={user?.id}
                        readNewsIds={readNewsIds}
                        setReadNewsIds={setReadNewsIds}
                      />
      {/* Modal Berita Lengkap */}
                      <DocumentsResources documents={documents} loadingDocuments={loadingDocuments} />
                    </div>
                  </div>
                  <div className="hidden lg:block lg:col-span-1 space-y-6">
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
                      allPersonalTransferConfirmations={allPersonalTransferConfirmations}
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
    {/* Modal Berita Lengkap: render di luar blok desktop agar muncul di mobile & desktop, responsif */}
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