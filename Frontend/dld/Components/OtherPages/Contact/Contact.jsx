"use client"
import React, { useState } from "react"
import { useApp } from "@/Context/Context.jsx"

const Contact = () => {
    const { addAlert } = useApp()
    const [values, setValues] = useState({ name: "", email: "", message: "" })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) =>
        setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!values.name || !values.email || !values.message) {
            addAlert("error", "All fields are required.")
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(values.email)) {
            addAlert("error", "Please enter a valid email.")
            return
        }
        setLoading(true)
        await new Promise((r) => setTimeout(r, 800))
        setLoading(false)
        addAlert("success", "Message sent! We'll get back to you soon.")
        setValues({ name: "", email: "", message: "" })
    }

    return (
        <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Contact Us</h1>

            <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-4 px-4 sm:px-0">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <input
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none ring-emerald-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none ring-emerald-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Message</label>
                    <textarea
                        className="min-h-[120px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 outline-none ring-emerald-500 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
                        name="message"
                        value={values.message}
                        onChange={handleChange}
                        placeholder="How can we help?"
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                    {loading ? "Sending..." : "Send message"}
                </button>
            </form>
        </section>
    )
}

export default Contact
