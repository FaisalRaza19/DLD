"use client";
import { useEffect } from "react";
import { useApp } from "@/Context/Context.jsx";
import { FiX, FiTrash2, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import moment from "moment";

const NotificationsPage = ({ onClose }) => {
  const { Hearings } = useApp();
  const {
    notifications,
    setNotifications,
    markNotificationRead,
    deleteNotification,
    unreadMessages,
    setUnreadMessages,
    setUnReadNotifications,
  } = Hearings;

  // Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    const res = await markNotificationRead(id);
    if (res?.statusCode === 200) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnReadNotifications?.((prev) => (prev > 0 ? prev - 1 : 0));
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    const target = notifications.find((n) => n._id === id);
    const wasUnread = target && !target.isRead;

    const res = await deleteNotification(id);
    if (res?.statusCode === 200) {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) {
        setUnReadNotifications?.((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }
  };

  // Mark message as read
  const handleMessageRead = (id) => {
    setUnreadMessages?.((prev) => prev.filter((m) => m._id !== id));
  };

  const hasNotifications = notifications?.length > 0;
  const hasMessages = Array.isArray(unreadMessages) && unreadMessages.length > 0;

  // When modal opens: mark all unread notifications as read
  useEffect(() => {
    const unread = (notifications || []).filter((n) => !n.isRead);
    if (!unread.length) return;

    (async () => {
      try {
        await Promise.all(unread.map((n) => markNotificationRead(n._id)));
      } catch (e) {
        console.error("Batch mark as read error:", e);
      } finally {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnReadNotifications?.(0);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-start pt-24 p-2 sm:p-4 overflow-auto">
      <div className="w-full max-w-2xl rounded-2xl shadow-xl p-6 relative bg-white border border-black">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-700 transition"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-black">Notifications</h2>

        {!hasNotifications && !hasMessages ? (
          <div className="p-8 text-center text-gray-500">No notifications available</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Notifications */}
            {hasNotifications &&
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-lg flex justify-between items-start gap-4 cursor-pointer transition-colors duration-200 ${n.isRead ? "opacity-60" : "bg-gray-100"
                    }`}
                  onClick={() => handleMarkAsRead(n._id)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-black">{n.title}</p>
                    {n.meta?.caseId ? (
                      <Link
                        href={`/dashboard/cases/${n.meta.caseId}`}
                        className="text-sm text-blue-600 underline"
                      >
                        {n.meta.caseTitle} - {n.meta.courtLocation}
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-700">{n.body}</p>
                    )}
                    <small className="text-xs text-gray-400">
                      {moment(n.createdAt).fromNow()}
                    </small>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    {!n.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n._id);
                        }}
                        title="Mark as read"
                        className="text-green-600 hover:text-green-500"
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n._id);
                      }}
                      title="Delete"
                      className="text-red-600 hover:text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}

            {/* Unread Messages */}
            {hasMessages &&
              unreadMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-4 rounded-lg bg-gray-100 flex justify-between items-start gap-4 cursor-pointer"
                  onClick={() => handleMessageRead(msg._id)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-black">New message from {msg.senderName}</p>
                    <p className="text-sm text-gray-700">{msg.content}</p>
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
  );
};

export default NotificationsPage;
