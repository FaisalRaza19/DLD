import BlogsPage from "@/Components/OtherPages/Blogs/Blogs.jsx"
import { Suspense } from "react";

export const metadata = {
    title: "Blogs",
    description: "Read our latest legal blogs",
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading blogs...</div>}>
            <BlogsPage />
        </Suspense>
    )
}
