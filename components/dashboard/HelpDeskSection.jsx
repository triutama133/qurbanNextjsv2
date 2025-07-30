"use client"

import { SmallSpinner, ListSkeleton } from "./LoadingSkeletons"

export default function HelpDeskSection({
  userHelpDeskTickets,
  loadingHelpDeskTickets,
  helpDeskFormLoading,
  handleHelpDeskSubmit,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-3">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Help Desk</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-md text-gray-800 mb-2">Kontak Kami:</h4>
          <p className="text-sm text-gray-600">Untuk pertanyaan lebih lanjut, silakan hubungi:</p>
          <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
            <li>Email: support@example.com</li>
            <li>Telepon: +62 812 3456 7890</li>
          </ul>
        </div>

        {/* Form Pertanyaan */}
        <form className="space-y-4" onSubmit={handleHelpDeskSubmit}>
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Tanyakan Sesuatu:
            </label>
            <textarea
              id="question"
              rows="4"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tulis pertanyaan Anda di sini..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center justify-center"
            disabled={helpDeskFormLoading}
          >
            {helpDeskFormLoading ? <SmallSpinner /> : null}
            {helpDeskFormLoading ? "Mengirim..." : "Kirim Pertanyaan"}
          </button>
        </form>
        <p id="helpDeskMessage" className="text-sm mt-3"></p>

        {/* Riwayat Tiket User */}
        <div className="mt-8">
          <h4 className="font-semibold text-md text-gray-800 mb-2">Riwayat Pertanyaan Anda</h4>
          {loadingHelpDeskTickets ? (
            <ListSkeleton />
          ) : (
            <div className="max-h-60 overflow-y-auto pr-2">
              {userHelpDeskTickets.length > 0 ? (
                userHelpDeskTickets.map((ticket) => (
                  <div key={ticket.TicketId} className="flex flex-col py-2 border-b border-gray-200 last:border-b-0">
                    <p className="font-medium text-sm text-gray-900">
                      {ticket.Question.substring(0, 70)}
                      {ticket.Question.length > 70 ? "..." : ""}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                      <span>Diajukan: {new Date(ticket.Timestamp).toLocaleDateString("id-ID")}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          ticket.Status === "Open"
                            ? "bg-yellow-100 text-yellow-800"
                            : ticket.Status === "Answered"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ticket.Status}
                      </span>
                    </div>
                    {ticket.AdminResponse && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200">
                        <p className="font-semibold">Jawaban Admin:</p>
                        <p>{ticket.AdminResponse}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Dijawab:{" "}
                          {ticket.ResponseTimestamp
                            ? new Date(ticket.ResponseTimestamp).toLocaleDateString("id-ID")
                            : "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Belum ada pertanyaan yang Anda ajukan.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 text-center">
        <a href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
          &larr; Kembali ke Dashboard Utama
        </a>
      </div>
    </div>
  )
}
