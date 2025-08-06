import { ListSkeleton } from "./LoadingSkeletons"

export default function MilestoneProgram({ milestones, loadingMilestones }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Milestone Program</h2>
      {/* Keterangan urutan */}
      <div className="mb-2">
        <span className="block text-xs text-gray-500 lg:hidden">Urutan bulan: baca dari atas ke bawah, lalu ke kolom kanan.</span>
        <span className="hidden lg:block text-xs text-gray-500">Urutan bulan: baca dari kiri ke kanan, baris per baris.</span>
      </div>
      {loadingMilestones ? (
        <ListSkeleton />
      ) : (
        // Mobile: grid 2 kolom urut vertikal, Desktop: grid 3 kolom
        <div>
          {/* Mobile: grid 2 kolom urut vertikal */}
          <div className="grid grid-cols-2 gap-4 pb-2 lg:hidden">
            {(() => {
              if (!milestones || milestones.length === 0) {
                return <p className="text-gray-500 text-sm col-span-2">Belum ada milestone program.</p>;
              }
              const monthOrder = [
                "Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"
              ];
              const grouped = Object.values(
                milestones.reduce((acc, milestone) => {
                  const yearMonth = `${milestone.Month}-${milestone.Year}`;
                  if (!acc[yearMonth]) {
                    acc[yearMonth] = { month: milestone.Month, year: milestone.Year, activities: [] };
                  }
                  acc[yearMonth].activities.push(milestone);
                  return acc;
                }, {})
              ).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
              });
              const colCount = 2;
              const perCol = Math.ceil(grouped.length / colCount);
              const columns = Array.from({ length: colCount }, (_, i) =>
                grouped.slice(i * perCol, (i + 1) * perCol)
              );
              return (
                <>
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-4">
                      {col.map((monthEntry, idx) => {
                        // Hitung nomor urut global (vertikal per kolom)
                        const cardNumber = colIdx * perCol + idx + 1;
                        return (
                          <div
                            key={`milestone-view-${monthEntry.month}-${monthEntry.year}`}
                            className="flex-shrink-0 w-48 border border-gray-200 rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="inline-block bg-green-100 text-green-700 text-xs font-bold rounded-full px-2 py-0.5">{cardNumber}</span>
                            </div>
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
                        );
                      })}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
          {/* Desktop: grid 3 kolom urut biasa */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4 pb-2">
            {(() => {
              if (!milestones || milestones.length === 0) {
                return <p className="text-gray-500 text-sm col-span-3">Belum ada milestone program.</p>;
              }
              const monthOrder = [
                "Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"
              ];
              const grouped = Object.values(
                milestones.reduce((acc, milestone) => {
                  const yearMonth = `${milestone.Month}-${milestone.Year}`;
                  if (!acc[yearMonth]) {
                    acc[yearMonth] = { month: milestone.Month, year: milestone.Year, activities: [] };
                  }
                  acc[yearMonth].activities.push(milestone);
                  return acc;
                }, {})
              ).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
              });
              return grouped.map((monthEntry, idx) => (
                <div
                  key={`milestone-view-${monthEntry.month}-${monthEntry.year}`}
                  className="flex-shrink-0 w-48 border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold rounded-full px-2 py-0.5">{idx + 1}</span>
                  </div>
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
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
