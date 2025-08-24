import ChnagePassword from "@/Components/AuthPages/chnagePassword.jsx"

export const metadata = {
    title: "Reset Password - Qazi Law",
    description: "Access your Qazi Law account to manage your legal practice efficiently and securely.",
    keywords: [
        "Login",
        "Qazi Law login",
        "Legal platform login",
        "User authentication",
        "Secure login",
    ],
    authors: [{ name: "Qazi Law Team" }],
    openGraph: {
        title: "Login - Qazi Law",
        description: "Access your Qazi Law account to manage your legal practice efficiently and securely.",
        url: "http://localhost:3000/forget-password/:token",
        siteName: "Qazi Law",
        images: [
            {
                url: "/logo.jpg",
                width: 1200,
                height: 630,
                alt: "Qazi Law Logo",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Login - Qazi Law",
        description: "Access your Qazi Law account to manage your legal practice efficiently and securely.",
        images: ["/logo.jpg"],
    },
}

export default function Page() {
    return <ChnagePassword />
}
