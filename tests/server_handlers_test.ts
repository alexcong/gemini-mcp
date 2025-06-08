import { assertEquals, assertExists, assert } from "@std/assert";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolResponseSchema,
  GetPromptResponseSchema,
  Tool,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import { GeminiMcpServer } from "../src/server.ts"; // Assuming this is the class name
import * as askGemini from "../src/tools/ask-gemini.ts";
import { spy } from "@std/testing/mock";
import * as researchAnalysis from "../src/prompts/research-analysis.ts";
import * as currentEvents from "../src/prompts/current-events.ts";
import * as techDocs from "../src/prompts/technical-documentation.ts";
import * as compareSources from "../src/prompts/compare-sources.ts";
import * as factCheck from "../src/prompts/fact-check.ts";

// Helper to create a server instance for testing.
// This might need adjustment based on how GeminiMcpServer is structured.
// For now, assume GeminiMcpServer creates and configures the MCP Server instance.
// We'll need a way to get that instance.
// A temporary solution: GeminiMcpServer could expose its server instance for testing.
// Or, we test via server.receiveMessage which is more black-box but harder for unit tests.

// Let's assume GeminiMcpServer is modified to expose its internal server for tests:
class TestableGeminiMcpServer extends GeminiMcpServer {
  public getServerInstance(): Server {
    // @ts-ignore: Accessing private member for testing
    return this.server;
  }
}

// Mocks
let mockHandleAskGeminiResponse: any = { content: [{ type: "text", text: "mocked ask_gemini response" }] };
let mockHandleAskGeminiError: Error | null = null;
const handleAskGeminiSpy = spy(askGemini, "handleAskGemini", async (_args: any) => {
  if (mockHandleAskGeminiError) throw mockHandleAskGeminiError;
  return mockHandleAskGeminiResponse;
});

const buildResearchAnalysisPromptSpy = spy(researchAnalysis, "buildResearchAnalysisPrompt");
const buildCurrentEventsPromptSpy = spy(currentEvents, "buildCurrentEventsPrompt");
const buildTechnicalDocumentationPromptSpy = spy(techDocs, "buildTechnicalDocumentationPrompt");
const buildCompareSourcesPromptSpy = spy(compareSources, "buildCompareSourcesPrompt");
const buildFactCheckPromptSpy = spy(factCheck, "buildFactCheckPrompt");


function resetMocks() {
  mockHandleAskGeminiResponse = { content: [{ type: "text", text: "mocked ask_gemini response" }] };
  mockHandleAskGeminiError = null;
  handleAskGeminiSpy.calls = []; // Reset spy calls

  buildResearchAnalysisPromptSpy.calls = [];
  buildCurrentEventsPromptSpy.calls = [];
  buildTechnicalDocumentationPromptSpy.calls = [];
  buildCompareSourcesPromptSpy.calls = [];
  buildFactCheckPromptSpy.calls = [];

  // Restore original implementations if necessary, though spy wraps them by default
}

Deno.test("MCP Server - ListTools Handler", async () => {
  resetMocks();
  // Ensure API key is set for server instantiation, even if not used by these specific tests
  const originalApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

  const mcpServer = new TestableGeminiMcpServer();
  const server = mcpServer.getServerInstance();

  if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

  const handler = server.getRequestHandler(ListToolsRequestSchema);
  assertExists(handler, "ListToolsRequestSchema handler should be registered");

  const response = await handler({} as any); // No params for ListTools
  assertExists(response.tools);
  assertEquals(response.tools.length, 1);
  const tool = response.tools[0] as Tool;
  assertEquals(tool.name, "ask_gemini");
  assertExists(tool.description);
  assertExists(tool.inputSchema);
});

Deno.test("MCP Server - ListPrompts Handler", async () => {
  resetMocks();
  const originalApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

  const mcpServer = new TestableGeminiMcpServer();
  const server = mcpServer.getServerInstance();

  if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

  const handler = server.getRequestHandler(ListPromptsRequestSchema);
  assertExists(handler, "ListPromptsRequestSchema handler should be registered");

  const response = await handler({} as any); // No params for ListPrompts
  assertExists(response.prompts);
  const promptNames = response.prompts.map((p: Prompt) => p.name);
  assertEquals(promptNames.length, 5); // research_analysis, current_events, etc.
  assert(promptNames.includes("research_analysis"));
  assert(promptNames.includes("current_events"));
  assert(promptNames.includes("technical_documentation"));
  assert(promptNames.includes("compare_sources"));
  assert(promptNames.includes("fact_check"));
});

// CallToolRequestSchema tests
Deno.test("MCP Server - CallTool Handler - valid tool 'ask_gemini'", async () => {
  resetMocks();
  const originalApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

  const mcpServer = new TestableGeminiMcpServer();
  const server = mcpServer.getServerInstance();

  if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

  const handler = server.getRequestHandler(CallToolRequestSchema);
  assertExists(handler);

  const toolArgs = { prompt: "hello" };
  const response = await handler({ name: "ask_gemini", arguments: toolArgs });

  assertEquals(handleAskGeminiSpy.calls.length, 1);
  assertEquals(handleAskGeminiSpy.calls[0].args[0], toolArgs);
  assertEquals(response, mockHandleAskGeminiResponse); // Should return what handleAskGemini returns
});

