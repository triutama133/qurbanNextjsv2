"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Reply, X, Clock, CheckCircle, User } from "lucide-react"
import { ListSkeleton } from "@/components/dashboard/LoadingSkeletons"
import TicketDetailModal from "@/components/TicketDetailModal" // Import TicketDetailModal

const HelpDeskTab = ({ loadingHelpDesk, allHelpDeskTickets, handleReplyToTicket, handleCloseTicket }) => {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)

  const getStatusBadge = (status) => {
    const variants = {
      Open: "bg-green-100 text-green-800 border-green-200",
      "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Closed: "bg-gray-100 text-gray-800 border-gray-200",
      Resolved: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return variants[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-green-100 text-green-800 border-green-200",
    }
    return variants[priority] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !replyingTo) return

    try {
      await handleReplyToTicket(replyingTo.TicketId, replyText)
      setReplyText("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  const handleClose = async (ticketId) => {
    try {
      await handleCloseTicket(ticketId)
    } catch (error) {
      console.error("Error closing ticket:", error)
    }
  }

  // Statistik tickets
  const openTickets = allHelpDeskTickets.filter((t) => t.Status === "Open").length
  const inProgressTickets = allHelpDeskTickets.filter((t) => t.Status === "In Progress").length
  const closedTickets = allHelpDeskTickets.filter((t) => t.Status === "Closed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Help Desk</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {openTickets} Open
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {inProgressTickets} In Progress
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {closedTickets} Closed
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{allHelpDeskTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Response</p>
                <p className="text-2xl font-bold text-gray-900">{openTickets + inProgressTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{closedTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadingHelpDesk ? (
        <ListSkeleton />
      ) : allHelpDeskTickets.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pertanyaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allHelpDeskTickets.map((ticket) => (
                  <tr key={ticket.TicketId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{ticket.TicketId}</div>
                      <div className="text-xs text-gray-500">
                        Priority:{" "}
                        <Badge size="sm" className={getPriorityBadge(ticket.Priority || "Medium")}>
                          {ticket.Priority || "Medium"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{ticket.UserName || "Unknown"}</div>
                          <div className="text-sm text-gray-500">ID: {ticket.UserId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{ticket.Question}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(ticket.Status)}>{ticket.Status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.CreatedAt ? new Date(ticket.CreatedAt).toLocaleDateString("id-ID") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedTicket(ticket)}>
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detail Ticket #{ticket.TicketId}</DialogTitle>
                            </DialogHeader>
                            {selectedTicket && (
                              <TicketDetailModal
                                ticket={selectedTicket}
                                onReply={(ticket) => setReplyingTo(ticket)}
                                onClose={handleClose}
                              />
                            )}
                          </DialogContent>
                        </Dialog>

                        {ticket.Status !== "Closed" && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => setReplyingTo(ticket)}
                                >
                                  <Reply className="w-4 h-4 mr-1" />
                                  Reply
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Balas Ticket #{ticket.TicketId}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">Pertanyaan:</p>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm">{ticket.Question}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Balasan Anda:
                                    </label>
                                    <Textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Tulis balasan untuk user..."
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button onClick={handleSendReply} disabled={!replyText.trim()} className="flex-1">
                                      Kirim Balasan
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setReplyingTo(null)
                                        setReplyText("")
                                      }}
                                      className="flex-1"
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <X className="w-4 h-4 mr-1" />
                                  Close
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tutup Ticket</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menutup ticket #{ticket.TicketId}? Ticket yang ditutup tidak
                                    dapat dibuka kembali.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleClose(ticket.TicketId)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ya, Tutup Ticket
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Ticket</h3>
          <p className="text-gray-500">Belum ada ticket help desk yang masuk.</p>
        </div>
      )}
    </div>
  )
}

export default HelpDeskTab
