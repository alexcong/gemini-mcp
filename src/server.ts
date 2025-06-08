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

import { configureLogging, getLogger } from "./logging.ts";

/**
 * Defines the signature for functions that build prompt structures.
 * @param args - A record of arguments, typically from an MCP prompt request.
 * @returns An object containing the tool name and the arguments for that tool.
 */
type PromptBuilderFunction = (args: Record<string, any>) => { tool: string; arguments: Record<string, any>; };

/**
 * A registry mapping prompt names to their respective builder functions.
 * This allows for dynamic dispatch in the `GetPromptRequestSchema` handler.
 */
const promptBuilders = new Map<string, PromptBuilderFunction>([
  ["research_analysis", buildResearchAnalysisPrompt],
  ["current_events", buildCurrentEventsPrompt],
  ["technical_documentation", buildTechnicalDocumentationPrompt],
  ["compare_sources", buildCompareSourcesPrompt],
  ["fact_check", buildFactCheckPrompt],
]);

/**
 * Implements the Model Context Protocol (MCP) server for Gemini AI capabilities.
 * This class sets up handlers for various MCP requests, such as listing tools,
 * calling tools, listing prompts, and getting specific prompts.
 */
class GeminiMcpServer {
  private server: Server;

  /**
   * Initializes a new instance of the `GeminiMcpServer`.
   * It creates an MCP `Server` and sets up all necessary request handlers.
   */
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

  /**
   * Sets up the request handlers for the MCP server.
   * This includes handlers for listing tools, calling tools,
   * listing prompts, and retrieving specific prompts.
   * @private
   */
  private setupHandlers(): void {
    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: [askGeminiTool],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const logger = getLogger("server"); // Get server logger
      try {
        switch (name) {
          case "ask_gemini":
            return await handleAskGemini(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error processing tool '${name}' with args: ${JSON.stringify(args)}`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        let errorCode = "TOOL_EXECUTION_FAILED";
        if (errorMessage.startsWith("Unknown tool:")) {
          errorCode = "UNKNOWN_TOOL";
        }

        return {
          content: [
            {
              type: "text",
              text: `Error processing tool '${name}': ${errorMessage}`,
            },
          ],
          isError: true,
          errorCode: errorCode,
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
        const builder = promptBuilders.get(name);
        if (!builder) {
          throw new Error(`Unknown prompt: ${name}`);
        }
        const toolCall = builder(args || {});

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
        const logger = getLogger("server"); // Get server logger
        logger.error(`Error processing prompt '${name}' with args: ${JSON.stringify(args)}`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        let specificMessage = `Failed to generate prompt '${name}'`;
        if (errorMessage.startsWith("Unknown prompt:")) {
          specificMessage = errorMessage;
        } else if (error instanceof Error) {
          // Assuming other errors are from prompt builder functions
          specificMessage = `Error in prompt builder for '${name}': ${errorMessage}`;
        }
        // The server framework should handle catching this error and sending an appropriate response.
        throw new Error(specificMessage);
      }
    });
  }

  /**
   * Starts the MCP server and connects it to a transport (StdioServerTransport).
   * It also logs server startup information, including API key status.
   * @returns A promise that resolves when the server is connected and running.
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    const logger = getLogger("server"); // Use server logger
    const hasApiKey = !!Deno.env.get("GEMINI_API_KEY");
    logger.info(`Gemini MCP Server running on stdio (API Key: ${hasApiKey ? "configured" : "NOT SET"})`);
  }
}

/**
 * Main entry point for the application.
 * It configures logging, checks for the required `GEMINI_API_KEY` environment variable,
 * and starts the `GeminiMcpServer`.
 * Global error handlers are also set up here to catch unhandled promise rejections and exceptions.
 */
async function main(): Promise<void> {
  await configureLogging(); // Initialize logging
  const logger = getLogger("default"); // Default logger for main setup

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    logger.error("Error: GEMINI_API_KEY environment variable is required");
    logger.error("Please set your Gemini API key:");
    logger.error("export GEMINI_API_KEY=your_api_key_here");
    Deno.exit(1);
  }

  const server = new GeminiMcpServer();
  await server.run();
}

if (import.meta.main) {
  // It's better to configure logging inside main, after it's called.
  // However, global handlers need to be set up early.
  // For simplicity with @std/log, we'll rely on configureLogging() in main().
  // If these global handlers trigger before logging is configured, they'll use console.error.
  // For a more robust solution, one might initialize a very basic logger for these global handlers
  // or ensure configureLogging() is called even earlier, if possible.

  globalThis.addEventListener("unhandledrejection", (event) => {
    // Ensure event.reason is an Error for better logging, otherwise convert
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    getLogger("default").error("Unhandled promise rejection:", error);
  });

  globalThis.addEventListener("error", (event) => {
    // event.error is usually an Error object
    getLogger("default").error("Uncaught exception:", event.error);
  });

  main().catch((error) => {
    const logger = getLogger("default"); // Get logger, might be uninitialized if main itself fails early
    logger.critical("Critical server error in main execution:", error);
    Deno.exit(1); // Ensure logging is flushed if possible, though Deno usually handles it.
  });
}
