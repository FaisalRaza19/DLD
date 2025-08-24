"use client"
import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi"
import Link from "next/link"

const emailVerify = () => {
    const router = useRouter()
    const { addAlert, userAuth, setUserData, verifyUser, userProfile } = useApp()
    const { setIsLoggedIn } = verifyUser
    const { ResendCode, verify_register, verifyAndUpdateProfile } = userAuth
    const { isEditProfile } = userProfile
    const [loading, setLoading] = useState(false)
    const [verification, setVerification] = useState(Array(6).fill(""))
    const inputsRef = useRef([])

    const email = typeof window !== "undefined" ? localStorage.getItem("email") : ""

    const handleCodeChange = (index, value) => {
        const v = value.replace(/\D/g, "").slice(0, 1)
        const next = [...verification]
        next[index] = v
        setVerification(next)
        if (v && index < 5) inputsRef.current[index + 1]?.focus()
    }

    const handleCodePaste = (e) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (!text) return
        const next = Array(6).fill("").map((_, i) => text[i] || "")
        setVerification(next)
        setTimeout(() => inputsRef.current[5]?.focus(), 0)
    }

    const onVerify = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const code = verification.join("")
            if (code.length !== 6) {
                addAlert("error", "Please enter the 6-digit code.")
                setLoading(false)
                return
            }
            if (isEditProfile) {
                const data = await verifyAndUpdateProfile({ code })
                addAlert(data)
                if (data.statusCode === 200) {
                    setUserData(data.data)
                    setIsLoggedIn(true)
                    router.push("/dashboard")
                    localStorage.removeItem("email");
                }
            } else {
                const data = await verify_register({ code })
                addAlert(data)
                if (data.statusCode === 200) {
                    setIsLoggedIn(true)
                    router.push("/dashboard")
                    localStorage.removeItem("email")
                }
            }
        } catch (error) {
            addAlert({ type: error, message: "Internal server during register" })
        } finally {
            setLoading(false)
        }
    }

    const onResend = async () => {
        try {
            const data = await ResendCode()
            addAlert(data)
        } catch (error) {
            addAlert("error", error.message || "Failed to resend.")
        }
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <form
                onSubmit={onVerify}
                className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
                <Link href={isEditProfile ? "/dashboard" : "/signUp"}>
                    <button
                        type="button"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                        <FiArrowLeft /> Back
                    </button>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <FiMail />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Verify your email</h1>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Enter the 6-digit code we sent to {email}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between gap-2" onPaste={handleCodePaste}>
                    {verification.map((v, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputsRef.current[i] = el)}
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={1}
                            value={v}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            className="h-12 w-12 rounded-md border border-zinc-300 bg-white text-center text-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onResend}
                        className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                        Resend code
                    </button>
                    <button
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : (<><FiCheck /> Verify</>)}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default emailVerify
