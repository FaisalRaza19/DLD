import SignupPage from "@/Components/AuthPages/signUp.jsx"

export const metadata = {
    title: "Sign Up – Qazi Law",
    description: "Create an account with Qazi Law to access modern legal tools, manage clients, and stay informed.",
    keywords: [
        "Sign Up",
        "Register",
        "Legal tools signup",
        "Qazi Law account",
        "Create account",
    ],
    authors: [{ name: "Qazi Law Team" }],
    openGraph: {
        title: "Sign Up – Qazi Law",
        description: "Create an account with Qazi Law to access modern legal tools, manage clients, and stay informed.",
        url: "http://localhost:3000/signup",
        siteName: "Qazi Law",
        images: [
            {
                url: "/logo.jpg",
                width: 1200,
                height: 630,
                alt: "Qazi Law Signup",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sign Up – Qazi Law",
        description: "Create an account with Qazi Law to access modern legal tools, manage clients, and stay informed.",
        images: ["/logo.jpg"],
    },
}


export default function Page() {
    return <SignupPage />
}
