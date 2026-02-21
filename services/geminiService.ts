import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("VITE_GEMINI_API_KEY is not set in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey || "");
    this.model = this.genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
  }

  async analyzeNews(text: string, onStep?: (step: string) => void, targetLanguage: string = 'English', currentDate: string = new Date().toDateString(), imageData?: string): Promise<AnalysisResult> {
    try {
      if (onStep) onStep("Identifying language and translating...");

      const systemPrompt = `
        You are an elite AI fact-checker. Current Date: ${currentDate}.
        
        ALGORITHM:
        1. Identify the input language.
        2. Analyze source credibility and logic.
        3. Check for sensitive topics (Rape, Pornography, Sexual Content, Nudity). Mark "isSensitive": true ONLY for confirmed explicit sexual content/nudity or rape. ABSOLUTELY EXCLUDE Murder, Theft, Robbery, or general violence from being labeled as sensitive.
        4. Provide detailed output in this language: ${targetLanguage}.
        5. IF IMAGE IS PROVIDED: Analyze visual elements, text overlays, and metadata for manipulation or context.

        REQUIRED JSON FORMAT:
        {
          "detectedLanguage": "string",
          "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED",
          "confidenceScore": number (0-100),
          "summary": "Overview in ${targetLanguage}",
          "reasoning": ["point 1 in ${targetLanguage}", ...],
          "biasAnalysis": "Bias eval in ${targetLanguage}",
          "isSensitive": boolean,
          "factualChecks": [
            {
              "claim": "Claim",
              "isCorrect": boolean,
              "explanation": "Explanation in ${targetLanguage}"
            }
          ]
        }
      `;

      if (onStep) onStep("Connecting to the global knowledge graph...");

      const parts: any[] = [{ text: `System Instruction: ${systemPrompt}\n\nAnalyze this news content:\n\n"${text}"` }];

      if (imageData) {
        // Remove data URL prefix if present for API
        const base64Data = imageData.split(',')[1] || imageData;
        parts.unshift({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      }

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts }],
      });

      if (onStep) onStep("Synthesizing findings...");

      const response = await result.response;
      const textResponse = response.text();

      // Clean up markdown code blocks if present
      const jsonStr = textResponse.replace(/^```json\n|\n```$/g, "").trim();

      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON response:", jsonStr);
        throw new Error("Invalid JSON response from AI");
      }

      // Mock sources as the free tier/standard SDK doesn't always return citation metadata in the same way
      // or it requires a specific tool configuration (Google Search) which might not be enabled for this key.
      // For now, we will leave sources empty or simulated if needed, 
      // but the original code was trying to read groundingMetadata.
      // We'll attempt to support standard grounding if available in the response object 
      // but usually typical prompts don't return it without tools.

      const sources: any[] = [];
      // Check for citation metadata if available (this varies by model/api version)
      if (response.candidates && response.candidates[0].citationMetadata) {
        response.candidates[0].citationMetadata.citationSources.forEach((source: any) => {
          sources.push({
            title: "Source", // Citation metadata often lacks titles in some versions
            uri: source.uri
          });
        });
      }

      return {
        ...data,
        sources: sources.length > 0 ? sources : []
      };
    } catch (error: any) {
      console.error("Gemini Analysis Error:", error);
      throw new Error(error.message || "Analysis failed. Please try again with a more specific news excerpt.");
    }
  }
}
