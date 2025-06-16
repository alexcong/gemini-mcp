import { assertEquals, assertRejects } from "@std/assert";
import { GeminiClient } from "../src/gemini-client.ts";

Deno.test("GeminiClient - constructor validates API key", () => {
  const originalKey = Deno.env.get("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_API_KEY");

  try {
    new GeminiClient("");
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("Required"))) {
      throw error;
    }
  } finally {
    if (originalKey) {
      Deno.env.set("GEMINI_API_KEY", originalKey);
    }
  }
});

Deno.test("GeminiClient - constructor uses environment variable", () => {
  Deno.env.set("GEMINI_API_KEY", "test-key");
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient();
  assertEquals(typeof client, "object");
  Deno.env.delete("GEMINI_API_KEY");
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - constructor uses provided API key", () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-api-key");
  assertEquals(typeof client, "object");
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - generate validates input", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-key");

  await assertRejects(
    () => client.generate({ prompt: "" }),
    Error,
  );
  Deno.env.delete("GEMINI_MODEL");
});

Deno.test("GeminiClient - generate accepts valid input", async () => {
  Deno.env.set("GEMINI_MODEL", "test-model");
  const client = new GeminiClient("test-key");

  try {
    await client.generate({ prompt: "What is the weather today?" });
  } catch (error) {
    assertEquals(
      error instanceof Error &&
        error.message.includes("Gemini generation failed"),
      true,
    );
  }
  Deno.env.delete("GEMINI_MODEL");
});