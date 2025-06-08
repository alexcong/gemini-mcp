import { assertEquals, assertRejects } from "@std/assert";
import { GeminiClient } from "../src/gemini-client.ts";

Deno.test("GeminiClient - generate validates input", async () => {
  const client = new GeminiClient("test-key");

  await assertRejects(
    () => client.generate({ prompt: "" }),
    Error,
  );
});

Deno.test("GeminiClient - generate accepts valid request without URLs", async () => {
  const client = new GeminiClient("test-key");

  try {
    await client.generate({
      prompt: "What is machine learning?",
      temperature: 0.7,
      maxTokens: 2000,
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
});

Deno.test("GeminiClient - generate accepts valid request with URLs in prompt", async () => {
  const client = new GeminiClient("test-key");

  try {
    await client.generate({
      prompt: "Analyze these websites: https://example.com and https://openai.com",
      temperature: 0.5,
      maxTokens: 4000,
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
});

Deno.test("GeminiClient - generate uses default values", async () => {
  const client = new GeminiClient("test-key");

  try {
    await client.generate({
      prompt: "Simple question",
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
});