Deno.test("MCP Server - CallTool Handler - unknown tool", async () => {
  resetMocks();
  const originalApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

  const mcpServer = new TestableGeminiMcpServer();
  const server = mcpServer.getServerInstance();

  if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

  const handler = server.getRequestHandler(CallToolRequestSchema);
  assertExists(handler);

  const response = await handler({ name: "unknown_tool", arguments: {} }) as CallToolResponseSchema;
  assert(response.isError, "Response should be an error for unknown tool");
  assertExists(response.content);
  assertEquals(response.content[0].type, "text");
  assert(response.content[0].text?.includes("Unknown tool: unknown_tool"));
  // @ts-ignore: checking for errorCode
  assertEquals(response.errorCode, "UNKNOWN_TOOL");
});

Deno.test("MCP Server - CallTool Handler - error in handleAskGemini", async () => {
  resetMocks();
  mockHandleAskGeminiError = new Error("Gemini API unavailable");
  const originalApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

  const mcpServer = new TestableGeminiMcpServer();
  const server = mcpServer.getServerInstance();

  if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

  const handler = server.getRequestHandler(CallToolRequestSchema);
  assertExists(handler);

  const response = await handler({ name: "ask_gemini", arguments: {prompt: "test"} }) as CallToolResponseSchema;
  assert(response.isError);
  assertExists(response.content);
  assertEquals(response.content[0].type, "text");
  assert(response.content[0].text?.includes("Error processing tool 'ask_gemini': Gemini API unavailable"));
  // @ts-ignore: checking for errorCode
  assertEquals(response.errorCode, "TOOL_EXECUTION_FAILED");
});


// GetPromptRequestSchema tests
Deno.test("MCP Server - GetPrompt Handler - valid prompt 'research_analysis'", async () => {
    resetMocks();
    const originalApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

    const mcpServer = new TestableGeminiMcpServer();
    const server = mcpServer.getServerInstance();

    if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

    const handler = server.getRequestHandler(GetPromptRequestSchema);
    assertExists(handler);

    // Restore the original implementation for the one we are testing
    const originalBuilder = researchAnalysis.buildResearchAnalysisPrompt;
    // @ts-ignore: assign to const
    researchAnalysis.buildResearchAnalysisPrompt = (args) => ({ tool: "ask_gemini", arguments: { prompt: `Built: ${args.topic}`}});

    const promptArgs = { topic: "AI in healthcare" };
    const response = await handler({ name: "research_analysis", arguments: promptArgs }) as GetPromptResponseSchema;

    // assertEquals(buildResearchAnalysisPromptSpy.calls.length, 1); // Spy won't work if we replace the function
    // assertEquals(buildResearchAnalysisPromptSpy.calls[0].args[0], promptArgs);
    assertExists(response.messages);
    assertEquals(response.messages[0].role, "user");
    assertEquals(response.messages[0].content.type, "text");
    assert(response.messages[0].content.text?.includes('Built: AI in healthcare'));
    assert(response.messages[0].content.text?.includes('ask_gemini'));

    // @ts-ignore: assign to const
    researchAnalysis.buildResearchAnalysisPrompt = originalBuilder; // Restore
});


Deno.test("MCP Server - GetPrompt Handler - unknown prompt", async () => {
    resetMocks();
    const originalApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

    const mcpServer = new TestableGeminiMcpServer();
    const server = mcpServer.getServerInstance();

    if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

    const handler = server.getRequestHandler(GetPromptRequestSchema);
    assertExists(handler);

    // Expect this to throw as per current server.ts implementation for GetPrompt
    try {
        await handler({ name: "unknown_prompt", arguments: {} });
        assert(false, "Handler should have thrown for unknown prompt");
    } catch (error) {
        assert(error instanceof Error);
        assert(error.message.includes("Unknown prompt: unknown_prompt"));
    }
});

Deno.test("MCP Server - GetPrompt Handler - error in prompt builder", async () => {
    resetMocks();
    const originalApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!originalApiKey) Deno.env.set("GEMINI_API_KEY", "test-api-key-for-server-init");

    const mcpServer = new TestableGeminiMcpServer();
    const server = mcpServer.getServerInstance();

    if (!originalApiKey) Deno.env.delete("GEMINI_API_KEY");

    const handler = server.getRequestHandler(GetPromptRequestSchema);
    assertExists(handler);

    // Mock a specific builder to throw an error
    const originalBuilder = researchAnalysis.buildResearchAnalysisPrompt;
    // @ts-ignore: assign to const
    researchAnalysis.buildResearchAnalysisPrompt = () => { throw new Error("Builder failed"); };

    try {
        await handler({ name: "research_analysis", arguments: { topic: "test" } });
        assert(false, "Handler should have thrown for builder error");
    } catch (error) {
        assert(error instanceof Error);
        assert(error.message.includes("Error in prompt builder for 'research_analysis': Builder failed"));
    }
    // @ts-ignore: assign to const
    researchAnalysis.buildResearchAnalysisPrompt = originalBuilder; // Restore
});

console.log("MCP Server handler tests created/updated in tests/server_handlers_test.ts");

// Note: The original tests/server_test.ts contains import and environment checks.
// These new tests focus on handler logic and require mocks.
// The TestableGeminiMcpServer is a temporary approach; proper DI or making 'server' accessible
// in GeminiMcpServer would be cleaner.
// Also, the spy on buildResearchAnalysisPrompt in the "valid prompt" test was tricky because
// the map holds direct function references. Replaced with temporary direct mock of the function.
// For full coverage, each prompt builder would need a similar test.
