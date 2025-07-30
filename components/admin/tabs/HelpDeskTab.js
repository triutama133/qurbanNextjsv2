import React from "react";

const HelpDeskTab = ({ loadingHelpDesk, allHelpDeskTickets, ListSkeleton }) => (
  <>
    <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Help Desk</h2>
    {loadingHelpDesk ? <ListSkeleton /> : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiket ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User (Email)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertanyaan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allHelpDeskTickets.map((ticket) => (
              <tr key={ticket.TicketId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.TicketId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.UserId} (Perlu Email)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.Question.substring(0, 50)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.Status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => alert('Respond to ticket: ' + ticket.TicketId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Respond</button>
                  <button onClick={() => alert('Close ticket: ' + ticket.TicketId)} className="text-red-600 hover:text-red-900">Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

export default HelpDeskTab;
