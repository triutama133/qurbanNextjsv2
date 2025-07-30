import { ListSkeleton } from "./LoadingSkeletons"

export default function MilestoneProgram({ milestones, loadingMilestones }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Milestone Program</h2>
      {loadingMilestones ? (
        <ListSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2 min-w-max">
            {milestones && milestones.length > 0 ? (
              Object.values(
                milestones.reduce((acc, milestone) => {
                  const yearMonth = `${milestone.Month}-${milestone.Year}`
                  if (!acc[yearMonth]) {
                    acc[yearMonth] = { month: milestone.Month, year: milestone.Year, activities: [] }
                  }
                  acc[yearMonth].activities.push(milestone)
                  return acc
                }, {}),
              )
                .sort((a, b) => {
                  const monthOrder = [
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ]
                  if (a.year !== b.year) return a.year - b.year
                  return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
                })
                .map((monthEntry, monthIndex) => (
                  <div
                    key={`milestone-view-${monthEntry.month}-${monthEntry.year}`}
                    className="flex-shrink-0 w-48 border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <h3 className="font-semibold text-sm mb-2 text-center text-gray-800">
                      {monthEntry.month} {monthEntry.year}
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {monthEntry.activities
                        .sort((a, b) => a.Order - b.Order)
                        .map((activity) => (
                          <li key={activity.MilestoneId} className="p-1 bg-white rounded shadow-sm text-center">
                            {activity.Activity}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">Belum ada milestone program.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
