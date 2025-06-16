# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a Deno-based MCP (Model Context Protocol) server that provides three
Google Gemini AI tools:

1. **ask_gemini** - Text generation using Gemini 2.5 Pro
2. **gemini_search** - Search with Google grounding using Gemini 2.5 Flash
3. **url_content** - URL content analysis using Gemini 2.5 Flash

## Development Commands

- **Run server in dev mode**: `deno task dev` (with watch mode)
- **Run server**: `deno task start`
- **Run tests**: `deno task test`
- **Run tests with watch**: `deno task test:watch`
- **Format code**: `deno fmt`
- **Lint code**: `deno lint`
- **Cache dependencies**: `deno cache src/server.ts`

## Environment Setup

**Required**: Set both `GEMINI_API_KEY` and `GEMINI_MODEL` environment variables before running:

```bash
export GEMINI_API_KEY=your_api_key_here
export GEMINI_MODEL=gemini-2.5-pro-preview-06-05
deno task dev
```

## Project Structure

```
src/
├── server.ts              # Main MCP server implementation
├── gemini-client.ts       # Google Gemini API client wrapper
└── tools/
    ├── ask-gemini.ts      # Text generation tool (Gemini 2.5 Pro)
    ├── gemini-search.ts   # Search with grounding (Gemini 2.5 Flash)
    └── url-content.ts     # URL analysis tool (Gemini 2.5 Flash)
tests/
├── server_test.ts         # Server integration tests
├── gemini_client_test.ts  # API client tests
└── tools/                 # Individual tool tests
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP TypeScript SDK
- `@google/generative-ai` - Google Gemini API client
- `zod` - Runtime type validation
- `@std/assert` - Deno testing assertions
- `@std/testing` - Deno testing utilities

## MCP Tools

### ask_gemini

- **Purpose**: High-quality text generation using Gemini 2.5 Pro
- **Parameters**: `prompt` (required), `temperature` (0-2), `max_tokens`
  (1-8192)

### gemini_search

- **Purpose**: Current information search using Google grounding
- **Parameters**: `query` (required), `region` (optional)
- **Returns**: Response with source links and search suggestions

### url_content

- **Purpose**: Analyze web page content (max 20 URLs)
- **Parameters**: `urls` (required array), `question` (required),
  `analysis_type` (optional)

## Testing

Tests use Deno's built-in testing framework with `@std/assert`. All tests
include input validation and error handling scenarios. Run `deno task test` to
execute all tests.
