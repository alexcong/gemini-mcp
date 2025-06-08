import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { askGeminiTool, handleAskGemini } from "./tools/ask-gemini.ts";

// Import prompts
import { researchAnalysisPrompt, buildResearchAnalysisPrompt } from "./prompts/research-analysis.ts";
import { currentEventsPrompt, buildCurrentEventsPrompt } from "./prompts/current-events.ts";
import { technicalDocumentationPrompt, buildTechnicalDocumentationPrompt } from "./prompts/technical-documentation.ts";
import { compareSourcesPrompt, buildCompareSourcesPrompt } from "./prompts/compare-sources.ts";
import { factCheckPrompt, buildFactCheckPrompt } from "./prompts/fact-check.ts";

class GeminiMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "gemini-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: [askGeminiTool],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "ask_gemini":
            return await handleAskGemini(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, () => {
      return {
        prompts: [
          researchAnalysisPrompt,
          currentEventsPrompt,
          technicalDocumentationPrompt,
          compareSourcesPrompt,
          factCheckPrompt,
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let toolCall;
        switch (name) {
          case "research_analysis":
            toolCall = buildResearchAnalysisPrompt(args || {});
            break;
          case "current_events":
            toolCall = buildCurrentEventsPrompt(args || {});
            break;
          case "technical_documentation":
            toolCall = buildTechnicalDocumentationPrompt(args || {});
            break;
          case "compare_sources":
            toolCall = buildCompareSourcesPrompt(args || {});
            break;
          case "fact_check":
            toolCall = buildFactCheckPrompt(args || {});
            break;
          default:
            throw new Error(`Unknown prompt: ${name}`);
        }

        return {
          description: `Prompt for ${name}`,
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Use the ${toolCall.tool} tool with these arguments: ${JSON.stringify(toolCall.arguments, null, 2)}`,
              },
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    const hasApiKey = !!Deno.env.get("GEMINI_API_KEY");
    console.error(`Gemini MCP Server running on stdio (API Key: ${hasApiKey ? "configured" : "NOT SET"})`);
  }
}

async function main(): Promise<void> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    console.error("Please set your Gemini API key:");
    console.error("export GEMINI_API_KEY=your_api_key_here");
    Deno.exit(1);
  }

  const server = new GeminiMcpServer();
  await server.run();
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Server error:", error);
    Deno.exit(1);
  });
}
