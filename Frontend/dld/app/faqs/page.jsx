import FAQsPage from "@/Components/OtherPages/FAQS/FAQS.jsx"

export const metadata = {
    title: "Frequently Asked Questions – Digital Lawyer Diary (DLD)",
    description:
        "Find answers to common questions about Digital Lawyer Diary (DLD), including features, pricing, security, and support.",
    keywords: [
        "FAQs",
        "Digital Lawyer Diary FAQs",
        "LexPro questions",
        "Legal software help",
        "Customer support",
    ],
    authors: [{ name: "Qazi Law Team" }],
    openGraph: {
        title: "Frequently Asked Questions – Digital Lawyer Diary (DLD)",
        description:
            "Find answers to common questions about Digital Lawyer Diary (DLD), including features, pricing, security, and support.",
        url: "http://localhost:3000/faqs",
        siteName: "Digital Lawyer Diary",
        images: [
            {
                url: "/logo.jpg",
                width: 1200,
                height: 630,
                alt: "Digital Lawyer Diary FAQs",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Frequently Asked Questions – Digital Lawyer Diary (DLD)",
        description:
            "Find answers to common questions about Digital Lawyer Diary (DLD), including features, pricing, security, and support.",
        images: ["/logo.jpg"],
    },
}

export default function Page() {
    return <FAQsPage />
}
