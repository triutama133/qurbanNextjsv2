import React from "react"

export default function AdminTabs(props) {
  // Props: semua state dan handler yang dibutuhkan tab
  // Silakan lanjutkan pemecahan tab ke file terpisah jika ingin lebih modular
  return (
    <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {props.tabs.map(tab => (
          <button
            key={tab.key}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${props.activeTab === tab.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => props.setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="tab-content">
        {props.children}
      </div>
    </div>
  )
}
