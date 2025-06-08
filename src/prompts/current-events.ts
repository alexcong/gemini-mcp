import { Prompt } from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Prompt definition for fetching current events information.
 * This prompt guides the AI to gather up-to-date news and developments
 * on a specified topic, optionally filtered by time period and region.
 * It utilizes the `ask_gemini` tool for execution.
 */
export const currentEventsPrompt: Prompt = {
  name: "current_events",
  description: "Get up-to-date information on recent developments and news",
  arguments: [
    {
      name: "topic",
      description: "The topic or event you want current information about",
      required: true,
    },
    {
      name: "time_period",
      description: "Time period to focus on (e.g., 'last week', 'past month', 'recent')",
      required: false,
    },
    {
      name: "region",
      description: "Geographic region for regional news (e.g., 'US', 'Europe', 'global')",
      required: false,
    },
  ],
};

/**
 * Builds the arguments for the `ask_gemini` tool based on the current events prompt inputs.
 *
 * @param args - An object containing the arguments for the current events prompt.
 * @param args.topic - The topic or event to get current information about.
 * @param [args.time_period] - Optional time period to focus on (e.g., "last week").
 * @param [args.region] - Optional geographic region (e.g., "US").
 * @returns An object specifying the tool to call (`ask_gemini`) and the arguments for it,
 *          including the constructed prompt, temperature, and max_tokens.
 */
export function buildCurrentEventsPrompt(args: Record<string, unknown>): {
  tool: string;
  arguments: Record<string, unknown>;
} {
  const { topic, time_period, region } = args;
  
  let prompt = `Provide current information and recent developments about: ${topic}`;
  
  if (time_period) {
    prompt += `\n\nTime focus: ${time_period}`;
  }
  
  if (region) {
    prompt += `\n\nRegional focus: ${region}`;
  }
  
  prompt += `

Please include:
1. Latest news and developments
2. Key events and milestones
3. Current status and situation
4. Impact and implications
5. What to watch for next

Prioritize the most recent and reliable information with proper source attribution.`;

  return {
    tool: "ask_gemini",
    arguments: {
      prompt,
      temperature: 0.2, // Very low temperature for news accuracy
      max_tokens: 3072,
    },
  };
}