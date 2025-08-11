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
import dynamic from "next/dynamic"
const TransactionForms = dynamic(() => import("@/components/dashboard/TransactionForms"), { ssr: false })
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
            {/* TransactionForms harus tetap dirender di mobile agar warning pelunasan pending/approved muncul */}
            {profile && (
              <TransactionForms {...transactionProps} />
            )}
            <div className="mb-4">
              <SavingHistory
                personalSavingHistory={transactionProps.personalSavingHistory}
                loadingPersonal={loadingPersonal}
                formatRupiah={formatRupiah}
                showConfirmModal={transactionProps.showConfirmModal}
                handleEditTransaction={transactionProps.handleEditTransaction}
                handleDeleteTransaction={transactionProps.handleDeleteSaving}
              />
            </div>
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
  // Handler untuk tombol Help Desk
  const handleGoToHelpDesk = () => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", "helpdesk")
    router.push(`/dashboard?${params.toString()}`)
  }
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
    allPersonalTransferConfirmations, setAllPersonalTransferConfirmations, // <-- tambahkan setter
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

  // Gabungkan notifikasi berita dan setoran/pelunasan dalam satu array
  let notifications = [];
  if (allNews && allNews.length > 0) {
    notifications = allNews.map((item) => ({
      title: "Berita Baru",
      message: item.Title,
      time: item.DatePublished,
      read: readNewsIds.includes(item.NewsletterId),
      action: () => {
        // Open modal in NewsSection via custom event
        const event = new CustomEvent("openNewsModal", { detail: item })
        window.dispatchEvent(event)
      },
      actionLabel: "Read More",
      type: "berita"
    }));
  }
  // Tambahkan notifikasi setoran/pelunasan dengan type dan time
  if (profile) {
    if (!profile.IsInitialDepositMade) {
      notifications.push({
        title: "Setoran Awal",
        message: "Anda belum melakukan setoran awal.",
        read: false,
        type: "setoran",
        time: profile.InitialDepositDate || new Date().toISOString()
      });
    } else if (profile.InitialDepositStatus === "Pending") {
      notifications.push({
        title: "Setoran Awal",
        message: "Setoran awal Anda sedang menunggu verifikasi admin.",
        read: false,
        type: "setoran",
        time: profile.InitialDepositDate || new Date().toISOString()
      });
    } else if (profile.InitialDepositStatus === "Rejected") {
      notifications.push({
        title: "Setoran Awal Ditolak",
        message: profile.InitialDepositAdminNotes ? `Alasan: ${profile.InitialDepositAdminNotes}` : "Setoran awal Anda ditolak oleh admin.",
        read: false,
        type: "setoran",
        time: profile.InitialDepositDate || new Date().toISOString()
      });
    } else if (profile.InitialDepositStatus === "Approved") {
      notifications.push({
        title: "Setoran Awal Disetujui",
        message: "Setoran awal Anda telah diverifikasi admin.",
        read: true,
        type: "setoran",
        time: profile.InitialDepositVerifiedAt || profile.InitialDepositDate || new Date().toISOString()
      });
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
            parsed.allPersonalTransferConfirmations &&
            parsed.userHelpDeskTickets
          ) {
            if (!news.length) setNews(parsed.news)
            if (!milestones.length) setMilestones(parsed.milestones)
            if (!documents.length) setDocuments(parsed.documents)
            if (!personalSavingHistory.length) setPersonalSavingHistory(parsed.personalSavingHistory)
            if (!personalTransferConfirmations.length)
              setPersonalTransferConfirmations(parsed.personalTransferConfirmations)
            if (!allPersonalTransferConfirmations.length)
              setAllPersonalTransferConfirmations(parsed.allPersonalTransferConfirmations)
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
          allPersonalTransferConfirmations,
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
  // Tidak lagi pakai global spinner, loading per section

  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>

  const totalNewsPages = Math.max(1, Math.ceil(newsTotal / NEWS_PER_PAGE))

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        profile={profile}
        handleRefreshDashboard={handleRefreshDashboard}
        handleSignOut={handleSignOut}
        handleGoToHelpDesk={handleGoToHelpDesk}
      >
        {profile && profile.IsInitialDepositMade && (
          <div className="ml-2">
            <NotificationBell notifications={notifications} />
          </div>
        )}
      </DashboardHeader>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentTab === "helpdesk" ? (
            <HelpDeskSection
              userHelpDeskTickets={userHelpDeskTickets}
              loadingHelpDeskTickets={loadingHelpDeskTickets || loadingInitial}
              helpDeskFormLoading={helpDeskFormLoading}
              handleHelpDeskSubmit={handleHelpDeskSubmit}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section: Profile & Progress */}
              <div className={"lg:col-span-2 space-y-6"}>
                {/* Jika user belum setoran awal, tampilkan profil dan form setoran awal saja, lebar sama, stacked */}
                {profile && !profile.IsInitialDepositMade ? (
                  <>
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile || loadingInitial} />
                    <div className="my-4 border-t border-gray-300" />
                    {/* Alert info setoran awal */}
                    <div className="mb-4 p-4 rounded-md bg-yellow-100 border-l-4 border-yellow-400 flex items-center">
                      <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span className="text-yellow-800 font-medium">
                        Anda belum melakukan <b>setoran awal</b>. Silakan lakukan setoran awal untuk mengaktifkan seluruh fitur tabungan qurban.
                      </span>
                    </div>
                    {/* TransactionForms hanya untuk setoran awal, tetap di sini */}
                    <TransactionForms
                      profile={profile}
                      appConfig={appConfig}
                      user={user}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalSavingHistory={personalSavingHistory}
                      allPersonalTransferConfirmations={allPersonalTransferConfirmations}
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
                      loadingPersonal={loadingPersonal || loadingInitial}
                    />
                  </>
                ) : (
                  <>
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile || loadingInitial} />
                    {/* Mobile: Tab menu tetap, tapi fitur di dalamnya juga dikondisikan */}
                    <MobileDashboardTabs
                      user={user}
                      readNewsIds={readNewsIds}
                      setReadNewsIds={setReadNewsIds}
                      profile={profile}
                      loadingProfile={loadingProfile || loadingInitial}
                      appConfig={appConfig}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalTransferred={personalTransferred}
                      loadingPersonal={loadingPersonal || loadingInitial}
                      formatRupiah={formatRupiah}
                      getMonthDifference={getMonthDifference}
                      transactionProps={{
                        profile,
                        appConfig,
                        user,
                        personalTotalRecorded,
                        personalUsed,
                        personalSavingHistory,
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
                        personalTransferred,
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
                    />
                    {/* Desktop: fitur-fitur lain hanya tampil jika setoran awal sudah dibuat dan approved */}
                    <div className="hidden lg:block space-y-6">
                      <PersonalProgress
                        profile={profile}
                        globalConfig={appConfig}
                        personalTotalRecorded={personalTotalRecorded}
                        personalUsed={personalUsed}
                        personalTransferred={personalTransferred}
                        loadingPersonal={loadingPersonal || loadingInitial}
                        formatRupiah={formatRupiah}
                        getMonthDifference={getMonthDifference}
                      />
                      <MilestoneProgram milestones={milestones} loadingMilestones={loadingMilestones} />
                      <NewsSection
                        userId={user?.id}
                        readNewsIds={readNewsIds}
                        setReadNewsIds={setReadNewsIds}
                        loadingNews={loadingNews}
                      />
                      <DocumentsResources documents={documents} loadingDocuments={loadingDocuments} />
                    </div>
                  </>
                )}
              </div>
              {/* Section: Transaction & History (desktop only) */}
              <div className="hidden lg:block lg:col-span-1 space-y-6">
                {(profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Approved") ? (
                  <>
                  
                    {/* TransactionForms hanya di kolom kanan desktop setelah setoran awal approved */}
                    <TransactionForms
                      profile={profile}
                      appConfig={appConfig}
                      user={user}
                      personalTotalRecorded={personalTotalRecorded}
                      personalUsed={personalUsed}
                      personalSavingHistory={personalSavingHistory}
                      allPersonalTransferConfirmations={allPersonalTransferConfirmations}
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
                      loadingPersonal={loadingPersonal || loadingInitial}
                    />
                    <SavingHistory
                      personalSavingHistory={personalSavingHistory}
                      loadingPersonal={loadingPersonal || loadingInitial}
                      formatRupiah={formatRupiah}
                      showConfirmModal={showConfirmModal}
                      handleEditTransaction={handleEditTransaction}
                      handleDeleteTransaction={handleDeleteSaving}
                    />
                    <TransferHistory
                      profile={profile}
                      allPersonalTransferConfirmations={allPersonalTransferConfirmations}
                      loadingPersonal={loadingPersonal || loadingInitial}
                      formatRupiah={formatRupiah}
                    />
                  </>
                ) : null}
              </div>
              {/* Section: Transaction (mobile/initial deposit not made) */}
              {/* Hapus TransactionForms di bawah, hanya tampilkan di kolom kanan jika user belum setoran awal */}
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