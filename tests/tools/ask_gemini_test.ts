import { assertEquals, assertRejects } from "@std/assert";
import {
  askGeminiTool,
  handleAskGemini,
} from "../../src/tools/ask-gemini.ts";

Deno.test("askGeminiTool - has correct structure", () => {
  assertEquals(askGeminiTool.name, "ask_gemini");
  assertEquals(typeof askGeminiTool.description, "string");
  assertEquals(typeof askGeminiTool.inputSchema, "object");
  assertEquals(askGeminiTool.inputSchema.required, ["prompt"]);
});

Deno.test("handleAskGemini - validates required prompt", async () => {
  await assertRejects(
    () => handleAskGemini({}),
    Error,
  );

  await assertRejects(
    () => handleAskGemini({ prompt: "" }),
    Error,
  );
});


Deno.test("handleAskGemini - validates temperature range", async () => {
  await assertRejects(
    () =>
      handleAskGemini({
        prompt: "test",
        temperature: -1,
      }),
    Error,
  );

  await assertRejects(
    () =>
      handleAskGemini({
        prompt: "test",
        temperature: 3,
      }),
    Error,
  );
});

Deno.test("handleAskGemini - validates thinking_budget range", async () => {
  await assertRejects(
    () =>
      handleAskGemini({
        prompt: "test",
        thinking_budget: 127,
      }),
    Error,
  );

  await assertRejects(
    () =>
      handleAskGemini({
        prompt: "test",
        thinking_budget: 40000,
      }),
    Error,
  );
});

Deno.test("handleAskGemini - accepts valid arguments without URLs", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key");
  Deno.env.set("GEMINI_MODEL", "test-model");

  try {
    await handleAskGemini({
      prompt: "What is artificial intelligence?",
      temperature: 0.7,
      thinking_budget: 2000,
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Failed to generate response with Gemini"),
      true,
    );
  }

  Deno.env.delete("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("handleAskGemini - accepts valid arguments with URLs in prompt", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key");
  Deno.env.set("GEMINI_MODEL", "test-model");

  try {
    await handleAskGemini({
      prompt: "Analyze these websites and tell me about their content: https://example.com and https://google.com",
      temperature: 0.5,
      thinking_budget: 4000,
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Failed to generate response with Gemini"),
      true,
    );
  }

  Deno.env.delete("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("handleAskGemini - accepts minimal valid arguments", async () => {
  Deno.env.set("GEMINI_API_KEY", "test-key");
  Deno.env.set("GEMINI_MODEL", "test-model");

  try {
    await handleAskGemini({
      prompt: "Hello world",
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Failed to generate response with Gemini"),
      true,
    );
  }

  Deno.env.delete("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_MODEL");
});
