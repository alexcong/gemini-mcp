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
