"use client"
import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/Context/Context.jsx"
import { FiArrowLeft } from "react-icons/fi"
import Link from "next/link"
const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const signUp = () => {
    const router = useRouter()
    const pathName = usePathname()
    const { addAlert, userAuth } = useApp()
    const { register } = userAuth

    const [role, setRole] = useState("Lawyer/Attorney")
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        phoneNumber: "",
        totalLawyer: "",
    })

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const validateForm = () => {
        if (!form.fullName || form.fullName.length < 3) {
            addAlert("error", "Name must be at least 3 characters.")
            return false
        }
        if (!emailRegex.test(form.email)) {
            addAlert("error", "Invalid email format.")
            return false
        }
        if (!passwordRules.test(form.password)) {
            addAlert("error", "Password must be 8+ chars with uppercase, lowercase, digit, and special character.")
            return false
        }
        if (form.password !== form.confirmPassword) {
            addAlert("error", "Passwords do not match.")
            return false
        }
        if (!form.address) {
            addAlert("error", "Address is required.")
            return false
        }
        if (!form.phoneNumber) {
            addAlert("error", "Phone number is required.")
            return false
        }
        if (role === "Law Firm" && !form.totalLawyer) {
            addAlert("error", "Total lawyers is required.")
            return false
        }
        return true
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return
        setLoading(true)
        try {
            const formData = {
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                phoneNumber: form.phoneNumber,
                totalLawyer: role === "Law Firm" ? Number(form.totalLawyer || 0) : undefined,
                address: form.address,
                role,
            }
            const data = await register(formData)
            addAlert(data)
            if (data.statusCode === 200) {
                localStorage.setItem("email", form.email) // save for verify page
                router.push("/email-verify")
            }
        } catch (error) {
            addAlert("error", error.message || "Signup failed.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-12">
            <form
                onSubmit={onSubmit}
                className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
            >
                {/* Back */}
                <button
                    type="button"
                    onClick={() => pathName === "/signUp" ? router.push("/login") : router.back()}
                    className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline"
                >
                    <FiArrowLeft /> Back
                </button>

                <h1 className="text-2xl font-bold">Sign Up - {role}</h1>

                {/* Role Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {["Lawyer/Attorney", "Law Firm"].map((r) => (
                        <button
                            type="button"
                            key={r}
                            onClick={() => setRole(r)}
                            className={`rounded-lg border p-4 text-left transition ${role === r
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-zinc-300"
                                }`}
                        >
                            <div className="mb-1 text-lg font-semibold">{r}</div>
                            <div className="text-xs text-zinc-600">Continue as {r}</div>
                        </button>
                    ))}
                </div>

                {/* Fields */}
                <div>
                    <label className="mb-1 block text-sm font-medium">{role === "Lawyer/Attorney" ? "Full Name" : "Firm Name"}</label>
                    <input
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        placeholder={role === "Lawyer/Attorney" ? "Jane Doe" : "Acme Law Group"}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={onChange}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {role === "Law Firm" && (
                    <div>
                        <label className="mb-1 block text-sm font-medium">Total Lawyers</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                            name="totalLawyer"
                            value={form.totalLawyer}
                            onChange={onChange}
                            placeholder="10"
                        />
                    </div>
                )}

                <div>
                    <label className="mb-1 block text-sm font-medium">Phone Number</label>
                    <input
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={onChange}
                        placeholder="+1 555 123 4567"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Address</label>
                    <input
                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        name="address"
                        value={form.address}
                        onChange={onChange}
                        placeholder="123 Main St, City, Country"
                    />
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-center justify-between text-sm mt-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            required
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-zinc-700">
                            I agree to the{" "}
                            <Link href="/terms" className="text-emerald-600 hover:underline">
                                Terms & Conditions
                            </Link>
                        </span>
                    </label>

                    <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                        Already have an account?
                    </Link>
                </div>

                {/* Submit Button */}
                <button
                    disabled={loading}
                    className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                    {loading ? "Submitting..." : "Continue"}
                </button>

            </form>
        </div>
    )
}

export default signUp
