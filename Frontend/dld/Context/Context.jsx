"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
const AppContext = createContext(null)
import {
    register, ResendCode, verify_register, Login, LogOut, getUser, updateAvatar, verifyJWT, editProfile,
    verifyAndUpdateProfile, forgetPass, updatePassword
} from "./Api/userAuth.js"
// cases
import { getCases, getCase, addCase, delCase, editCase, changeStatus, restoreFiles } from "./Api/cases.js"
// client
import { getClients, addClient, editClient, dellClient } from "./Api/Clients.js"
// lawyer
import { getLawyers, addLawyer, editLawyer, delLawyer } from "./Api/Lawyer.js"
// hearings
import {
    getHearings, addHearing, editHearing, delHearing, getNotifications, markNotificationRead, deleteNotification
} from "./Api/Hearings.js"
import { useRouter } from "next/navigation.js"

export function AppProvider({ children }) {
    const url = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    const router = useRouter()

    const [isEditProfile, setIsEditProfile] = useState(false)
    const [image, setImage] = useState("")
    const [userData, setUserData] = useState()
    const [isVerify, setIsVerify] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const [cases, setCases] = useState([])
    const [clients, setClients] = useState([])
    const [lawyers, setLawyers] = useState([])
    const [hearings, setHearings] = useState([])

    const [notifications, setNotifications] = useState([])
    const [unReadNotifications, setUnReadNotifications] = useState(0)

    // ✅ Add missing unreadMessages state (array)
    const [unreadMessages, setUnreadMessages] = useState([])

    // Alerts
    const [alerts, setAlerts] = useState([])
    const addAlert = (alertData) => {
        const id = crypto.randomUUID()
        const message = Array.isArray(alertData?.message) ? alertData.message[0] : (alertData?.message || "")
        const alert = { id, message, statusCode: alertData?.statusCode, type: alertData?.type }
        setAlerts((prev) => [...prev, alert])
        setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== id)), 4000)
    }
    const removeAlert = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id))

    // Verify JWT
    const verifyToken = async () => {
        const currentPath = window.location.pathname
        if (currentPath.startsWith("/change-password") || currentPath.startsWith("/email-verify")) {
            return
        }
        try {
            const data = await verifyJWT(setIsVerify)
            if (data.statusCode === 400 || data.message === "Token is invalid or expired") {
                setIsVerify(false)
                setIsLoggedIn(false)
                router.push("/")
                localStorage.removeItem("dld_user_token")
            } else {
                setIsVerify(true)
                setIsLoggedIn(true)
            }
        } catch (error) {
            console.log("Token is invalid")
        }
    }

    // Fetch user
    const fetchUser = async () => {
        try {
            if (!isLoggedIn) return
            const data = await getUser()
            addAlert(data)
            if (data.statusCode === 400) {
                localStorage.removeItem("dld_user_token")
                router.push("/")
            }
            if (data.statusCode === 200) {
                setUserData(data.data)
                setIsLoggedIn(true)
            }
        } catch (error) {
            console.log("Failed to fetch user:", error.message)
        }
    }

    useEffect(() => {
        verifyToken()
        if (isLoggedIn === true) {
            fetchUser()
        }
    }, [isLoggedIn])

    // Data fetchers
    const getAllCases = async () => {
        try {
            if (!isLoggedIn) return
            const data = await getCases()
            if (data.statusCode === 200) setCases(data.data)
        } catch {
            addAlert({ type: "error", message: "Failed to fetch cases" })
        }
    }

    // get all clients
    const fetchALlClients = async () => {
        try {
            if (!isLoggedIn) return
            const data = await getClients()
            if (data.statusCode === 200) setClients(data.data)
        } catch {
            addAlert({ type: "error", message: "Failed to fetch clients" })
        }
    }

    // get all lawyer
    const fetchAllLawyers = async () => {
        try {
            if (!isLoggedIn) return
            const data = await getLawyers()
            if (data.statusCode === 200) setLawyers(data.data)
        } catch {
            addAlert({ type: "error", message: "Failed to fetch lawyers" })
        }
    }

    // get all hearings
    const fetchHearings = async () => {
        if (!isLoggedIn) return
        const data = await getHearings()
        if (data.statusCode === 200) {
            setHearings(data.data)
        } else {
            addAlert({ type: "error", message: "Failed to fetch hearings" })
        }
    }

    // get all notifications
    const fetchNotifications = async () => {
        if (!isLoggedIn) return
        const data = await getNotifications()
        if (data.statusCode === 200) {
            setNotifications(data.data)
            setUnReadNotifications(data.data.filter(n => !n.isRead).length)
        } else {
            addAlert({ type: "error", message: "Failed to fetch notifications" })
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            getAllCases()
            fetchALlClients()
            fetchAllLawyers()
            fetchHearings()
            fetchNotifications()
        }
    }, [isLoggedIn])

    // Socket
    useEffect(() => {
        if (!isLoggedIn) return
        const token = localStorage.getItem("dld_user_token")
        const socket = io(url, {
            query: { token },
            auth: { token },
            transports: ["websocket"]
        })

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server")
        })

        socket.on("notification", async (payload) => {
            // Optional: enrich hearing notifications with case info
            if ((payload.type === "addHearing" || payload.type === "notify") && payload.meta?.caseId) {
                try {
                    const res = await getCases()
                    const caseData = res.statusCode === 200 ? res.data.find(c => c._id === payload.meta.caseId) : null
                    if (caseData) {
                        payload.meta.caseTitle = caseData.caseTitle
                        payload.meta.courtLocation = payload.meta.courtLocation || caseData.courtLocation
                    }
                } catch (err) {
                    console.error("Failed to fetch case for notification")
                }
            }

            // Prepend to notifications
            setNotifications(prev => [payload, ...prev])
            // If it arrives as unread, bump the counter
            if (!payload.isRead) {
                setUnReadNotifications(prev => prev + 1)
            }

            // Toast
            addAlert({
                type: payload.type?.includes("deleted") ? "error" : "success",
                message: payload.meta?.caseTitle
                    ? `${payload.body} - ${payload.meta.caseTitle} (${payload.meta.courtLocation})`
                    : payload.body
            })
        })

        // handle incoming unread chat messages
        socket.on("message", (msg) => {
            setUnreadMessages(prev => [msg, ...prev])
        })

        socket.on("disconnect", () => console.log("Disconnected from Socket.IO server"))

        return () => socket.disconnect()
    }, [isLoggedIn, url])

    const userProfile = { isEditProfile, setIsEditProfile }
    const verifyUser = { isVerify, isLoggedIn, setIsLoggedIn }
    const userAuth = {
        register, ResendCode, verify_register, Login, LogOut, getUser, updateAvatar, verifyJWT, editProfile,
        verifyAndUpdateProfile, forgetPass, updatePassword
    }
    const userImage = { image, setImage }
    const Cases = { cases, getCases, setCases, getCase, addCase, delCase, editCase, changeStatus, restoreFiles }
    const Clients = { clients, setClients, addClient, editClient, dellClient }
    const Lawyers = { lawyers, setLawyers, addLawyer, editLawyer, delLawyer }

    const Hearings = {
        hearings, setHearings, addHearing, editHearing, delHearing, notifications, setNotifications,
        markNotificationRead, deleteNotification, unReadNotifications, setUnReadNotifications,
        unreadMessages, setUnreadMessages, fetchNotifications
    }

    const value = {
        alerts, addAlert, removeAlert, userAuth, userProfile, verifyUser, userImage, userData, setUserData,
        Cases, Clients, Lawyers, Hearings
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error("useApp must be used within AppProvider")
    return ctx
}
