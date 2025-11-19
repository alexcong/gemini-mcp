import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerativeModel, Tool } from "@google/generative-ai";
import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1, "Model name is required"),
});

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export interface GeminiRequest {
  prompt: string;
}

export interface GeminiResponse {
  text: string;
  metadata?: {
    sources?: string[];
  };
}

interface UrlContextMetadataItem {
  url?: string;
}

type UrlContextMetadata = UrlContextMetadataItem | UrlContextMetadataItem[];

interface GroundingChunk {
  web?: {
    uri?: string;
  };
}

interface CandidateMetadata {
  urlContextMetadata?: UrlContextMetadata;
  groundingMetadata?: {
    groundingChunks?: GroundingChunk[];
  };
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey?: string) {
    const config = ConfigSchema.parse({
      apiKey: apiKey || Deno.env.get("GEMINI_API_KEY"),
      model: Deno.env.get("GEMINI_MODEL"),
    });

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.model });
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const validatedRequest = GenerateRequestSchema.parse(request);
    try {
      const tools = [
        { googleSearch: {} },
        { urlContext: {} },
      ] as unknown as Tool[]; // Types don't yet include these MCP tools

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: validatedRequest.prompt }],
          },
        ],
        tools,
      });

      const response = await result.response;

      const candidate = response.candidates?.[0];
      const metadata = candidate as CandidateMetadata | undefined;

      // Extract sources from both URL context and grounding metadata
      const sources: string[] = [];

      // URL context sources
      const urlContextMetadata = metadata?.urlContextMetadata;
      if (urlContextMetadata) {
        if (Array.isArray(urlContextMetadata)) {
          urlContextMetadata.forEach((item) => {
            if (item?.url) sources.push(item.url);
          });
        } else if (urlContextMetadata.url) {
          sources.push(urlContextMetadata.url);
        }
      }

      // Grounding metadata sources
      metadata?.groundingMetadata?.groundingChunks?.forEach((chunk) => {
        if (chunk?.web?.uri) sources.push(chunk.web.uri);
      });

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
