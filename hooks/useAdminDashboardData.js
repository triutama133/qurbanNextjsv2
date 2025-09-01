"use client"

import { useState, useEffect } from "react"

export default function useAdminDashboardData() {
  // State untuk berbagai data
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingHelpDesk, setLoadingHelpDesk] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)

  // Data states
  // Default values for overview to ensure card always shows
  const defaultOverview = {
    totalCollectedAmount: 0,
    confirmedAmount: 0,
    totalUsedAmount: 0,
    totalCosts: 0,
    cowStatus: { fullTarget: 0, green: 0, yellow: 0 },
    totalUsers: 0,
    pendingInitialDeposits: 0,
  }
  const [overallProgramProgress, setOverallProgramProgress] = useState(defaultOverview)
  const [globalConfig, setGlobalConfig] = useState({})
  const [pendingInitialDeposits, setPendingInitialDeposits] = useState([])
  const [pendingTransferConfirmations, setPendingTransferConfirmations] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allResources, setAllResources] = useState([])
  const [allMilestones, setAllMilestones] = useState([])
  const [allNewsletters, setAllNewsletters] = useState([])
  const [allHelpDeskTickets, setAllHelpDeskTickets] = useState([])
  const [allSavingsHistory, setAllSavingsHistory] = useState([])
  const [allTransferHistory, setAllTransferHistory] = useState([])


  // Fetch all admin dashboard data from API
  const fetchAllAdminData = async () => {
    try {
      setLoadingOverview(true)
      setLoadingUsers(true)
      setLoadingContent(true)
      setLoadingHelpDesk(true)
      setLoadingReports(true)

      const response = await fetch("/api/admin-dashboard")
      const data = await response.json()

      // Overview
      setOverallProgramProgress({
        totalCollectedAmount: data.totalTabunganTercatat ?? 0,
        confirmedAmount: data.totalDanaTerkonfirmasi ?? 0,
        totalUsedAmount: data.totalTabunganTerpakai ?? 0,
        totalCosts: data.totalBiayaOperasional ?? 0,
        cowStatus: data.cowStatus || { fullTarget: 0, green: 0, yellow: 0 },
        totalUsers: data.totalUserTerdaftar ?? 0,
        verifiedInitialDepositUsers: data.verifiedUserSetoranAwal ?? 0,
      })
      setGlobalConfig({}) // Optional, or map if needed
      setPendingInitialDeposits(data.setoranPending || [])
      setPendingTransferConfirmations(data.transferPending || [])

      // Users - ensure StatusPequrban is present for UI
      const mappedUsers = (data.userList || []).map(u => ({
        ...u,
        StatusPequrban: u.StatusPequrban ?? "N/A",
      }))
      // Helpful debug during development
      try {
        console.debug('admin-dashboard: loaded users count', mappedUsers.length)
      } catch (e) {}
      setAllUsers(mappedUsers)

      // Content
      setAllResources(data.resourceList || [])
      setAllMilestones([]) // Belum ada di API, sesuaikan jika ada
      setAllNewsletters(data.newsList || [])

      // Help Desk (belum ada di API, set kosong dulu)
      setAllHelpDeskTickets([])

      // Reports
      setAllSavingsHistory((data.transaksiList || []).filter(t => t.Tipe === 'Setoran'))
      setAllTransferHistory((data.transaksiList || []).filter(t => t.Tipe === 'Transfer'))
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error)
    } finally {
      setLoadingOverview(false)
      setLoadingUsers(false)
      setLoadingContent(false)
      setLoadingHelpDesk(false)
      setLoadingReports(false)
    }
  }

  // Action handlers
  const handleVerifyInitialDeposit = async (userId, status) => {
    try {
      const response = await fetch("/api/admin/verify-initial-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      })

      if (response.ok) {
        // Refresh data
        fetchAllAdminData()
      }
    } catch (error) {
      console.error("Error verifying initial deposit:", error)
    }
  }

  const handleVerifyTransferConfirmation = async (confirmationId, status) => {
    try {
      const response = await fetch("/api/admin/verify-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationId, status }),
      })

      if (response.ok) {
        // Refresh data
        fetchAllAdminData()
      }
    } catch (error) {
      console.error("Error verifying transfer:", error)
    }
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...userData }),
      })

      if (response.ok) {
  // refresh full admin data after update
  fetchAllAdminData()
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
  fetchAllAdminData()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleReplyToTicket = async (ticketId, reply) => {
    try {
      const response = await fetch("/api/admin/reply-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, reply }),
      })

      if (response.ok) {
        fetchHelpDeskData()
      }
    } catch (error) {
      console.error("Error replying to ticket:", error)
    }
  }

  const handleCloseTicket = async (ticketId) => {
    try {
      const response = await fetch("/api/admin/close-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      })

      if (response.ok) {
        fetchHelpDeskData()
      }
    } catch (error) {
      console.error("Error closing ticket:", error)
    }
  }

  // Content management handlers
  const handleAddResource = async (resourceData) => {
    try {
      const response = await fetch("/api/admin/add-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error adding resource:", error)
    }
  }

  const handleUpdateResource = async (resourceId, resourceData) => {
    try {
      const response = await fetch("/api/admin/update-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, ...resourceData }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error updating resource:", error)
    }
  }

  const handleDeleteResource = async (resourceId) => {
    try {
      const response = await fetch("/api/admin/delete-resource", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error deleting resource:", error)
    }
  }

  const handleAddMilestone = async (milestoneData) => {
    try {
      const response = await fetch("/api/admin/add-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(milestoneData),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error adding milestone:", error)
    }
  }

  const handleUpdateMilestone = async (milestoneId, milestoneData) => {
    try {
      const response = await fetch("/api/admin/update-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, ...milestoneData }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error updating milestone:", error)
    }
  }

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      const response = await fetch("/api/admin/delete-milestone", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error deleting milestone:", error)
    }
  }

  const handleAddNews = async (newsData) => {
    try {
      const response = await fetch("/api/admin/add-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsData),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error adding news:", error)
    }
  }

  const handleUpdateNews = async (newsId, newsData) => {
    try {
      const response = await fetch("/api/admin/update-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, ...newsData }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error updating news:", error)
    }
  }

  const handleDeleteNews = async (newsId) => {
    try {
      const response = await fetch("/api/admin/delete-news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId }),
      })

      if (response.ok) {
        fetchContentData()
      }
    } catch (error) {
      console.error("Error deleting news:", error)
    }
  }

  // Utility functions
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Loading skeletons
  const CardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
      <div className="bg-gray-200 h-4 rounded mb-2"></div>
      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
    </div>
  )

  const ListSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
      ))}
    </div>
  )

  // Load data on mount
  useEffect(() => {
    fetchAllAdminData()
  }, [])

  // Untuk tombol refresh
  const handleRefreshAdminDashboard = () => {
    fetchAllAdminData()
  }

  return {
    // Loading states
    loadingOverview,
    loadingUsers,
    loadingContent,
    loadingHelpDesk,
    loadingReports,

    // Data
    overallProgramProgress,
    globalConfig,
    pendingInitialDeposits,
    pendingTransferConfirmations,
    allUsers,
    allResources,
    allMilestones,
    allNewsletters,
    allHelpDeskTickets,
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

    // Utilities
    formatRupiah,
    CardSkeleton,
    ListSkeleton,

    // Refresh handler
    handleRefreshAdminDashboard,
  }
}
