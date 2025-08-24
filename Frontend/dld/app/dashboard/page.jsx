"use client"
import { useState, useMemo } from "react"
import { useApp } from "@/Context/Context.jsx"
import DashboardLayout from "@/Components/dashboard/DashboardLayout.jsx"
import { FiBriefcase, FiUsers, FiUserCheck, FiFileText, FiPlus } from "react-icons/fi"
import CaseForm from "@/Components/dashboard/Cases/CaseForm.jsx"
import ClientForm from "@/Components/dashboard/Clients/ClientForm.jsx"
import LawyerForm from "@/Components/dashboard/Lawyers/LawyerForm.jsx"

export default function DashboardPage() {
  const { Cases, theme, userData, Clients, Lawyers} = useApp()
  const { lawyers } = Lawyers
  const { clients } = Clients
  const {cases} = Cases
  const [modal, setModal] = useState({ open: false, type: "" })

  // Quick Action Handlers
  const handleQuickAction = (type) => {
    setModal({ open: true, type })
  }
  const closeModal = () => setModal({ open: false, type: "" })

  // 📌 Utility: check if created today
  const isToday = (dateStr) => {
    if (!dateStr) return false
    const today = new Date()
    const d = new Date(dateStr)
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  }

  // 📌 Build recent activities (cases, clients, lawyers)
  const recentActivities = useMemo(() => {
    let activities = []

    cases?.forEach(c => {
      if (isToday(c.createdAt)) {
        activities.push({
          id: c._id,
          name: c.title || "Untitled Case",
          type: "Case",
          status: c.status,
          date: new Date(c.createdAt).toLocaleDateString(),
        })
      }
    })

    clients?.forEach(cl => {
      if (isToday(cl.createdAt)) {
        activities.push({
          id: cl._id,
          name: cl.fullName,
          type: "Client",
          status: "New",
          date: new Date(cl.createdAt).toLocaleDateString(),
        })
      }
    })

    if (userData?.role === "Law Firm") {
      lawyers?.forEach(l => {
        if (isToday(l.createdAt)) {
          activities.push({
            id: l._id,
            name: l.fullName,
            type: "Lawyer",
            status: "New",
            date: new Date(l.createdAt).toLocaleDateString(),
          })
        }
      })
    }

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)) // latest first
  }, [cases, clients, lawyers, userData])

  // Stats Cards
  const stats = [
    {
      title: "Total Cases",
      value: cases?.length || 0,
      icon: FiBriefcase,
      color: "text-blue-600",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "Active Cases",
      value: cases?.filter(c => c.status === "Open").length || 0,
      icon: FiFileText,
      color: "text-green-600",
      gradient: "from-green-400 to-green-600",
    },
    {
      title: "Pending Cases",
      value: cases?.filter(c => c.status === "In Progress").length || 0,
      icon: FiFileText,
      color: "text-yellow-600",
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      title: "Clients",
      value: clients?.length || 0,
      icon: FiUsers,
      color: "text-purple-600",
      gradient: "from-purple-400 to-purple-600",
    },
    ...(userData?.role === "Law Firm"
      ? [
        {
          title: "Lawyers",
          value: lawyers?.length || 0,
          icon: FiUserCheck,
          color: "text-pink-600",
          gradient: "from-pink-400 to-pink-600",
        },
      ]
      : []),
  ]

  // Quick Actions
  const quickActions = [
    { title: "Add Case", type: "case", icon: FiBriefcase, color: "bg-blue-500" },
    { title: "Add Client", type: "client", icon: FiUsers, color: "bg-green-500" },
    ...(userData?.role === "Law Firm"
      ? [{ title: "Add Lawyer", type: "lawyer", icon: FiUserCheck, color: "bg-purple-500" }]
      : []),
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 md:p-8">

        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className={`text-3xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
            Welcome back, {userData?.fullName}!
          </h1>
          <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>
            Here's an overview of your legal practice management.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`relative overflow-hidden rounded-xl p-6 shadow hover:shadow-lg transition-shadow ${theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>{stat.title}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.type)}
                  className={`relative flex items-center gap-4 p-6 rounded-lg border transition-shadow hover:shadow-lg ${theme === "light" ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700"}`}
                >
                  <div className={`${action.color} p-3 rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}>{action.title}</h3>
                    <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"}`}>Click to add {action.type}</p>
                  </div>
                  <span className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiPlus className="h-5 w-5 text-gray-400" />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-lg p-6 shadow ${theme === "light" ? "bg-white border border-gray-200" : "bg-gray-800 border border-gray-700"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}>Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-300"} border-b border-gray-200 dark:border-gray-700`}>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length > 0 ? (
                  recentActivities.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4">{item.type}</td>
                      <td className="py-2 px-4">{item.status}</td>
                      <td className="py-2 px-4">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400">
                      No activities today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Modals */}
        {modal.open && modal.type === "case" && <CaseForm isOpen={modal.open} onClose={closeModal} />}
        {modal.open && modal.type === "client" && <ClientForm isOpen={modal.open} onClose={closeModal} />}
        {modal.open && modal.type === "lawyer" && <LawyerForm isOpen={modal.open} onClose={closeModal} />}
      </div>
    </DashboardLayout>
  )
}
