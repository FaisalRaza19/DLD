"use client"
import React, { useState } from "react"
import Link from "next/link"
import { FiArrowLeft } from "react-icons/fi"
import { useApp } from "@/Context/Context.jsx"
import { useRouter } from "next/navigation"

const Login = () => {
    const router = useRouter()
    const { addAlert, userAuth, verifyUser } = useApp()
    const { Login, forgetPass } = userAuth
    const { setIsLoggedIn } = verifyUser
    const [formData, setFormData] = useState({ emailOrUsername: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [showForgotResult, setShowForgotResult] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Simple email validation regex
    const isEmail = (input) => /\S+@\S+\.\S+/.test(input)

    const validate = () => {
        if (!formData.emailOrUsername || !formData.password) {
            addAlert({ statusCode: 400, message: "Email/Username and password are required.", type: "error" })
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            // Prepare payload with either email or userName
            const payload = {
                password: formData.password,
            }
            if (isEmail(formData.emailOrUsername)) {
                payload.email = formData.emailOrUsername
            } else {
                payload.userName = formData.emailOrUsername
            }

            const data = await Login({ formData: payload })
            addAlert(data)
            if (data.statusCode === 200) {
                setIsLoggedIn(true)
                router.push("/dashboard")
                setFormData({ emailOrUsername: "", password: "" })
            }
        } catch (error) {
            addAlert({ statusCode: 500, message: error.message || "Login failed.", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    const onForgot = async () => {
        if (!formData.emailOrUsername || !isEmail(formData.emailOrUsername)) {
            addAlert({ statusCode: 400, message: "valid Email is required", type: "error" })
            setShowForgotResult(false)
            return
        }
        try {
            const data = await forgetPass({ email: formData.emailOrUsername })
            addAlert(data || { type: "error", message: "User did not exist" })
            if (data.statusCode === 200) {
                setShowForgotResult(true)
            }
        } catch (error) {
            addAlert({ type: "error", message: error.message })
        }
    }

    return (
        <div className="mx-auto max-w-md px-4 py-12">
            {/* Back to Home Button */}
            <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline"
            >
                <FiArrowLeft /> Back to Home
            </Link>

            {showForgotResult ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                    <button
                        onClick={() => setShowForgotResult(false)}
                        className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline"
                    >
                        <FiArrowLeft /> Back
                    </button>
                    <h1 className="mb-2 text-xl font-semibold">Password Reset</h1>
                    <p className="text-sm text-zinc-600">
                        We will send an email to this address:{" "}
                        <span className="font-medium">{formData.emailOrUsername}</span>
                    </p>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                    <h1 className="mb-6 text-2xl font-bold">Login</h1>

                    <label className="mb-2 block text-sm font-medium">Email or Username</label>
                    <input
                        className="mb-4 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none ring-emerald-500 transition focus:ring-2"
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        placeholder="you@example.com or username"
                    />

                    <label className="mb-2 block text-sm font-medium">Password</label>
                    <input
                        className="mb-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none ring-emerald-500 transition focus:ring-2"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />

                    <div className="mb-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onForgot}
                            className="text-sm text-emerald-700 hover:underline"
                        >
                            Forgot Password?
                        </button>
                        <Link href="/signUp" className="text-sm text-zinc-600 hover:underline">
                            Create account
                        </Link>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            )}
        </div>
    )
}

export default Login
