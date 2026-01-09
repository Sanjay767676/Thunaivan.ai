import { extractPdfText, multiModelAnalyze } from '../server/lib/ai-multi';

function testWhitespaceCleaning() {
    console.log("Testing whitespace cleaning...");

    const dirtyText = `This   is    a   text   
    
    with   many    spaces    and
    
    
    newlines.`;

    const cleanText = dirtyText
        .split('\n')
        .map((line: string) => line.trim())
        .join('\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    console.log("Original length:", dirtyText.length);
    console.log("Cleaned length:", cleanText.length);
    console.log("Cleaned Text Output:\n" + JSON.stringify(cleanText));

    if (cleanText.includes("   ")) {
        console.error("FAIL: Multiple spaces found.");
    } else if (cleanText.includes("\n\n\n")) {
        console.error("FAIL: Excessive newlines found.");
    } else {
        console.log("PASS: Whitespace cleaned successfully.");
    }
}

testWhitespaceCleaning();
