import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  text: string;
  metadata?: {
    sources?: string[];
    searchSuggestions?: string[];
  };
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    const config = ConfigSchema.parse({
      apiKey: apiKey || Deno.env.get("GEMINI_API_KEY"),
    });

    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-pro-preview-06-05",
        // deno-lint-ignore no-explicit-any
        tools: [{ urlContext: {} }, { googleSearch: {} }] as any,
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 4096,
        },
      });

      const response = await result.response;

      const candidate = response.candidates?.[0];
      // deno-lint-ignore no-explicit-any
      const metadata = candidate as any;

      // Extract sources from both URL context and grounding metadata
      const sources: string[] = [];
      
      // URL context sources
      if (metadata?.urlContextMetadata) {
        if (Array.isArray(metadata.urlContextMetadata)) {
          metadata.urlContextMetadata.forEach((item: any) => {
            if (item?.url) sources.push(item.url);
          });
        } else if (metadata.urlContextMetadata.url) {
          sources.push(metadata.urlContextMetadata.url);
        }
      }
      
      // Grounding metadata sources
      if (metadata?.groundingMetadata?.groundingChunks) {
        metadata.groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk?.web?.uri) sources.push(chunk.web.uri);
        });
      }

      return {
        text: response.text(),
        metadata: {
          sources: [...new Set(sources)], // Remove duplicates
          searchSuggestions: metadata?.groundingMetadata?.searchEntryPoint?.renderedContent
            ? [metadata.groundingMetadata.searchEntryPoint.renderedContent]
            : [],
        },
      };
    } catch (error) {
      throw new Error(
        `Gemini generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}