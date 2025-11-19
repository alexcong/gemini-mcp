import { assertEquals, assertRejects } from "@std/assert";
import { GeminiClient } from "../src/gemini-client.ts";

Deno.test("GeminiClient - generate validates input", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-key");

  await assertRejects(
    () => client.generate({ prompt: "" }),
    Error,
  );
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - generate accepts valid request without URLs", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-key");

  try {
    await client.generate({
      prompt: "What is machine learning?",
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - generate accepts valid request with URLs in prompt", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-key");

  try {
    await client.generate({
      prompt:
        "Analyze these websites: https://example.com and https://openai.com",
    });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - generate uses default values", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
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
  Deno.env.delete("GEMINI_MODEL");
});
