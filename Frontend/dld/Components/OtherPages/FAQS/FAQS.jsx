'use client'
import React, { useState } from "react"
const faqsData = [
    { q: "Is Qazi Law free to use?", a: "This demo shows a V1 experience. Pricing depends on your plan." },
    { q: "Can I import my clients?", a: "Yes, use the dashboard to upload and manage client data." },
    { q: "Do you support custom domains?", a: "Yes, bring your own domain for your public content." },
    { q: "How secure is my data on Qazi Law?", a: "We use industry-standard encryption and regular security audits to protect your data." },
    { q: "Can I customize my dashboard?", a: "Yes, you can personalize your dashboard to fit your workflow and preferences." },
    { q: "Does Qazi Law offer mobile support?", a: "Absolutely! Our platform is fully responsive and optimized for mobile devices." },
    { q: "How can I get customer support?", a: "You can reach our support team via the contact page or through the dashboard chat." },
    { q: "Is there a trial period available?", a: "Yes, we offer a 14-day free trial with access to all features to get you started." },
]

const FAQS = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                Frequently Asked Questions
            </h1>

            <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
                {faqsData.map((faq, i) => (
                    <div
                        key={i}
                        className="group border-b border-zinc-200 last:border-0"
                    >
                        <button
                            type="button"
                            aria-expanded={openIndex === i}
                            aria-controls={`faq-${i}-content`}
                            id={`faq-${i}-header`}
                            onClick={() => toggleFAQ(i)}
                            className="flex w-full items-center justify-between bg-zinc-50 px-6 py-4 text-left text-lg font-semibold text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition"
                        >
                            <span>{faq.q}</span>
                            <svg
                                className={`h-6 w-6 shrink-0 transform transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""
                                    }`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div
                            id={`faq-${i}-content`}
                            role="region"
                            aria-labelledby={`faq-${i}-header`}
                            className={`px-6 overflow-hidden text-zinc-700 transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-96 py-4" : "max-h-0"}`}
                            style={{ transitionProperty: "max-height, padding" }}
                        >
                            <p>{faq.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default FAQS
