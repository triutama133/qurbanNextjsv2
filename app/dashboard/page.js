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
              allPersonalTransferConfirmations={transactionProps.allPersonalTransferConfirmations}
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
  // --- All hooks at the top, unconditionally ---
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "main";
  const dashboardData = useDashboardData();
  const {
    user, setUser, profile, setProfile, appConfig,
    personalTotalRecorded, setPersonalTotalRecorded, personalUsed, setPersonalUsed, personalTransferred,
    personalSavingHistory, setPersonalSavingHistory, personalTransferConfirmations, setPersonalTransferConfirmations,
    allPersonalTransferConfirmations, setAllPersonalTransferConfirmations, userHelpDeskTickets, setUserHelpDeskTickets, news, milestones, documents, newsPage, setNewsPage, newsTotal,
    NEWS_PER_PAGE, loadingInitial, setLoadingInitial, loadingProfile, loadingAppConfig, loadingPersonal,
    loadingNews, loadingMilestones, loadingHelpDeskTickets, loadingDocuments, error, setError,
    fetchUserAndInit, fetchProfile, fetchAppConfigSection, fetchPersonalSectionData,
    fetchNewsSection, fetchMilestonesSection, fetchHelpDeskTicketsSection, fetchResourcesSection,
    setNews, setMilestones, setDocuments,
  } = dashboardData;

  const [kuisionerChecked, setKuisionerChecked] = useState(false);
  const [allNews, setAllNews] = useState([]);
  const [readNewsIds, setReadNewsIds] = useState([]);
  const readNewsIdsRef = useRef(readNewsIds);
  const hasInit = useRef(false);

  // --- Hooks logic ---
  useEffect(() => {
    if (!user) {
      fetchUserAndInit(router);
    }
  }, [user, fetchUserAndInit, router]);

  useEffect(() => {
    async function checkKuisioner() {
      if (!user || !user.UserId) {
        return;
      }
      try {
        const url = `/api/kuisioner-status?user_id=${user.UserId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!data.filled) {
            router.replace('/kuisioner');
            return;
          }
        }
      } catch (e) {}
      setKuisionerChecked(true);
    }
    checkKuisioner();
  }, [user, router]);

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
  }, []);

  useEffect(() => {
    readNewsIdsRef.current = readNewsIds
  }, [readNewsIds]);

  useEffect(() => {
    async function fetchReadNews() {
      let userId = null
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
  }, [user]);

  useEffect(() => {
    if (!hasInit.current) {
      fetchUserAndInit(router)
      hasInit.current = true
    }
  }, [fetchUserAndInit]);

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id)
    }
    if (user && !appConfig) {
      fetchAppConfigSection()
    }
  }, [user, profile, appConfig, fetchProfile, fetchAppConfigSection]);

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
  }, [user, profile, appConfig, newsPage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("qurban_user")
      if (!userStr) {
        router.push("/login")
      }
    }
  }, [router]);

  // --- Dashboard actions ---
  const dashboardActions = useDashboardActions({
    user, profile, appConfig, personalTotalRecorded, personalUsed,
    setPersonalSavingHistory, setPersonalTotalRecorded, setPersonalUsed, setPersonalTransferConfirmations,
    setUserHelpDeskTickets, setProfile, formatRupiah,
    fetchPersonalSectionData,
  });
  const {
    addSavingLoading, useSavingLoading, confirmTransferLoading, helpDeskFormLoading,
    handleAddSaving, handleUseSaving, handleInitialDeposit, handleConfirmTransfer, handleHelpDeskSubmit,
    showConfirmModal, handleEditTransaction, handleDeleteSaving, handleDeleteTransferConfirmation,
  } = dashboardActions;

  // --- Handler for Help Desk tab ---
  const handleGoToHelpDesk = () => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", "helpdesk")
    router.push(`/dashboard?${params.toString()}`)
  };

  // --- Notification logic ---
  let notifications = [];
  if (allNews && allNews.length > 0) {
    notifications = allNews.map((item) => ({
      title: "Berita Baru",
      message: item.Title,
      time: item.DatePublished,
      read: readNewsIds.includes(item.NewsletterId),
      action: () => {
        const event = new CustomEvent("openNewsModal", { detail: item })
        window.dispatchEvent(event)
      },
      actionLabel: "Read More",
      type: "berita"
    }));
  }
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

  // --- Render logic ---
  if (!kuisionerChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  const totalNewsPages = Math.max(1, Math.ceil(newsTotal / NEWS_PER_PAGE));

  if (profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Pending") {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader
          profile={profile}
          handleRefreshDashboard={dashboardActions.handleRefreshDashboard || (() => {})}
          handleSignOut={dashboardActions.handleSignOut || (() => {})}
          handleGoToHelpDesk={handleGoToHelpDesk}
        />
        <main className="max-w-2xl mx-auto py-10 px-4">
          <ProfilePequrban profile={profile} loadingProfile={loadingProfile || loadingInitial} />
          <div className="mt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow-lg p-8 flex items-center">
              <svg className="w-10 h-10 text-yellow-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <div>
                <div className="font-bold text-yellow-800 text-lg mb-1">Setoran Awal berhasil dikirim</div>
                <div className="text-yellow-700 text-base">Setoran Awal berhasil dikirim, menunggu verifikasi dari admin. Akses ke seluruh fitur akan aktif setelah setoran awal Approved oleh Admin.</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Rejected") {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader
          profile={profile}
          handleRefreshDashboard={dashboardActions.handleRefreshDashboard || (() => {})}
          handleSignOut={dashboardActions.handleSignOut || (() => {})}
          handleGoToHelpDesk={handleGoToHelpDesk}
        />
        <main className="max-w-2xl mx-auto py-10 px-4">
          <ProfilePequrban profile={profile} loadingProfile={loadingProfile || loadingInitial} />
          <div className="mt-6">
            <div className="bg-red-50 border-l-4 border-red-400 rounded-xl shadow-lg p-8 flex items-center">
              <svg className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <div>
                <div className="font-bold text-red-800 text-lg mb-1">Setoran Awal Ditolak</div>
                <div className="text-red-700 text-base">Setoran awal ditolak, mohon periksa kembali bukti transfer kamu</div>
                {profile.InitialDepositAdminNotes && (
                  <div className="text-red-700 text-sm mt-2">Alasan: {profile.InitialDepositAdminNotes}</div>
                )}
              </div>
            </div>
            <div className="mt-6">
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
                formatRupiah={formatRupiah}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        profile={profile}
        handleRefreshDashboard={dashboardActions.handleRefreshDashboard || (() => {})}
        handleSignOut={dashboardActions.handleSignOut || (() => {})}
        handleGoToHelpDesk={handleGoToHelpDesk}
      >
        {profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Approved" && (
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
              loadingHelpDeskTickets={loadingHelpDeskFormLoading || loadingInitial}
              helpDeskFormLoading={helpDeskFormLoading}
              handleHelpDeskSubmit={handleHelpDeskSubmit}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={"lg:col-span-2 space-y-6"}>
                {profile && !profile.IsInitialDepositMade ? (
                  <>
                    <ProfilePequrban profile={profile} loadingProfile={loadingProfile || loadingInitial} />
                    <div className="my-4 border-t border-gray-300" />
                    <div className="mb-4 p-4 rounded-md bg-yellow-100 border-l-4 border-yellow-400 flex items-center">
                      <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span className="text-yellow-800 font-medium">
                        Anda belum melakukan <b>setoran awal</b>. Silakan lakukan setoran awal untuk mengaktifkan seluruh fitur tabungan qurban.
                      </span>
                    </div>
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
                        allPersonalTransferConfirmations={allPersonalTransferConfirmations}
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
              <div className="hidden lg:block lg:col-span-1 space-y-6">
                {(profile && profile.IsInitialDepositMade && profile.InitialDepositStatus === "Approved") ? (
                  <>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
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