"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import { FiHome, FiBriefcase, FiUsers, FiUserCheck, FiHardDrive, FiSettings } from "react-icons/fi"
import { IoCalendarOutline } from "react-icons/io5";

const Sidebar = () => {
  const pathname = usePathname()
  const { userData, theme } = useApp()
  const user = userData

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Cases", href: "/dashboard/cases", icon: FiBriefcase },
    { name: "Calender", href: "/dashboard/calender", icon: IoCalendarOutline },
    { name: "Clients", href: "/dashboard/clients", icon: FiUsers },
    ...(user?.role === "Law Firm"
      ? [{ name: "Lawyers", href: "/dashboard/lawyers", icon: FiUserCheck }]
      : []),
    { name: "Backup", href: "/dashboard/backup", icon: FiHardDrive },
    { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
  ]

  // Theme-aware classes
  const sidebarBg = theme === "light" ? "bg-white border-r border-gray-200 text-gray-800" : "bg-gray-900 border-r border-gray-700 text-gray-100"
  const itemActive = theme === "light" ? "bg-blue-100 text-blue-800" : "bg-blue-800 text-blue-100"
  const itemHover = theme === "light" ? "hover:bg-blue-50 hover:text-blue-800" : "hover:bg-blue-700 hover:text-blue-100"
  const userBg = theme === "light" ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
  const textSecondary = theme === "light" ? "text-gray-500" : "text-gray-400"

  return (
    <div className={`w-64 h-full flex flex-col ${sidebarBg}`}>
      {/* Logo/Brand */}
      <div className={`p-6 flex border-b ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <Link href={"/"}>
          <FiHome size={25} className="mt-1" />
        </Link>
        <h1 className="text-xl font-bold ml-4">Digital Lawyer Diary (DLD) </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? itemActive : itemHover
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`p-4 border-t ${theme === "light" ? "border-gray-200" : "border-gray-700"}`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${userBg}`}>
            <span className="font-semibold">{user?.fullName?.charAt(0) || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
            <p className={`text-xs truncate ${textSecondary}`}>{user?.role || "Role"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
