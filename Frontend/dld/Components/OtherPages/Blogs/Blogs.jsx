"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import BlogSkeleton from "@/Components/Skeletons/BlogSkeleton.jsx"
import { getBlogsPage, getTotalBlogs } from "@/temp/blogs.js"

const Blogs = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const page = Number(searchParams.get("page") || "1")
    const [items, setItems] = useState(null)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const perPage = 10

    useEffect(() => {
        let active = true
        setLoading(true)
            ; (async () => {
                const [list, count] = await Promise.all([getBlogsPage(page, perPage), getTotalBlogs()])
                if (!active) return
                setItems(list)
                setTotal(count)
                setLoading(false)
            })()
        return () => {
            active = false
        }
    }, [page])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total])

    const goTo = (p) => {
        const sp = new URLSearchParams(searchParams)
        sp.set("page", String(p))
        router.push(`${pathname}?${sp.toString()}`)
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-6 text-3xl font-bold">All Blogs</h1>
            {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <BlogSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((b) => (
                            <article
                                key={b.id}
                                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-lg"
                            >
                                <img
                                    src={b.image || "/placeholder.svg"}
                                    alt={b.title}
                                    className="mb-4 h-40 w-full rounded-lg object-cover"
                                />
                                <h3 className="line-clamp-2 text-lg font-semibold">{b.title}</h3>
                                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{b.excerpt}</p>
                                <Link
                                    href={`/blogs/${b.id}`}
                                    className="mt-4 inline-flex text-sm font-medium text-emerald-700 transition hover:underline"
                                >
                                    Read more →
                                </Link>
                            </article>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                        <button
                            onClick={() => goTo(Math.max(1, page - 1))}
                            className="rounded-md border disabled:cursor-not-allowed border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100"
                            disabled={page <= 1}
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1
                            const active = p === page
                            return (
                                <button
                                    key={p}
                                    onClick={() => goTo(p)}
                                    className={`min-w-9 rounded-md px-3 py-2 text-sm ${active
                                        ? "bg-emerald-600 font-medium text-white"
                                        : "border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => goTo(Math.min(totalPages, page + 1))}
                            className="rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100"
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default Blogs
