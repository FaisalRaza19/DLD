"use client";
import { usePathname } from "next/navigation";
import LoadingBar from "nextjs-toploader";
import Navbar from "./FixedPages/Navbar";
import Footer from "./FixedPages/Footer";
import Alerts from "./AuthPages/Alert";

export default function MainLayout({ children }) {
    const pathName = usePathname();

    const isChangePassPage = pathName.startsWith("/change-pas");
    const isDashboard = pathName.startsWith("/dashboard");
    const isAuth =
        ["/login", "/signUp", "/email-verify"].includes(pathName) ||
        isChangePassPage ||
        isDashboard;

    return (
        <div className="min-h-screen bg-white text-zinc-900 transition-colors duration-300">
            {/* The top loader will automatically handle loading progress on route changes */}
            <LoadingBar
                color="#000"
                height={3}
                showSpinner={false}
            />

            {!isAuth && <Navbar />}
            <main className="pt-16">{children}</main>
            {!isAuth && <Footer />}
            <Alerts />
        </div>
    );
}