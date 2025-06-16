import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1, "Model name is required"),
});

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  thinkingBudget?: number;
}

export interface GeminiResponse {
  text: string;
  metadata?: {
    sources?: string[];
  };
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey?: string) {
    const config = ConfigSchema.parse({
      apiKey: apiKey || Deno.env.get("GEMINI_API_KEY"),
      model: Deno.env.get("GEMINI_MODEL"),
    });

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        // deno-lint-ignore no-explicit-any
        tools: [{ urlContext: {} }, { googleSearch: {} }] as any,
      });

      const generationConfig: any = {
        temperature: request.temperature ?? 0.7,
      };

      // Add thinkingBudget if provided
      if (request.thinkingBudget !== undefined) {
        generationConfig.thinkingConfig = {
          thinkingBudget: request.thinkingBudget,
        };
      }

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: request.prompt }] }],
        generationConfig,
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
