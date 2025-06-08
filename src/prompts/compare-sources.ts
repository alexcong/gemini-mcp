import { Prompt } from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Prompt definition for comparing information across multiple sources.
 * This prompt guides the AI to analyze and compare content from specified URLs
 * on a given topic, optionally focusing on specific comparison criteria.
 * It utilizes the `ask_gemini` tool for execution.
 */
export const compareSourcesPrompt: Prompt = {
  name: "compare_sources",
  description: "Compare information across multiple sources and provide analysis",
  arguments: [
    {
      name: "topic",
      description: "The topic or subject you want to compare across sources",
      required: true,
    },
    {
      name: "source_urls",
      description: "URLs to different sources you want to compare",
      required: true,
    },
    {
      name: "comparison_criteria",
      description: "Specific aspects to compare (e.g., 'methodology', 'conclusions', 'data quality')",
      required: false,
    },
  ],
};

/**
 * Builds the arguments for the `ask_gemini` tool based on the compare sources prompt inputs.
 *
 * @param args - An object containing the arguments for the compare sources prompt.
 * @param args.topic - The topic or subject to compare across sources.
 * @param args.source_urls - Array of URLs to the different sources for comparison.
 * @param [args.comparison_criteria] - Optional specific aspects to compare (e.g., "methodology").
 * @returns An object specifying the tool to call (`ask_gemini`) and the arguments for it,
 *          including the constructed prompt, temperature, and max_tokens.
 * @throws {Error} If `source_urls` is not provided.
 */
export function buildCompareSourcesPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { topic, source_urls, comparison_criteria } = args;
  
  if (!source_urls) {
    // This check is good, but MCP arguments are typically validated by the framework
    // based on the `required: true` in the prompt definition.
    throw new Error("source_urls is required");
  }
  
  const urlArray = Array.isArray(source_urls) ? source_urls : [source_urls];
  
  let prompt = `Compare information about "${topic}" across these sources:`;
  
  urlArray.forEach((url, index) => {
    prompt += `\n${index + 1}. ${url}`;
  });
  
  if (comparison_criteria) {
    prompt += `\n\nComparison criteria: ${comparison_criteria}`;
  }
  
  prompt += `

Please provide:
1. Summary of each source's perspective
2. Key similarities between sources
3. Important differences and contradictions
4. Analysis of source credibility and methodology
5. Synthesis and overall conclusions
6. Areas where more research may be needed

Structure your response with clear sections for each source and comparative analysis.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.2, // Low temperature for objective comparison
      max_tokens: 4096,
    },
  };
}