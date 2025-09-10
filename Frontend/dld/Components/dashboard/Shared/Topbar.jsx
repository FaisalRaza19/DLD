"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import {
  FiSearch, FiMessageCircle, FiSun, FiMoon, FiUser, FiLogOut, FiChevronDown, FiBell
} from "react-icons/fi"
import Chatbot from "./Chatbot.jsx"
import Link from "next/link"
import Notifications from "./Notification.jsx";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const Topbar = () => {
  const router = useRouter()
  const { userData, theme, toggleTheme, userAuth, addAlert, verifyUser, Cases, Lawyers, Clients, Hearings } = useApp()
  const { unReadNotifications } = Hearings
  const { cases } = Cases
  const { clients } = Clients
  const { lawyers } = Lawyers
  const { setIsLoggedIn } = verifyUser
  const { LogOut } = userAuth

  const user = userData

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef(null)
  const userDropdownRef = useRef(null)
  const notificationsRef = useRef(null);
  const debounceTimer = useRef(null)

  // 🔹 Handle logout
  const handleLogOut = async () => {
    try {
      const data = await LogOut()
      addAlert(data)
      if (data.statusCode === 200) {
        setIsLoggedIn(false)
        router.push("/")
      }
    } catch (error) {
      addAlert("error", error.message || "Internal server error during LogOut")
    }
  }

  // 🔹 Close dropdowns on outside click & Esc key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowSearchResults(false)
        setShowUserDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  // 🔹 Debounced search
  const handleSearch = useCallback((query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    const queryLower = query.toLowerCase()
    const results = []

    cases.forEach((case_) => {
      if (case_?.caseTitle?.toLowerCase().includes(queryLower)) {
        results.push({
          id: case_?._id,
          type: "case",
          title: case_?.caseTitle,
          description: case_?.caseDescription || case_?.caseType || "No description",
          url: `/dashboard/cases/${case_?._id}`,
        })
      }
    })

    clients.forEach((client) => {
      if (client.fullName?.toLowerCase().includes(queryLower)) {
        results.push({
          id: client?._id,
          type: "client",
          title: client.fullName,
          description: client.email || "No details",
          url: `/dashboard/clients`,
        })
      }
    })

    if (userData?.role === "Law Firm") {
      lawyers.forEach((lawyer) => {
        if (lawyer.fullName?.toLowerCase().includes(queryLower)) {
          results.push({
            id: lawyer?._id,
            type: "lawyer",
            title: lawyer.fullName,
            description: lawyer.specialization || lawyer.email || "No details",
            url: `/dashboard/lawyers`,
          })
        }
      })
    }

    setSearchResults(results.slice(0, 10))
    setShowSearchResults(true)
    setIsSearching(false)
  }, [cases, clients, lawyers, userData?.role])

  const handleSearchInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      handleSearch(query)
    }, 400)
  }

  const getResultIcon = (type) => {
    switch (type) {
      case "case": return "⚖️"
      case "client": return "👤"
      case "lawyer": return "👨‍💼"
      default: return "📄"
    }
  }

  const getResultColor = (type) => {
    switch (type) {
      case "case": return theme === "light" ? "bg-blue-100 text-blue-800" : "bg-blue-900 text-blue-200"
      case "client": return theme === "light" ? "bg-green-100 text-green-800" : "bg-green-900 text-green-200"
      case "lawyer": return theme === "light" ? "bg-purple-100 text-purple-800" : "bg-purple-900 text-purple-200"
      default: return theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-900 text-gray-200"
    }
  }

  // 🔹 Theme styles
  const topbarBg = theme === "light"
    ? "bg-white border-b border-gray-200 text-gray-800"
    : "bg-gray-900 border-b border-gray-700 text-gray-100"

  const inputBg = theme === "light"
    ? "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-400"
    : "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"

  const dropdownBg = theme === "light"
    ? "bg-white border border-gray-200 text-gray-800"
    : "bg-gray-800 border border-gray-700 text-gray-100"

  const accentHover = theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"

  useOnClickOutside(userDropdownRef, () => setShowUserDropdown(false));

  return (
    <div className={`h-16 flex items-center justify-between px-6 ${topbarBg}`}>
      {/* 🔍 Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === "light" ? "text-gray-500" : "text-gray-400"} h-4 w-4`} />
          <input
            type="text"
            placeholder="Search cases, clients, lawyers..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className={`w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {showSearchResults && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto ${dropdownBg}`}>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">{isSearching ? "Searching..." : "No results found"}</div>
            ) : (
              <>
                <div className="p-2 border-b text-xs text-gray-500">{`Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}</div>
                {searchResults.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}-${index}`}
                    href={result.url}
                    onClick={() => {
                      setShowSearchResults(false)
                      setSearchQuery("")
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 border-b last:border-b-0 transition-colors ${accentHover}`}
                  >
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(result.type)}`}>
                      {result.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm truncate">{result.description}</p>
                    </div>
                  </Link>
                ))}

              </>
            )}
          </div>
        )}
      </div>

      {/* ⚡ Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-full hover:bg-gray-200"
            title="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unReadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unReadNotifications}
              </span>
            )}
          </button>
        </div>

        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}

        {/* Chatbot */}
        <button onClick={() => setShowChatbot(true)} className={`p-2 rounded-lg relative ${accentHover}`} title="Open Legal Assistant">
          <FiMessageCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className={`p-2 rounded-lg ${accentHover}`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <FiMoon className="h-5 w-5" /> : <FiSun className="h-5 w-5" />}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button onClick={() => setShowUserDropdown(!showUserDropdown)} className={`flex items-center gap-2 p-2 rounded-lg ${accentHover}`}>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{user?.fullName?.charAt(0) || "U"}</span>
            </div>
            <span className="hidden md:block">{user?.fullName || "User"}</span>
            <FiChevronDown className="h-4 w-4" />
          </button>

          {showUserDropdown && (
            <div className={`absolute top-full right-0 mt-1 w-56 rounded-lg shadow-xl z-50 ${dropdownBg}`}>
              <div className="p-3 border-b">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm">{user?.email}</p>
                <p className="text-xs capitalize">{user?.role}</p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/settings" onClick={() => setShowUserDropdown(false)}>
                  <span className={`w-full px-3 py-2 flex items-center gap-2 cursor-pointer ${accentHover}`}>
                    <FiUser className="h-4 w-4" /> Profile & Settings
                  </span>
                </Link>
                <button
                  onClick={handleLogOut}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-red-500 ${accentHover}`}
                >
                  <FiLogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot modal */}
      <Chatbot isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  )
}

export default Topbar
