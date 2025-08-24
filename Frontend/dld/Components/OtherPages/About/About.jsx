import React from "react"

const About = () => {
    return (
        <section className="mx-auto max-w-4xl space-y-8 px-6 py-16 sm:px-8 lg:px-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                About Digital Lawyer Diary (DLD)
            </h1>

            <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                Digital Lawyer Diary (DLD) is a comprehensive, modern platform crafted exclusively for legal professionals and
                law firms. Our goal is to streamline your day-to-day operations by offering intuitive tools that help you manage
                cases, publish insightful blogs, communicate with clients, and access up-to-date legal resources — all in one
                sleek, responsive application.
            </p>

            <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                With DLD, legal practitioners can build a stronger professional presence, improve client relationships, and stay
                informed on the latest industry trends. Our platform combines ease of use with powerful features designed to
                enhance productivity and efficiency.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                We strive to empower the legal community by providing accessible, cutting-edge technology that simplifies complex
                workflows, promotes knowledge sharing, and fosters meaningful connections between lawyers and their clients.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Why Choose DLD?
            </h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300">
                <li>Effortless case and client management tailored for legal workflows</li>
                <li>Rich blogging platform to share your expertise and insights</li>
                <li>Secure communication channels to connect with clients</li>
                <li>Responsive design with dark/light mode for comfortable use anytime</li>
                <li>Regular updates and dedicated support from our expert team</li>
            </ul>
        </section>
    )
}

export default About
