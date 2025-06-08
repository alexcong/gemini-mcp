import { assertEquals } from "@std/assert";

Deno.test("Server module - can import without errors", async () => {
  try {
    const serverModule = await import("../src/server.ts");
    assertEquals(typeof serverModule, "object");
  } catch (error) {
    throw new Error(
      `Failed to import server module: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
});

Deno.test("Server - environment validation", () => {
  const originalKey = Deno.env.get("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_API_KEY");

  try {
    const cmd = new Deno.Command("deno", {
      args: ["run", "--allow-env", "src/server.ts"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stderr } = cmd.outputSync();
    const stderrText = new TextDecoder().decode(stderr);

    assertEquals(
      stderrText.includes("GEMINI_API_KEY environment variable is required"),
      true,
    );
  } finally {
    if (originalKey) {
      Deno.env.set("GEMINI_API_KEY", originalKey);
    }
  }
});

Deno.test("Server tools - all tools are properly imported", async () => {
  const askGeminiModule = await import("../src/tools/ask-gemini.ts");

  assertEquals(typeof askGeminiModule.askGeminiTool, "object");
  assertEquals(typeof askGeminiModule.handleAskGemini, "function");
});

Deno.test("Server tools - have required properties", async () => {
  const askGeminiModule = await import("../src/tools/ask-gemini.ts");

  const tools = [askGeminiModule.askGeminiTool];

  for (const tool of tools) {
    assertEquals(typeof tool.name, "string");
    assertEquals(typeof tool.description, "string");
    assertEquals(typeof tool.inputSchema, "object");
    assertEquals(tool.inputSchema.type, "object");
    assertEquals(typeof tool.inputSchema.properties, "object");
    assertEquals(Array.isArray(tool.inputSchema.required), true);
  }
});

Deno.test("Server prompts - all prompts are properly imported", async () => {
  const researchModule = await import("../src/prompts/research-analysis.ts");
  const eventsModule = await import("../src/prompts/current-events.ts");
  const techModule = await import("../src/prompts/technical-documentation.ts");
  const compareModule = await import("../src/prompts/compare-sources.ts");
  const factModule = await import("../src/prompts/fact-check.ts");

  assertEquals(typeof researchModule.researchAnalysisPrompt, "object");
  assertEquals(typeof researchModule.buildResearchAnalysisPrompt, "function");

  assertEquals(typeof eventsModule.currentEventsPrompt, "object");
  assertEquals(typeof eventsModule.buildCurrentEventsPrompt, "function");

  assertEquals(typeof techModule.technicalDocumentationPrompt, "object");
  assertEquals(typeof techModule.buildTechnicalDocumentationPrompt, "function");

  assertEquals(typeof compareModule.compareSourcesPrompt, "object");
  assertEquals(typeof compareModule.buildCompareSourcesPrompt, "function");

  assertEquals(typeof factModule.factCheckPrompt, "object");
  assertEquals(typeof factModule.buildFactCheckPrompt, "function");
});

Deno.test("Server prompts - have required properties", async () => {
  const researchModule = await import("../src/prompts/research-analysis.ts");
  const eventsModule = await import("../src/prompts/current-events.ts");
  const techModule = await import("../src/prompts/technical-documentation.ts");
  const compareModule = await import("../src/prompts/compare-sources.ts");
  const factModule = await import("../src/prompts/fact-check.ts");

  const prompts = [
    researchModule.researchAnalysisPrompt,
    eventsModule.currentEventsPrompt,
    techModule.technicalDocumentationPrompt,
    compareModule.compareSourcesPrompt,
    factModule.factCheckPrompt,
  ];

  for (const prompt of prompts) {
    assertEquals(typeof prompt.name, "string");
    assertEquals(typeof prompt.description, "string");
    assertEquals(Array.isArray(prompt.arguments), true);
  }
});
