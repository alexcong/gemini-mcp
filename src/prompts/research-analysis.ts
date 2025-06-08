import { Prompt } from "@modelcontextprotocol/sdk/types.js";

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