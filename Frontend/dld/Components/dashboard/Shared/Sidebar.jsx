"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { FiHome, FiBriefcase, FiUsers, FiUserCheck, FiHardDrive, FiSettings, FiMenu, FiX } from "react-icons/fi"
import { IoCalendarOutline } from "react-icons/io5"
import { useApp } from "@/Context/Context.jsx"

const Sidebar = () => {
  const pathname = usePathname()
  const { userData } = useApp()
  const user = userData

  const [mobileOpen, setMobileOpen] = useState(false)

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Cases", href: "/dashboard/cases", icon: FiBriefcase },
    { name: "Calendar", href: "/dashboard/calender", icon: IoCalendarOutline },
    { name: "Clients", href: "/dashboard/clients", icon: FiUsers },
    ...(user?.role === "Law Firm"
      ? [{ name: "Lawyers", href: "/dashboard/lawyers", icon: FiUserCheck }]
      : []),
    { name: "Backup", href: "/dashboard/backup", icon: FiHardDrive },
    { name: "Settings", href: "/dashboard/settings", icon: FiSettings },
  ]

  const itemActive = "bg-black text-white"
  const itemHover = "hover:bg-gray-200"

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden top-0 left-0 right-0 p-4 bg-white w-12 h-16 border-b border-gray-300">
        <button onClick={() => setMobileOpen(true)}>
          <FiMenu size={25} className="mt-2"/>
        </button>
      </div>


      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-64 h-full flex-col bg-white border-r border-gray-300">
        {/* Logo/Brand */}
        <div className="p-6 flex border-b border-gray-300">
          <Link href={"/"}>
            <FiHome size={25} className="mt-1" />
          </Link>
          <h1 className="text-xl font-bold ml-4">Digital Lawyer Diary</h1>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? itemActive : itemHover}`}
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
        <div className="p-4 border-t border-gray-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white">
              <span className="font-semibold">{user?.fullName?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || "Role"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/25"
            onClick={() => setMobileOpen(false)}
          ></div>

          {/* Sidebar Panel */}
          <div className="relative w-64 bg-white h-full flex flex-col">
            <div className="p-6 flex justify-between border-b border-gray-300">
              <Link href={"/"}>
                <FiHome size={25} className="mt-1" />
              </Link>
              <h1 className="text-xl font-bold">DLD</h1>
              <button onClick={() => setMobileOpen(false)}>
                <FiX size={25} />
              </button>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? itemActive : itemHover}`}
                        onClick={() => setMobileOpen(false)}
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
            <div className="p-4 border-t border-gray-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-black flex justify-center item-center text-white">
                  <span className="font-semibold">{user?.fullName?.charAt(0) || "U"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.role || "Role"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
