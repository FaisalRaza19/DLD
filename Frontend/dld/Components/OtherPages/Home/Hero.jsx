"use client"
import React from 'react'
import Image from 'next/image'
import { motion } from "framer-motion"
import Link from "next/link"
import {useApp} from "@/Context/Context.jsx"

const Hero = () => {
    const {verifyUser} = useApp()
    const { isLoggedIn } = verifyUser
    return (
        <section className="relative overflow-hidden pt-10 sm:pt-16 lg:pt-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.12),transparent_60%)]" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Modern tools for
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                {" "}
                                legal professionals
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-zinc-600">
                            Build your presence, manage clients, and stay informed with curated insights and resources.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                            <Link
                                href={isLoggedIn ? "/dashboard" : "/signup"}
                                className="rounded-md bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-500"
                            >
                               {isLoggedIn ? "Go To Dashboard" : "Get Started"}
                            </Link>
                            <Link
                                href="/blogs"
                                className="rounded-md border border-zinc-300 px-5 py-3 font-medium text-zinc-700 transition hover:bg-zinc-100"
                            >
                                Explore Blogs
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="relative"
                    >
                        <Image
                            src="/pic.jpg"
                            alt="Legal dashboard mockup"
                            width={800}
                            height={600}
                            className="mx-auto w-full max-w-xl rounded-xl border border-zinc-200 shadow-lg"
                        />
                        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-6 -right-10 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Hero
