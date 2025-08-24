import About from "@/Components/OtherPages/About/About.jsx"

export const metadata = {
    title: "About Digital Lawyer Diary (DLD)",
    description:
        "Learn about Digital Lawyer Diary (DLD), a modern platform designed to empower legal professionals with efficient case management, client communication, and insightful resources.",
    keywords: [
        "About DLD",
        "Digital Lawyer Diary",
        "Legal case management",
        "Lawyer platform",
        "Client communication",
        "Legal resources",
    ],
    authors: [{ name: "Qazi Law Team" }],
    openGraph: {
        title: "About Digital Lawyer Diary (DLD)",
        description:
            "Discover how DLD helps legal professionals streamline operations and connect with clients through a modern, user-friendly platform.",
        url: "http://localhost:3000/about",
        siteName: "Digital Lawyer Diary",
        images: [
            {
                url: "/logo.jpg",
                width: 1200,
                height: 630,
                alt: "About Digital Lawyer Diary (DLD)",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Digital Lawyer Diary (DLD)",
        description:
            "Discover how DLD helps legal professionals streamline operations and connect with clients through a modern, user-friendly platform.",
        images: ["/logo.jpg"],
    },
}

export default function Page() {
    return <About />
}
