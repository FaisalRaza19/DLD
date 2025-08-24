import ForgotPasswordPage from "@/Components/AuthPages/ForgetPass.jsx"

export const metadata = {
    title: "Forgot Password",
    description: "Reset your password by entering your email address. Receive a link to reset your password securely.",
}

export default function Page({ searchParams }) {
    return <ForgotPasswordPage email={searchParams?.email || ""} />
}
