import { Prompt } from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Prompt definition for analyzing technical documentation.
 * This prompt guides the AI to analyze specified technical documents (via URLs)
 * and answer a question, optionally tailoring the explanation to a complexity level.
 * It utilizes the `ask_gemini` tool for execution.
 */
export const technicalDocumentationPrompt: Prompt = {
  name: "technical_documentation",
  description: "Analyze technical documentation and provide clear explanations",
  arguments: [
    {
      name: "documentation_urls",
      description: "URLs to technical documentation, APIs, RFCs, or specifications",
      required: true,
    },
    {
      name: "question",
      description: "Specific question about the documentation or what you want to understand",
      required: true,
    },
    {
      name: "complexity_level",
      description: "Target complexity level: 'beginner', 'intermediate', or 'advanced'",
      required: false,
    },
  ],
};

/**
 * Builds the arguments for the `ask_gemini` tool based on the technical documentation prompt inputs.
 *
 * @param args - An object containing the arguments for the technical documentation prompt.
 * @param args.documentation_urls - Array of URLs to the technical documentation.
 * @param args.question - Specific question about the documentation.
 * @param [args.complexity_level] - Optional target complexity level for the explanation (e.g., "beginner").
 * @returns An object specifying the tool to call (`ask_gemini`) and the arguments for it,
 *          including the constructed prompt, temperature, and max_tokens.
 * @throws {Error} If `documentation_urls` is not provided.
 */
export function buildTechnicalDocumentationPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { documentation_urls, question, complexity_level } = args;
  
  if (!documentation_urls) {
    // This check is good, but MCP arguments are typically validated by the framework
    // based on the `required: true` in the prompt definition.
    // However, belt-and-suspenders is fine.
    throw new Error("documentation_urls is required");
  }
  
  const urlArray = Array.isArray(documentation_urls) ? documentation_urls : [documentation_urls];
  
  let prompt = `Analyze the technical documentation at these URLs and answer: ${question}`;
  
  prompt += `\n\nDocumentation sources:`;
  urlArray.forEach((url, index) => {
    prompt += `\n${index + 1}. ${url}`;
  });
  
  if (complexity_level) {
    prompt += `\n\nTarget audience: ${complexity_level} level`;
  }
  
  prompt += `

Please provide:
1. Clear explanation of the relevant concepts
2. Key implementation details
3. Best practices and recommendations
4. Common pitfalls to avoid
5. Practical examples where applicable

Structure your response for clarity and include code examples if relevant.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.1, // Very low for technical accuracy
      max_tokens: 4096,
    },
  };
}