"use client"

export default function AdminTabs({ tabs, activeTab, setActiveTab, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Enhanced Tab Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`
                flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 relative
                ${
                  activeTab === tab.key
                    ? "text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }
              `}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{children}</div>
    </div>
  )
}
