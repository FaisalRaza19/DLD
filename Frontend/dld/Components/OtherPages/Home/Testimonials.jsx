'use client'
import React,{useState,useEffect} from 'react'
import TestimonialSkeleton from "@/Components/Skeletons/TestimonialSkeleton.jsx"
import { getTestimonials } from "@/temp/testimonial.js"
import { motion } from "framer-motion"

const Testimonials = () => {
    const [items, setItems] = useState(null)

    useEffect(() => {
        let active = true
            ; (async () => {
                const res = await getTestimonials()
                if (active) setItems(res)
            })()
        return () => {
            active = false
        }
    }, [])

    return (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold">What our users say</h2>
            {!items ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <TestimonialSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {items.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="mb-3 text-sm text-zinc-600">{t.message}</div>
                            <div className="text-sm font-semibold">{t.name}</div>
                            <div className="text-xs text-zinc-500">{t.role}</div>
                        </div>
                    ))}
                </motion.div>
            )}
        </section>
    )
}

export default Testimonials
