const ITEMS = [
    { id: "1", name: "Alex Carter", role: "Attorney", message: "LexPro streamlined my client intake and saved hours." },
    { id: "2", name: "Morgan Lee", role: "Paralegal", message: "Clean, fast, and a joy to use on mobile." },
    {
        id: "3",
        name: "Taylor Kim",
        role: "Law Firm Partner",
        message: "Our team collaborates better with built-in workflows.",
    },
    { id: "4", name: "Jordan Smith", role: "Attorney", message: "The blogs keep me updated with key changes weekly." },
    { id: "5", name: "Riley Brown", role: "Consultant", message: "Dark mode looks fantastic during long nights." },
    { id: "6", name: "Casey Nguyen", role: "Legal Ops", message: "Setup was instant — highly recommended." },
]

export async function getTestimonials() {
    // Simulate delay for skeleton
    await new Promise((r) => setTimeout(r, 900))
    return ITEMS
}
