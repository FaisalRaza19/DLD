const ALL = Array.from({ length: 36 }).map((_, i) => {
    const id = String(i + 1)
    return {
        id,
        title: `Legal Insight ${i + 1}: Navigating Case Law Effectively`,
        excerpt:
            "Explore practical strategies for researching and applying case law in modern practice. Tips, tools, and workflows.",
        content:
            "In this comprehensive guide, we cover repeatable steps to research, analyze, and argue case law with confidence. " +
            "We also include a checklist for preparing briefs and ensuring citations meet regional standards.",
        image: `/placeholder.svg?height=240&width=480&query=legal%20blog%20${i + 1}`,
        date: new Date(Date.now() - i * 86400000).toISOString(),
    }
})

export async function delay(ms = 800) {
    return new Promise((res) => setTimeout(res, ms))
}

export async function getLatestBlogs(limit = 6) {
    await delay()
    return ALL.slice(0, limit)
}

export async function getBlogsPage(page = 1, perPage = 10) {
    await delay()
    const start = (page - 1) * perPage
    return ALL.slice(start, start + perPage)
}

export async function getTotalBlogs() {
    await delay(200)
    return ALL.length
}

export async function getBlogById(id) {
    await delay()
    return ALL.find((b) => b.id === String(id)) || null
}
