import dotenv from "dotenv";
import fs from "fs";

// Manually load env local since we are running with node
try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log("No .env.local found or error loading it");
}

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

async function list() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Listing models from ${url.replace(apiKey, "HIDDEN_KEY")}...`);

    try {
        const response = await fetch(url);

        console.log("Status:", response.status, response.statusText);
        const data = await response.json();

        // Filter for gemini models that support content generation
        const geminiModels = (data.models || []).filter((m: any) =>
            m.name.includes("gemini") &&
            m.supportedGenerationMethods.includes("generateContent")
        );

        console.log(`Found ${geminiModels.length} Gemini models.`);

        // Save to file to see the exact names (e.g. "models/gemini-1.5-flash-001")
        fs.writeFileSync("models.json", JSON.stringify(geminiModels, null, 2));
        console.log("Full list saved to 'models.json'. Please check this file for the correct 'name' property.");

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

list();