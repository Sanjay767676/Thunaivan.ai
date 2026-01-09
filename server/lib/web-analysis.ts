import axios from "axios";
import * as cheerio from "cheerio";
import { genAI } from "./ai-multi";

export async function scrapeUrl(url: string): Promise<string> {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        $('script, style, nav, footer, header, .ads, .sidebar').remove();

        let text = $('body').text();

        const cleanedText = text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();

        return cleanedText;
    } catch (error: any) {
        throw new Error(`Failed to scrape URL: ${error.message}`);
    }
}

export async function searchWeb(query: string): Promise<string> {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
        throw new Error("SERPAPI_API_KEY is not configured.");
    }

    try {
        const response = await axios.get("https://serpapi.com/search", {
            params: {
                q: query,
                api_key: apiKey,
                engine: "google"
            }
        });

        const results = response.data.organic_results || [];
        const snippets = results.map((res: any) => `${res.title}\n${res.link}\n${res.snippet}`).join("\n\n---\n\n");

        return snippets;
    } catch (error: any) {
        throw new Error(`SerpAPI search failed: ${error.message}`);
    }
}

export async function analyzeWebContent(text: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const summaryPrompt = `You are a professional AI web content analyst.
Analyze the provided web content and provide a comprehensive, structured summary.
Focus on:
1. Main Purpose
2. Key Benefits (Monetary & Non-monetary)
3. Eligibility Criteria
4. Step-by-Step Application Process
5. Contact Information & Important Links (if available)

Use a professional, clear, and human-like tone. Use bullet points and headings for readability.

Content:
${text.substring(0, 30000)}`;

        const result = await model.generateContent(summaryPrompt);
        return result.response.text();
    } catch (error: any) {
        throw new Error(`AI analysis of web content failed: ${error.message}`);
    }
}
