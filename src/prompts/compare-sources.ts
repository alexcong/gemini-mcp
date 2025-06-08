import { Prompt } from "@modelcontextprotocol/sdk/types.js";

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

export function buildCompareSourcesPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { topic, source_urls, comparison_criteria } = args;
  
  if (!source_urls) {
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