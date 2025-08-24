import ContactPage from "@/Components/OtherPages/Contact/Contact.jsx"

export const metadata = {
    title: "Contact Us – Qazi Law",
    description: "Get in touch with Qazi Law for any inquiries, support, or consultations. We're here to assist you with professional legal services.",
    keywords: ["Contact Qazi Law", "Legal Consultation", "Customer Support", "Lawyer Contact", "Qazi Law"],
    authors: [{ name: "Qazi Law Team" }],
    openGraph: {
        title: "Contact Us – Qazi Law",
        description: "Reach out to Qazi Law for professional legal assistance and consultations.",
        url: "http://localhost:3000/contact",
        siteName: "Qazi Law",
        images: [
            {
                url: "/logo.jpg",
                width: 1200,
                height: 630,
                alt: "Qazi Law Contact Page",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Us – Qazi Law",
        description: "Reach out to Qazi Law for professional legal assistance and consultations.",
        images: ["/logo.jpg"],
    },
}


export default function Page() {
    return <ContactPage />
}
