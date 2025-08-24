import OpenAI from "openai";

const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteName = process.env.NEXT_PUBLIC_SITE_TITLE;

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    dangerouslyAllowBrowser : true, 
    defaultHeaders: {
        'HTTP-Referer': siteUrl || '',
        'X-Title': siteName || '',
    },
});

export const fetchGPTResponse = async (message, context) => {
    try {
        const prompt = `
You are a helpful legal assistant.

Current context:
${JSON.stringify(context, null, 2)}

User message:
"${message}"

Answer concisely and professionally. If you cannot respond, say "I didn't understand your message, please ask again."
        `;

        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const content = completion.choices[0]?.message?.content;
        return content || "I received an empty response. Please try again.";

    } catch (error) {
        return "I'm sorry, the GPT API failed to respond. Please try again later.";
    }
};