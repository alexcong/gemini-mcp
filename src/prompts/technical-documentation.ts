import { Prompt } from "@modelcontextprotocol/sdk/types.js";

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

export function buildTechnicalDocumentationPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { documentation_urls, question, complexity_level } = args;
  
  if (!documentation_urls) {
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