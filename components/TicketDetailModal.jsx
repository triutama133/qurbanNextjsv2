import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const TicketDetailModal = ({ open, onOpenChange, ticket, onClose, onReply, replyText, setReplyText }) => {
  if (!ticket) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Tiket</DialogTitle>
        </DialogHeader>
        <div className="mb-2">
          <span className="font-semibold">Judul:</span> {ticket.title}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> <Badge>{ticket.status}</Badge>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Prioritas:</span> <Badge>{ticket.priority}</Badge>
        </div>
        <div className="mb-2">
          <span className="font-semibold">Pesan:</span>
          <div className="bg-gray-50 border rounded p-2 mt-1 whitespace-pre-line">{ticket.message}</div>
        </div>
        {/* Reply Section */}
        {onReply && (
          <div className="mt-4">
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              placeholder="Tulis balasan..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Button onClick={onReply} disabled={!replyText}>Kirim Balasan</Button>
              <Button variant="outline" onClick={onClose}>Tutup</Button>
            </div>
          </div>
        )}
        {!onReply && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TicketDetailModal
