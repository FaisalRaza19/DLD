"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { getLatestBlogs } from "@/temp/blogs.js"
import BlogSkeleton from "@/Components/Skeletons/BlogSkeleton.jsx"
import { motion, AnimatePresence } from "framer-motion"

const Blogs = () => {
    const [blogs, setBlogs] = useState(null)

    useEffect(() => {
        let active = true
            ; (async () => {
                const res = await getLatestBlogs(6) // simulate fetch
                if (active) setBlogs(res)
            })()
        return () => {
            active = false
        }
    }, [])

    return (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Latest Blogs</h2>
                <Link href="/blogs" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
                    View all
                </Link>
            </div>
            {!blogs ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <BlogSkeleton key={idx} />
                    ))}
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {blogs.map((b) => (
                            <motion.article
                                key={b.id}
                                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                                className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <img
                                    src={b.image || "/placeholder.svg"}
                                    alt={b.title}
                                    className="mb-4 h-40 w-full rounded-lg object-cover transition group-hover:scale-[1.02]"
                                />
                                <h3 className="line-clamp-2 text-lg font-semibold">{b.title}</h3>
                                <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{b.excerpt}</p>
                                <Link
                                    href={`/blogs/${b.id}`}
                                    className="mt-4 inline-flex text-sm font-medium text-emerald-700 transition hover:underline dark:text-emerald-400"
                                >
                                    Read more →
                                </Link>
                            </motion.article>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}
        </section>
    )
}

export default Blogs
