import BlogPreviewPage from "@/Components/OtherPages/Blogs/BlogPreview.jsx"

export default function Page({ params }) {
  console.log(params)
  return <BlogPreviewPage id={params?.id} />
}
