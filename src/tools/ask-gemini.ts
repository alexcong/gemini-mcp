import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { GeminiClient, GeminiRequest } from "../gemini-client.ts";

const AskGeminiArgsSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  temperature: z.number().min(0).max(2).optional().describe(
    "Controls randomness in output. Range: 0-2. Default: 0.7",
  ),
  max_tokens: z.number().min(1).max(8192).optional().describe(
    "Maximum tokens to generate. Default: 4096",
  ),
});

/**
 * MCP Tool definition for the `ask_gemini` tool.
 * This tool allows users to interact with the Google Gemini model.
 * It supports providing a prompt, and optionally temperature and max_tokens.
 * URLs included in the prompt text are automatically analyzed by Gemini.
 */
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
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        description:
          "Controls creativity/randomness. Lower values (0.1-0.3) for factual content, higher values (0.7-1.0) for creative content.",
      },
      max_tokens: {
        type: "number",
        minimum: 1,
        maximum: 8192,
        description:
          "Maximum number of tokens to generate. Default is 4096 for comprehensive responses.",
      },
    },
    required: ["prompt"],
  },
};

/**
 * Handles the execution of the `ask_gemini` tool.
 * It validates the input arguments, calls the `GeminiClient` to generate content,
 * and formats the response, including any sources or search suggestions.
 *
 * @param args - The arguments for the `ask_gemini` tool, expected to conform to `AskGeminiArgsSchema`.
 * @returns A promise that resolves to an MCP-compatible tool response object,
 *          containing the formatted text response from Gemini.
 * @throws {Error} If argument validation fails or if the Gemini API call fails.
 *                 ZodErrors from validation are thrown directly.
 */
export async function handleAskGemini(
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const validatedArgs = AskGeminiArgsSchema.parse(args);

  const geminiClient = new GeminiClient();

  const request: GeminiRequest = {
    prompt: validatedArgs.prompt,
    temperature: validatedArgs.temperature,
    maxTokens: validatedArgs.max_tokens,
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

    // Add search suggestions if available
    if (
      response.metadata?.searchSuggestions &&
      response.metadata.searchSuggestions.length > 0
    ) {
      formattedResponse += "\n**Related searches:**\n";
      response.metadata.searchSuggestions.forEach((suggestion) => {
        formattedResponse += `• ${suggestion}\n`;
      });
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
