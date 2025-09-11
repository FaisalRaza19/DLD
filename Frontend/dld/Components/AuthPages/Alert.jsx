"use client"
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi"
import { useApp } from "../../Context/Context.jsx"

const Alert = () => {
    const { alerts, removeAlert } = useApp()

    const iconFor = (type) =>
        type === "success" ? (
            <FiCheckCircle />
        ) : type === "error" ? (
            <FiAlertTriangle />
        ) : (
            <FiInfo />
        )

    const getAlertType = (alert) => {
        if (alert.type) return alert.type
        if (alert.statusCode >= 200 && alert.statusCode < 300) return "success"
        if (alert.statusCode >= 400) return "error"
        return "info"
    }

    return (
        <div
            className="
        pointer-events-none fixed bottom-4 z-[60] 
        flex flex-col gap-2 w-full px-4 
        sm:items-end sm:right-4 sm:w-auto sm:max-w-sm
      "
        >
            <AnimatePresence>
                {alerts.map((a) => {
                    const type = getAlertType(a)
                    const messageText = Array.isArray(a.message) ? a.message[0] : a.message

                    return (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg 
                ${type === "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : type === "error"
                                        ? "border-rose-200 bg-rose-50 text-rose-800"
                                        : "border-blue-200 bg-blue-50 text-blue-800"
                                }`}
                        >
                            <div className="mt-0.5 text-lg">{iconFor(type)}</div>
                            <div className="flex-1 text-sm">{messageText}</div>
                            <button
                                onClick={() => removeAlert(a.id)}
                                className="rounded p-1 opacity-70 hover:opacity-100"
                                aria-label="Close alert"
                            >
                                <FiX />
                            </button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export default Alert
