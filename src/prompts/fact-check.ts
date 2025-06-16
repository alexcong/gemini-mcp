import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const factCheckPrompt: Prompt = {
  name: "fact_check",
  description: "Verify claims and statements with current information and reliable sources",
  arguments: [
    {
      name: "claim",
      description: "The claim, statement, or information you want to fact-check",
      required: true,
    },
    {
      name: "context",
      description: "Additional context about where the claim came from or specific aspects to verify",
      required: false,
    },
  ],
};

export function buildFactCheckPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { claim, context } = args;
  
  let prompt = `Fact-check the following claim: "${claim}"`;
  
  if (context) {
    prompt += `\n\nContext: ${context}`;
  }
  
  prompt += `

Please provide:
1. Verification status (True/False/Partially True/Unclear)
2. Supporting evidence from reliable sources
3. Any contradictory evidence found
4. Important nuances or context needed
5. Source credibility assessment
6. Final assessment and confidence level

Use current, authoritative sources and be explicit about any limitations in the available evidence.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.1, // Lowest temperature for factual accuracy
      // No thinking_budget - let model decide for focused fact-checking
    },
  };
}