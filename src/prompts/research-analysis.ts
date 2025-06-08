import { Prompt } from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Prompt definition for comprehensive research analysis.
 * This prompt guides the AI to conduct in-depth research on a given topic,
 * optionally focusing on specific areas and analyzing provided URLs.
 * It utilizes the `ask_gemini` tool for execution.
 */
export const researchAnalysisPrompt: Prompt = {
  name: "research_analysis",
  description: "Research a topic comprehensively with automatic web search and URL analysis",
  arguments: [
    {
      name: "topic",
      description: "The research topic or question you want to investigate",
      required: true,
    },
    {
      name: "urls",
      description: "Optional URLs to specific papers, articles, or resources to include in the analysis",
      required: false,
    },
    {
      name: "focus_areas",
      description: "Specific aspects to focus on (e.g., 'recent developments', 'technical details', 'practical applications')",
      required: false,
    },
  ],
};

/**
 * Builds the arguments for the `ask_gemini` tool based on the research analysis prompt inputs.
 *
 * @param args - An object containing the arguments for the research analysis prompt.
 * @param args.topic - The main research topic or question.
 * @param [args.urls] - Optional array of URLs to include in the analysis.
 * @param [args.focus_areas] - Optional specific aspects to focus on.
 * @returns An object specifying the tool to call (`ask_gemini`) and the arguments for it,
 *          including the constructed prompt, temperature, and max_tokens.
 */
export function buildResearchAnalysisPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { topic, urls, focus_areas } = args;
  
  let prompt = `Conduct a comprehensive research analysis on: ${topic}`;
  
  if (focus_areas) {
    prompt += `\n\nFocus areas: ${focus_areas}`;
  }

  if (urls) {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    prompt += `\n\nPlease also analyze these specific sources:`;
    urlArray.forEach((url, index) => {
      prompt += `\n${index + 1}. ${url}`;
    });
  }
  
  prompt += `

Please provide:
1. Current state of the field/topic
2. Recent developments and breakthroughs
3. Key challenges and opportunities
4. Future outlook and trends
5. Practical implications

Structure your response with clear sections and cite all sources.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.3, // Lower temperature for factual research
      max_tokens: 4096,
    },
  };
}