import { assertEquals } from "@std/assert";
import { buildResearchAnalysisPrompt } from "../src/prompts/research-analysis.ts";
import { buildCurrentEventsPrompt } from "../src/prompts/current-events.ts";
import { buildTechnicalDocumentationPrompt } from "../src/prompts/technical-documentation.ts";
import { buildCompareSourcesPrompt } from "../src/prompts/compare-sources.ts";
import { buildFactCheckPrompt } from "../src/prompts/fact-check.ts";

Deno.test("buildResearchAnalysisPrompt - generates valid tool call", () => {
  const result = buildResearchAnalysisPrompt({
    topic: "quantum computing",
    urls: ["https://example.com"],
    focus_areas: "recent developments",
  });

  assertEquals(result.tool, "ask_gemini");
  assertEquals(typeof result.arguments.prompt, "string");
  assertEquals(result.arguments.urls, undefined);
  assertEquals(result.arguments.temperature, 0.3);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildCurrentEventsPrompt - generates valid tool call", () => {
  const result = buildCurrentEventsPrompt({
    topic: "AI developments",
    time_period: "last month",
    region: "US",
  });

  assertEquals(result.tool, "ask_gemini");
  assertEquals(typeof result.arguments.prompt, "string");
  assertEquals(result.arguments.temperature, 0.2);
  assertEquals(result.arguments.max_tokens, 3072);
});

Deno.test("buildTechnicalDocumentationPrompt - generates valid tool call", () => {
  const result = buildTechnicalDocumentationPrompt({
    documentation_urls: ["https://docs.example.com"],
    question: "How does OAuth work?",
    complexity_level: "intermediate",
  });

  assertEquals(result.tool, "ask_gemini");
  assertEquals(typeof result.arguments.prompt, "string");
  assertEquals(result.arguments.urls, undefined);
  assertEquals(result.arguments.temperature, 0.1);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildCompareSourcesPrompt - generates valid tool call", () => {
  const result = buildCompareSourcesPrompt({
    topic: "climate change",
    source_urls: ["https://source1.com", "https://source2.com"],
    comparison_criteria: "methodology",
  });

  assertEquals(result.tool, "ask_gemini");
  assertEquals(typeof result.arguments.prompt, "string");
  assertEquals(result.arguments.urls, undefined);
  assertEquals(result.arguments.temperature, 0.2);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildFactCheckPrompt - generates valid tool call", () => {
  const result = buildFactCheckPrompt({
    claim: "The Earth is flat",
    context: "Social media post",
  });

  assertEquals(result.tool, "ask_gemini");
  assertEquals(typeof result.arguments.prompt, "string");
  assertEquals(result.arguments.temperature, 0.1);
  assertEquals(result.arguments.max_tokens, 3072);
});

Deno.test("Prompts handle missing optional arguments", () => {
  const researchResult = buildResearchAnalysisPrompt({
    topic: "AI ethics",
  });
  assertEquals(typeof researchResult.arguments.prompt, "string");

  const eventsResult = buildCurrentEventsPrompt({
    topic: "space exploration",
  });
  assertEquals(typeof eventsResult.arguments.prompt, "string");

  const factResult = buildFactCheckPrompt({
    claim: "Vaccines cause autism",
  });
  assertEquals(typeof factResult.arguments.prompt, "string");
});