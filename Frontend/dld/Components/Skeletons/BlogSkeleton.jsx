import React from 'react'

const BlogSkeleton = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 p-4">
      <div className="mb-4 h-40 w-full rounded-lg bg-zinc-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-zinc-200" />
      <div className="h-4 w-5/6 rounded bg-zinc-200" />
      <div className="mt-4 h-4 w-24 rounded bg-zinc-200" />
    </div>
  )
}

export default BlogSkeleton
