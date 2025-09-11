"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import {
  FiSearch, FiMessageCircle, FiUser, FiLogOut, FiChevronDown, FiBell
} from "react-icons/fi"
import Chatbot from "./Chatbot.jsx"
import Link from "next/link"
import Notifications from "./Notification.jsx"

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener("mousedown", listener)
    return () => document.removeEventListener("mousedown", listener)
  }, [ref, handler])
}

const Topbar = () => {
  const router = useRouter()
  const { userData, userAuth, addAlert, verifyUser, Cases, Lawyers, Clients, Hearings } = useApp()
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
  const [showNotifications, setShowNotifications] = useState(false)

  const searchRef = useRef(null)
  const userDropdownRef = useRef(null)
  const notificationsRef = useRef(null)
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

  const topbarBg = "bg-white border-b border-gray-300 text-black"
  const inputBg = "bg-gray-100 border border-gray-300 text-black placeholder-gray-400"
  const dropdownBg = "bg-white border border-gray-300 text-black"
  const accentHover = "hover:bg-gray-200"

  useOnClickOutside(userDropdownRef, () => setShowUserDropdown(false))

  return (
    <div className={`h-16 flex items-center justify-between px-6 ${topbarBg}`}>
      {/* 🔍 Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search cases, clients, lawyers..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className={`w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${inputBg}`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto bg-white border border-gray-300">
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

        {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}

        {/* Chatbot */}
        <button onClick={() => setShowChatbot(true)} className="p-2 rounded-lg hover:bg-gray-200" title="Open Legal Assistant">
          <FiMessageCircle className="h-5 w-5" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200">
            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white">
              <span className="text-sm font-semibold">{user?.fullName?.charAt(0) || "U"}</span>
            </div>
            <span className="hidden md:block text-black">{user?.fullName || "User"}</span>
            <FiChevronDown className="h-4 w-4 text-black" />
          </button>

          {showUserDropdown && (
            <div className={`absolute top-full right-0 mt-1 w-56 rounded-lg shadow-xl z-50 ${dropdownBg}`}>
              <div className="p-3 border-b border-gray-300">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm">{user?.email}</p>
                <p className="text-xs capitalize">{user?.role}</p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/settings" onClick={() => setShowUserDropdown(false)}>
                  <span className="w-full px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-200">
                    <FiUser className="h-4 w-4" /> Profile & Settings
                  </span>
                </Link>
                <button
                  onClick={handleLogOut}
                  className="w-full px-3 py-2 flex items-center gap-2 text-red-500 hover:bg-gray-200"
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
