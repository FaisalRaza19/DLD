"use client"
import { useState } from "react"
import Sidebar from "./Shared/Sidebar"
import Topbar from "./Shared/Topbar"
import LoadingBar from "nextjs-toploader"

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen -mt-[62px] flex bg-gray-100 transition-colors duration-300">
      <LoadingBar
        color="#000"
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
        <main className="flex-1 overflow-auto p-6 md:p-8 bg-gray-100">
          {/* Children Container */}
          <div className="flex justify-center md:justify-start">
            <div className="w-full max-w-6xl bg-white shadow-md rounded-lg transition-colors duration-300 p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
