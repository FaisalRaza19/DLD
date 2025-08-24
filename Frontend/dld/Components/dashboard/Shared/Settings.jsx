"use client"
import { useState } from "react"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import ProfileForm from "./ProfileForm.jsx"
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiSettings, FiShield, FiBell, FiMoon, FiSun, FiGlobe, FiLock,
} from "react-icons/fi"
import { formatDate } from "@/Components/formatDate.js"

const Settings = () => {
    const { userData, theme, toggleTheme, addAlert, userImage } = useApp()
    const user = userData
    const { image } = userImage;
    const [showProfileForm, setShowProfileForm] = useState(false)
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false,
    })

    const handleNotificationChange = (type) => {
        setNotifications((prev) => ({
            ...prev,
            [type]: !prev[type],
        }))
        addAlert({ type: "success", message: "Notification preferences updated" })
    }

    const getInitials = (name) =>
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)

    // Theme-based class helpers
    const isDark = theme === "dark";
    const bgColor = isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";
    const headerTextColor = isDark ? "text-white" : "text-gray-900";
    const mutedTextColor = isDark ? "text-gray-400" : "text-gray-500";
    const cardBg = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";
    const primaryButtonClass = "bg-blue-600 text-white hover:bg-blue-500";
    const secondaryButtonClass = isDark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300";
    const toggleBgChecked = "bg-blue-600";
    const toggleBgUnchecked = isDark ? "bg-gray-600" : "bg-gray-300";
    const toggleCircle = isDark ? "bg-gray-300" : "bg-white";


    return (
        <DashboardLayout>
            <div className={`p-6 md:p-8 space-y-8 min-h-screen ${bgColor}`}>
                {/* Header */}
                <div className="space-y-2">
                    <h1 className={`text-3xl font-bold ${headerTextColor}`}>Settings</h1>
                    <p className={mutedTextColor}>
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Profile + Notifications */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Section */}
                        <div className={`${cardBg} rounded-lg p-6 shadow-sm`}>
                            <div className="flex justify-between items-start mb-6">
                                <h2 className={`text-xl font-semibold ${headerTextColor}`}>
                                    Profile Information
                                </h2>
                                <button
                                    onClick={() => setShowProfileForm(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${primaryButtonClass}`}
                                >
                                    <FiEdit className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-start gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {image || user?.avatar ? (
                                        <img
                                            src={image || user?.avatar?.avatarUrl || "/placeholder.svg"}
                                            alt={user.fullName}
                                            className={`h-20 w-20 rounded-full object-cover border-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}
                                        />
                                    ) : (
                                        <div className={`h-20 w-20 rounded-full flex items-center justify-center text-xl font-bold border-4 ${isDark ? "bg-gray-700 text-gray-400 border-gray-700" : "bg-gray-200 text-gray-600 border-gray-200"}`}>
                                            {getInitials(user?.fullName)}
                                        </div>
                                    )}
                                </div>

                                {/* Profile Details */}
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ProfileItem isDark={isDark} icon={FiUser} label="Full Name" value={user?.fullName} />
                                        <ProfileItem isDark={isDark} icon={FiMail} label="Email" value={user?.email} />
                                        <ProfileItem isDark={isDark} icon={FiPhone} label="Phone" value={user?.phoneNumber} />
                                        <ProfileItem isDark={isDark} icon={FiShield} label="Role" value={user?.role} capitalize />
                                    </div>

                                    {user?.address && <ProfileItem isDark={isDark} icon={FiMapPin} label="Address" value={user.address} />}
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className={`${cardBg} rounded-lg p-6 shadow-sm`}>
                            <h2 className={`text-xl font-semibold ${headerTextColor} mb-6`}>
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                <NotificationItem
                                    isDark={isDark}
                                    icon={FiMail}
                                    label="Email Notifications"
                                    description="Receive notifications via email"
                                    checked={notifications.email}
                                    onChange={() => handleNotificationChange("email")}
                                />
                                <NotificationItem
                                    isDark={isDark}
                                    icon={FiBell}
                                    label="Push Notifications"
                                    description="Receive push notifications in browser"
                                    checked={notifications.push}
                                    onChange={() => handleNotificationChange("push")}
                                />
                                <NotificationItem
                                    isDark={isDark}
                                    icon={FiPhone}
                                    label="SMS Notifications"
                                    description="Receive notifications via SMS"
                                    checked={notifications.sms}
                                    onChange={() => handleNotificationChange("sms")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Appearance + Quick Actions + Account Info */}
                    <div className="space-y-6">
                        {/* Appearance */}
                        <Card isDark={isDark} title="Appearance">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isDark ? <FiMoon className={`h-5 w-5 ${mutedTextColor}`} /> : <FiSun className={`h-5 w-5 ${mutedTextColor}`} />}
                                    <div>
                                        <p className={`font-medium ${headerTextColor}`}>Theme</p>
                                        <p className={`text-sm ${mutedTextColor} capitalize`}>{theme} mode</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${secondaryButtonClass}`}
                                >
                                    Toggle
                                </button>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card isDark={isDark} title="Quick Actions">
                            <div className="space-y-2">
                                <SidebarButton isDark={isDark} icon={FiLock} label="Change Password" />
                                <SidebarButton isDark={isDark} icon={FiGlobe} label="Language Settings" />
                                <SidebarButton isDark={isDark} icon={FiSettings} label="Advanced Settings" />
                            </div>
                        </Card>

                        {/* Account Info */}
                        <Card isDark={isDark} title="Account Information">
                            <div className="space-y-3 text-sm">
                                <InfoRow isDark={isDark} label="Account ID" value={`#${user?._id || "N/A"}`} />
                                <InfoRow isDark={isDark} label="Member Since" value={formatDate(user?.createdAt) || "1 Month"} />
                                <InfoRow isDark={isDark} label="Last Login" value={`${formatDate(user?.updatedAt)}` || "Today"} />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Profile Edit Form */}
                <ProfileForm isOpen={showProfileForm} onClose={() => setShowProfileForm(false)} />
            </div>
        </DashboardLayout>
    )
}

// ======= Reusable Components =======

const ProfileItem = ({ isDark, icon: Icon, label, value, capitalize }) => (
    <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
        <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"} ${capitalize ? "capitalize" : ""}`}>{value || "Not provided"}</p>
        </div>
    </div>
)

const NotificationItem = ({ isDark, icon: Icon, label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{label}</p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
            </div>
        </div>
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : (isDark ? "bg-gray-600" : "bg-gray-300")}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${isDark ? "bg-white" : "bg-white"} ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    </div>
)

const Card = ({ isDark, title, children }) => (
    <div className={`rounded-lg p-6 shadow-sm ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"}`}>
        {title && <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>}
        {children}
    </div>
)

const SidebarButton = ({ isDark, icon: Icon, label }) => (
    <button className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
        <Icon className="h-4 w-4" />
        {label}
    </button>
)

const InfoRow = ({ isDark, label, value }) => (
    <div className="flex justify-between">
        <span className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
        <span className={`${isDark ? "text-white" : "text-gray-900"}`}>{value}</span>
    </div>
)

export default Settings