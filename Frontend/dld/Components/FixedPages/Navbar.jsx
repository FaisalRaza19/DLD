"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FiMoon, FiSun, FiMenu, FiX, FiUser, FiLogIn } from "react-icons/fi"
import { useApp } from "@/Context/Context.jsx"

const navItems = [
    { href: "/blogs", label: "Blogs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faqs", label: "FAQs" },
]

const Navbar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, toggleTheme, verifyUser } = useApp()
    const { isLoggedIn } = verifyUser
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false) // close mobile menu on route change
    }, [pathname])

    return (
        <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo & Mobile menu button */}
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Toggle menu"
                        className="flex items-center justify-center rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden"
                        onClick={() => setOpen((v) => !v)}
                    >
                        {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                    </button>

                    <Link href="/" className="group inline-flex items-center gap-2">
                        <Image
                            src="/logo.jpg"
                            alt="QaziLaw Logo"
                            width={32}
                            height={32}
                            className="rounded"
                        />
                        <span className="text-lg font-bold tracking-tight">
                            Qazi
                            <span className="text-emerald-600 dark:text-emerald-400">Law</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-medium transition-colors ${pathname.startsWith(item.href)
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions (theme toggle + auth) */}
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Toggle theme"
                        className="rounded-md p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? <FiSun /> : <FiMoon />}
                    </button>

                    {isLoggedIn === true ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950"
                        >
                            <FiUser className="h-4 w-4" />
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                                <FiLogIn className="h-4 w-4" />
                                Login
                            </Link>
                            <Link
                                href="/signUp"
                                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden">
                    <div className="space-y-1 border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith(item.href)
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <div className="mt-3 flex gap-2 px-3">
                            <button
                                onClick={() => router.push("/login")}
                                className="flex-1 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push("/signUp")}
                                className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
