import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Suitable Models for Text Generation:");
        const textModels = data.models.filter((m: any) =>
            m.supportedGenerationMethods.includes("generateContent")
        );
        console.log(JSON.stringify(textModels.map((m: any) => ({ name: m.name, displayName: m.displayName })), null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
