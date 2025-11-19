import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { GeminiClient } from "../gemini-client.ts";
import type { GeminiRequest } from "../gemini-client.ts";

const AskGeminiArgsSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

export const askGeminiTool: Tool = {
  name: "ask_gemini",
  description:
    "Generate comprehensive responses using Google Gemini with built-in Google Search and URL context capabilities. Include URLs directly in your prompt text for the AI to automatically search and analyze them along with other relevant information.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description:
          "Your question or request. Include any URLs directly in the text that you want analyzed. The AI will automatically search for current information and analyze any URLs mentioned in your prompt.",
      },
    },
    required: ["prompt"],
  },
};

export async function handleAskGemini(
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const validatedArgs = AskGeminiArgsSchema.parse(args);

  const geminiClient = new GeminiClient();

  const request: GeminiRequest = {
    prompt: validatedArgs.prompt,
  };

  try {
    const response = await geminiClient.generate(request);

    let formattedResponse = response.text;

    // Add sources section if we have any
    if (response.metadata?.sources && response.metadata.sources.length > 0) {
      const uniqueSources = [...new Set(response.metadata.sources)];
      if (uniqueSources.length > 0) {
        formattedResponse += "\n\n**Sources:**\n";
        uniqueSources.forEach((source, index) => {
          formattedResponse += `${index + 1}. ${source}\n`;
        });
      }
    }

    return {
      content: [
        {
          type: "text",
          text: formattedResponse,
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to generate response with Gemini: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
