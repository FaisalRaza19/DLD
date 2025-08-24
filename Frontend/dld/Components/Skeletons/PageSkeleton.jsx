import React from 'react'

const PageSkeleton = () => {
    return (
        <div className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-11/12 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-9/12 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-10/12 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
    )
}


export default PageSkeleton
