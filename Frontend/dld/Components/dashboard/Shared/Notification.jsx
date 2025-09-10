"use client"
import { useEffect } from "react"
import { useApp } from "@/Context/Context.jsx"
import { FiX, FiTrash2, FiCheckCircle } from "react-icons/fi"
import Link from "next/link"
import moment from "moment"

const NotificationsPage = ({ onClose }) => {
  const { theme, Hearings } = useApp()
  const {
    notifications,
    setNotifications,
    markNotificationRead,
    deleteNotification,
    // optional chat messages (now present in context)
    unreadMessages,
    setUnreadMessages,
    setUnReadNotifications,
  } = Hearings

  // Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    const res = await markNotificationRead(id)
    if (res?.statusCode === 200) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnReadNotifications((prev) => (prev > 0 ? prev - 1 : 0))
    }
  }

  // Delete notification 
  const handleDelete = async (id) => {
    const target = notifications.find(n => n._id === id)
    const wasUnread = target && !target.isRead

    const res = await deleteNotification(id)
    if (res?.statusCode === 200) {
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      if (wasUnread) {
        setUnReadNotifications((prev) => (prev > 0 ? prev - 1 : 0))
      }
    }
  }

  // Mark message as read
  const handleMessageRead = (id) => {
    setUnreadMessages?.((prev) => prev.filter((m) => m._id !== id))
  }

  const hasNotifications = notifications?.length > 0
  const hasMessages = Array.isArray(unreadMessages) && unreadMessages.length > 0

  // When modal opens: mark all unread notifications as read
  useEffect(() => {
    const unread = (notifications || []).filter(n => !n.isRead)
    if (unread.length === 0) return

      ; (async () => {
        try {
          await Promise.all(unread.map(n => markNotificationRead(n._id)))
        } catch (e) {
          console.error("Batch mark as read error:", e)
        } finally {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
          setUnReadNotifications(0)
        }
      })()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-start pt-24 overflow-auto">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-xl p-6 relative ${theme === "light" ? "bg-white" : "bg-gray-800"
          }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Notifications</h2>

        {!hasNotifications && !hasMessages ? (
          <div className="p-8 text-center text-gray-400">No notifications available</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Notifications */}
            {hasNotifications && notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-lg flex justify-between items-start gap-4 cursor-pointer transition-colors duration-200 ${n.isRead ? "opacity-60" : "bg-blue-50"
                  }`}
                onClick={() => handleMarkAsRead(n._id)}
              >
                <div className="flex-1">
                  <p className="font-semibold">{n.title}</p>
                  {n.meta?.caseId ? (
                    <Link
                      href={`/dashboard/cases/${n.meta.caseId}`}
                      className="text-sm text-blue-500 underline"
                    >
                      {n.meta.caseTitle} - {n.meta.courtLocation}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-500">{n.body}</p>
                  )}
                  <small className="text-xs text-gray-400">
                    {moment(n.createdAt).fromNow()}
                  </small>
                </div>
                <div className="flex flex-col gap-2 items-center">
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id) }}
                      title="Mark as read"
                      className="text-green-500 hover:text-green-400"
                    >
                      <FiCheckCircle />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id) }}
                    title="Delete"
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}

            {/* Unread Messages (optional, if you use chat) */}
            {hasMessages && unreadMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-4 rounded-lg bg-yellow-50 flex justify-between items-start gap-4 cursor-pointer"
                onClick={() => handleMessageRead(msg._id)}
              >
                <div className="flex-1">
                  <p className="font-semibold">New message from {msg.senderName}</p>
                  <p className="text-sm">{msg.content}</p>
                  <small className="text-xs text-gray-400">
                    {moment(msg.createdAt).fromNow()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
