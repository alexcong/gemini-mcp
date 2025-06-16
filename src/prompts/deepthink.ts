import type { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const deepthinkPrompt: Prompt = {
  name: "deepthink",
  description: "Deep reasoning and analysis for complex problems requiring maximum thinking capacity",
  arguments: [
    {
      name: "problem",
      description: "The complex problem, question, or scenario you want deep analysis on",
      required: true,
    },
    {
      name: "context",
      description: "Additional context, constraints, or background information relevant to the problem",
      required: false,
    },
    {
      name: "approach",
      description: "Specific analytical approach or methodology to use (e.g., 'step-by-step', 'pros-cons', 'multiple-perspectives')",
      required: false,
    },
  ],
};

export function buildDeepthinkPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { problem, context, approach } = args;
  
  let prompt = `Please engage in deep, thorough reasoning about the following complex problem: ${problem}`;
  
  if (context) {
    prompt += `\n\nContext and constraints: ${context}`;
  }
  
  if (approach) {
    prompt += `\n\nAnalytical approach: ${approach}`;
  }
  
  prompt += `

Take your time to think deeply about this problem. Consider:
1. Multiple perspectives and viewpoints
2. Underlying assumptions and their validity
3. Potential solutions and their trade-offs
4. Edge cases and complications
5. Long-term implications and consequences
6. Alternative interpretations or framings
7. Supporting evidence and counterarguments
8. Practical implementation challenges

Provide a comprehensive analysis that demonstrates deep reasoning and thorough consideration of all relevant factors.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.7, // Balanced temperature for reasoning with some creativity
      thinking_budget: 32768, // Maximum thinking budget for deep analysis
    },
  };
}