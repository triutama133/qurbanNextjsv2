"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase"
import AdminOverview from "../../../components/admin/AdminOverview"
import AdminTabs from "../../../components/admin/AdminTabs"
import AdminHeader from "../../../components/admin/AdminHeader"
import PendingVerificationsTab from "../../../components/admin/tabs/PendingVerificationsTab"
import UserManagementTab from "../../../components/admin/tabs/UserManagementTab"
import HelpDeskTab from "../../../components/admin/tabs/HelpDeskTab"
import DocumentsTab from "../../../components/admin/tabs/DocumentsTab"
import MilestonesTab from "../../../components/admin/tabs/MilestonesTab"
import NewsTab from "../../../components/admin/tabs/NewsTab"
import ReportsTab from "../../../components/admin/tabs/ReportsTab"
import OperationalCostsTab from "../../../components/admin/tabs/OperationalCostsTab"
import QnATab from "../../../components/admin/tabs/QnATab"
import useAdminDashboardData from "../../../hooks/useAdminDashboardData"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("pending")
  const router = useRouter()

  const {
    // Overview data
    loadingOverview,
    overallProgramProgress,
    globalConfig,
    pendingInitialDeposits,
    pendingTransferConfirmations,

    // Users data
    loadingUsers,
    allUsers,

    // Content data
    loadingContent,
    allResources,
    allMilestones,
    allNewsletters,

    // Help desk data
    loadingHelpDesk,
    allHelpDeskTickets,

    // Reports data
    loadingReports,
    allSavingsHistory,
    allTransferHistory,

    // Actions
    handleVerifyInitialDeposit,
    handleVerifyTransferConfirmation,
    handleUpdateUser,
    handleDeleteUser,
    handleReplyToTicket,
    handleCloseTicket,
    handleAddResource,
    handleUpdateResource,
    handleDeleteResource,
    handleAddMilestone,
    handleUpdateMilestone,
    handleDeleteMilestone,
    handleAddNews,
    handleUpdateNews,
    handleDeleteNews,

    // Utility functions
    formatRupiah,
    CardSkeleton,
    ListSkeleton,
    handleRefreshAdminDashboard,
  } = useAdminDashboardData()
  // Logout handler
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  router.push("/qurban/login")
  }

  const tabs = [
    // { key: "overview", label: "Overview Program" },
    { key: "pending", label: "Verification Center" },
    { key: "users", label: "User Management" },
    { key: "reports", label: "Reports & Analytics" },
    { key: "helpdesk", label: "Help Desk" },
    { key: "documents", label: "Documents & Resources" },
    { key: "milestones", label: "Program Milestones" },
    { key: "news", label: "News & Updates" },
    { key: "costs", label: "Operational Costs" },
    { key: "qna", label: "QnA / FAQ" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      // case "overview":
      //   return (
      //     <AdminOverview
      //       loadingOverview={loadingOverview}
      //       overallProgramProgress={overallProgramProgress}
      //       globalConfig={globalConfig}
      //       formatRupiah={formatRupiah}
      //     />
      //   )
      case "pending":
        return (
          <PendingVerificationsTab
            loadingOverview={loadingOverview}
            pendingInitialDeposits={pendingInitialDeposits}
            pendingTransferConfirmations={pendingTransferConfirmations}
            formatRupiah={formatRupiah}
            handleVerifyInitialDeposit={handleVerifyInitialDeposit}
            handleVerifyTransferConfirmation={handleVerifyTransferConfirmation}
            ListSkeleton={ListSkeleton}
          />
        )
      case "users":
        return (
          <UserManagementTab
            loadingUsers={loadingUsers}
            allUsers={allUsers}
            handleUpdateUser={handleUpdateUser}
            handleDeleteUser={handleDeleteUser}
            formatRupiah={formatRupiah}
            ListSkeleton={ListSkeleton}
          />
        )
      case "reports":
        return (
          <ReportsTab
            loadingReports={loadingReports}
            allSavingsHistory={allSavingsHistory}
            allTransferHistory={allTransferHistory}
            overallProgramProgress={overallProgramProgress}
            formatRupiah={formatRupiah}
            ListSkeleton={ListSkeleton}
          />
        )
      case "helpdesk":
        return (
          <HelpDeskTab
            loadingHelpDesk={loadingHelpDesk}
            allHelpDeskTickets={allHelpDeskTickets}
            handleReplyToTicket={handleReplyToTicket}
            handleCloseTicket={handleCloseTicket}
            ListSkeleton={ListSkeleton}
          />
        )
      case "documents":
        return (
          <DocumentsTab
            loadingContent={loadingContent}
            allResources={allResources}
            handleAddResource={handleAddResource}
            handleUpdateResource={handleUpdateResource}
            handleDeleteResource={handleDeleteResource}
            CardSkeleton={CardSkeleton}
          />
        )
      case "milestones":
        return (
          <MilestonesTab
            loadingContent={loadingContent}
            allMilestones={allMilestones}
            handleAddMilestone={handleAddMilestone}
            handleUpdateMilestone={handleUpdateMilestone}
            handleDeleteMilestone={handleDeleteMilestone}
            CardSkeleton={CardSkeleton}
          />
        )
      case "news":
        return (
          <NewsTab
            loadingContent={loadingContent}
            allNewsletters={allNewsletters}
            handleAddNews={handleAddNews}
            handleUpdateNews={handleUpdateNews}
            handleDeleteNews={handleDeleteNews}
            CardSkeleton={CardSkeleton}
          />
        )
      case "costs":
        return (
          <OperationalCostsTab
            loadingOverview={loadingOverview}
            overallProgramProgress={overallProgramProgress}
            formatRupiah={formatRupiah}
            CardSkeleton={CardSkeleton}
          />
        )
      case "qna":
        return <QnATab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AdminHeader
        handleRefreshAdminDashboard={handleRefreshAdminDashboard}
        handleSignOut={handleSignOut}
        profile={null}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <AdminOverview
            loadingOverview={loadingOverview}
            overallProgramProgress={overallProgramProgress}
            globalConfig={globalConfig}
            formatRupiah={formatRupiah}
          />
        </div>
        <div className="grid grid-cols-1">
          <div>
            <AdminTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
              {renderTabContent()}
            </AdminTabs>
          </div>
        </div>
      </div>
    </div>
  )
}
