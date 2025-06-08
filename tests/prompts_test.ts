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
  assert(result.arguments.prompt.includes("quantum computing"), "Prompt should include topic");
  assert(result.arguments.prompt.includes("https://example.com"), "Prompt should include URL");
  assert(result.arguments.prompt.includes("recent developments"), "Prompt should include focus_areas");
  assertEquals(result.arguments.urls, undefined, "urls argument to ask_gemini should be undefined as they are in the prompt");
  assertEquals(result.arguments.temperature, 0.3);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildResearchAnalysisPrompt - with only topic", () => {
  const result = buildResearchAnalysisPrompt({
    topic: "AI ethics",
  });
  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("AI ethics"), "Prompt should include topic");
  assert(!result.arguments.prompt.includes("Relevant URLs"), "Prompt should not mention URLs if none provided");
  assert(!result.arguments.prompt.includes("Specific Focus Areas"), "Prompt should not mention focus if none provided");
  assertEquals(result.arguments.urls, undefined);
});

Deno.test("buildCurrentEventsPrompt - generates valid tool call", () => {
  const result = buildCurrentEventsPrompt({
    topic: "AI developments",
    time_period: "last month",
    region: "US",
  });

  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("AI developments"), "Prompt should include topic");
  assert(result.arguments.prompt.includes("last month"), "Prompt should include time_period");
  assert(result.arguments.prompt.includes("US"), "Prompt should include region");
  assertEquals(result.arguments.temperature, 0.2);
  assertEquals(result.arguments.max_tokens, 3072);
});

Deno.test("buildCurrentEventsPrompt - with only topic", () => {
  const result = buildCurrentEventsPrompt({
    topic: "global economy",
  });
  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("global economy"));
  assert(!result.arguments.prompt.includes("Time Period"), "Prompt should not mention time_period if none provided");
  assert(!result.arguments.prompt.includes("Region/Location"), "Prompt should not mention region if none provided");
});

Deno.test("buildTechnicalDocumentationPrompt - generates valid tool call", () => {
  const result = buildTechnicalDocumentationPrompt({
    documentation_urls: ["https://docs.example.com"],
    question: "How does OAuth work?",
    complexity_level: "intermediate",
  });

  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("https://docs.example.com"), "Prompt should include documentation_urls");
  assert(result.arguments.prompt.includes("How does OAuth work?"), "Prompt should include question");
  assert(result.arguments.prompt.includes("intermediate"), "Prompt should include complexity_level");
  assertEquals(result.arguments.urls, undefined, "urls argument to ask_gemini should be undefined");
  assertEquals(result.arguments.temperature, 0.1);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildTechnicalDocumentationPrompt - only required args", () => {
  const result = buildTechnicalDocumentationPrompt({
    documentation_urls: ["https://another.docs.org"],
    question: "What is Deno?",
  });
  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("https://another.docs.org"));
  assert(result.arguments.prompt.includes("What is Deno?"));
  assert(!result.arguments.prompt.includes("Complexity Level"), "Prompt should not mention complexity if none provided");
});

Deno.test("buildCompareSourcesPrompt - generates valid tool call", () => {
  const result = buildCompareSourcesPrompt({
    topic: "climate change",
    source_urls: ["https://source1.com", "https://source2.com"],
    comparison_criteria: "methodology",
  });

  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("climate change"), "Prompt should include topic");
  assert(result.arguments.prompt.includes("https://source1.com"), "Prompt should include source_urls[0]");
  assert(result.arguments.prompt.includes("https://source2.com"), "Prompt should include source_urls[1]");
  assert(result.arguments.prompt.includes("methodology"), "Prompt should include comparison_criteria");
  assertEquals(result.arguments.urls, undefined, "urls argument to ask_gemini should be undefined");
  assertEquals(result.arguments.temperature, 0.2);
  assertEquals(result.arguments.max_tokens, 4096);
});

Deno.test("buildCompareSourcesPrompt - only required args", () => {
  const result = buildCompareSourcesPrompt({
    topic: "renewable energy",
    source_urls: ["https://energy.gov", "https://irena.org"],
  });
  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("renewable energy"));
  assert(result.arguments.prompt.includes("https://energy.gov"));
  assert(result.arguments.prompt.includes("https://irena.org"));
  assert(!result.arguments.prompt.includes("Specific Comparison Criteria"), "Prompt should not mention criteria if none provided");
});

Deno.test("buildFactCheckPrompt - generates valid tool call", () => {
  const result = buildFactCheckPrompt({
    claim: "The Earth is flat",
    context: "Social media post",
  });

  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("The Earth is flat"), "Prompt should include claim");
  assert(result.arguments.prompt.includes("Social media post"), "Prompt should include context");
  assertEquals(result.arguments.temperature, 0.1);
  assertEquals(result.arguments.max_tokens, 3072);
});

Deno.test("buildFactCheckPrompt - only claim (required)", () => {
  const result = buildFactCheckPrompt({
    claim: "Water boils at 90C at sea level",
  });
  assertEquals(result.tool, "ask_gemini");
  assert(result.arguments.prompt.includes("Water boils at 90C at sea level"));
  assert(!result.arguments.prompt.includes("Context"), "Prompt should not mention context if none provided");
});

Deno.test("Prompts handle missing optional arguments", () => {
  // This test is now covered by individual "only required args" tests for each prompt type.
  // For example, buildResearchAnalysisPrompt - with only topic
  // buildCurrentEventsPrompt - with only topic
  // etc.
  // If a prompt type had no optional arguments, its main test would cover this.
  // This specific combined test can be removed if individual prompt tests are comprehensive.
  assertEquals(true, true); // Placeholder if individual tests are preferred
});