"use client"
import { useState } from "react"
import Sidebar from "./Shared/Sidebar"
import Topbar from "./Shared/Topbar"
import LoadingBar from "nextjs-toploader";
import { useApp } from "@/Context/Context.jsx"

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { theme } = useApp()

  // Theme-aware background classes
  const layoutBg = theme === "light" ? "bg-gray-100" : "bg-gray-900"
  const contentBg = theme === "light" ? "bg-white" : "bg-gray-800"

  return (
    <div className={`min-h-screen -mt-[62px] flex ${layoutBg} transition-colors duration-300`}>
      <LoadingBar
        color="#2563eb"
        height={3}
        showSpinner={false}
      />
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div
            className={`shadow-md rounded-lg p-6 min-h-[calc(100vh-64px)] transition-colors duration-300 ${contentBg}`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
