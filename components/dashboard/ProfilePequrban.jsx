import { CardSkeleton } from "./LoadingSkeletons"

export default function ProfilePequrban({ profile, loadingProfile }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Pequrban</h2>
      {loadingProfile ? (
        <CardSkeleton />
      ) : (
        profile && (
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Nama Pequrban:</strong> {profile.NamaPequrban || profile.Nama}
            </p>
            <p>
              <strong>Status Pequrban:</strong>{" "}
              {/* Status utama */}
              {profile.StatusPequrban && Array.isArray(profile.StatusPequrban) && profile.StatusPequrban.length > 0 ? (
                profile.StatusPequrban.map((statusItem, index) => (
                  <span
                    key={index}
                    className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 mr-1 mb-1 inline-block"
                  >
                    {statusItem}
                  </span>
                ))
              ) : (
                <span className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 mr-1 mb-1 inline-block">Normal</span>
              )}
              {/* Status tambahan */}
              {!profile.IsInitialDepositMade ? (
                <span className="font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 mr-1 mb-1 inline-block">Belum Setor</span>
              ) : profile.InitialDepositStatus === "Pending" ? (
                <span className="font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-800 mr-1 mb-1 inline-block">Pending Verification</span>
              ) : profile.InitialDepositStatus === "Approved" ? (
                <span className="font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 mr-1 mb-1 inline-block">Verified</span>
              ) : null}
            </p>
            {profile.Benefits && profile.Benefits.length > 0 ? (
              <p>
                <strong>Benefit Anda:</strong>{" "}
                {profile.Benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 mr-1 mb-1 inline-block align-middle"
                  >
                    {benefit}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-gray-500">Belum ada benefit yang ditetapkan.</p>
            )}
          </div>
        )
      )}
    </div>
  )
}
