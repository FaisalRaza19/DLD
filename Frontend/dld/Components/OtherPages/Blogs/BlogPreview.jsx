"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { getBlogById } from "@/temp/blogs.js"
import PageSkeleton from "@/Components/Skeletons/PageSkeleton.jsx"

const BlogPreview = ({ id }) => {
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
            ; (async () => {
                const res = await getBlogById(id)
                if (!active) return
                setBlog(res)
                setLoading(false)
            })()
        return () => {
            active = false
        }
    }, [id])

    if (loading) return <PageSkeleton />

    if (!blog) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <Link href={"/blogs"}>
                    <button
                        className="mb-4 rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100"
                    >
                        Back
                    </button>
                </Link>
                <p>Blog not found.</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href={"/blogs"}>
                <button
                    className="mb-6 rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100"
                >
                    Back
                </button>
            </Link>
            <img
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                className="mb-6 h-72 w-full rounded-xl object-cover"
            />
            <h1 className="mb-4 text-3xl font-bold">{blog.title}</h1>
            <p className="text-zinc-600">{blog.content}</p>
        </div>
    )
}

export default BlogPreview
