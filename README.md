# Gemini MCP Server

A Model Context Protocol (MCP) server that provides Google Gemini AI
capabilities as tools. Built with Deno and TypeScript.

## Features

- **ask_gemini**: Unified AI assistant powered by Gemini 3 Pro with built-in
  Google Search and URL analysis capabilities

## Prerequisites

- [Deno](https://deno.land/) (v1.40+)
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## Installation

### Option 1: Use JSR Package (Recommended)

The easiest way is to use the published JSR package directly in your Claude
Desktop configuration:

```bash
# No installation needed! Use jsr:@cong/gemini-mcp directly in your Claude config
```

### Option 2: From Source

1. Clone this repository:

```bash
git clone <repository-url>
cd gemini-mcp
```

2. Set your environment variables:

```bash
export GEMINI_API_KEY=your_api_key_here
export GEMINI_MODEL=gemini-3-pro-preview
```

## Usage

### Start the Server

```bash
# Set your environment variables first
export GEMINI_API_KEY=your_api_key_here
export GEMINI_MODEL=gemini-3-pro-preview

# Development mode (with watch)
deno task dev

# Production mode
deno task start
```

### Testing with MCP Inspector

To test the server with the MCP Inspector, make sure your environment variables
are set:

```bash
# Set environment variables in your shell
export GEMINI_API_KEY=your_api_key_here
export GEMINI_MODEL=gemini-3-pro-preview

# Install MCP Inspector if you haven't already
npm install -g @modelcontextprotocol/inspector

# Run the inspector
npx @modelcontextprotocol/inspector src/server.ts
```

**Important**: The environment variables must be set in the same shell where you
run the MCP Inspector.

### Run Tests

```bash
# Run all tests
deno task test

# Run tests with watch mode
deno task test:watch
```

### Code Quality

```bash
# Format code
deno fmt

# Lint code
deno lint
```

## MCP Tool

### ask_gemini

The unified AI assistant powered by Gemini 3 Pro with built-in Google Search and
URL analysis capabilities.

**Parameters:**

- `prompt` (required): Your question or request. Include URLs directly in the
  text for analysis.

**Example:**

```json
{
  "name": "ask_gemini",
  "arguments": {
    "prompt": "What are the latest developments in quantum computing? Please analyze this paper: https://arxiv.org/abs/2301.01234"
  }
}
```

**Capabilities:**

- 🔍 Automatically searches the web for current information
- 📄 Analyzes URLs mentioned in your prompt text
- 🧠 Uses Gemini 3 Pro with thinking capabilities, urlContext and googleSearch
  tools
- 📚 Provides comprehensive, well-sourced answers with enhanced reasoning

## Dependencies

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) -
  MCP TypeScript SDK
- [@google/generative-ai](https://github.com/google/generative-ai-js) - Google
  Gemini API client
- [zod](https://github.com/colinhacks/zod) - Runtime type validation
- [@std/assert](https://jsr.io/@std/assert) - Deno standard library assertions

## Development

This project uses Deno with TypeScript. Key development commands:

- `deno task dev` - Start development server with watch mode
- `deno task test` - Run test suite
- `deno cache src/server.ts` - Cache dependencies
- `deno fmt` - Format code
- `deno lint` - Lint code

## Troubleshooting

### Environment Variable Issues

If you get environment variable errors:

1. **Verify your environment variables are set**:
   ```bash
   echo $GEMINI_API_KEY
   echo $GEMINI_MODEL
   ```

2. **For MCP Inspector testing**, ensure both variables are set in the same
   terminal:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   export GEMINI_MODEL=gemini-3-pro-preview
   npx @modelcontextprotocol/inspector src/server.ts
   ```

3. **Check the server logs**: When the server starts, it will show
   `(API Key: configured)` to confirm your key is loaded.

## Support

- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Deno Documentation](https://docs.deno.com/)

## Claude Desktop Configuration

To use this MCP server with Claude Desktop, add it to your Claude configuration:

### macOS/Linux/Windows

Edit your Claude configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-env",
        "jsr:@cong/gemini-mcp"
      ],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here",
        "GEMINI_MODEL": "gemini-3-pro-preview"
      }
    }
  }
}
```

### Local Development

If you're running from source code:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-env",
        "src/server.ts"
      ],
      "env": {
        "GEMINI_API_KEY": "your_api_key_here",
        "GEMINI_MODEL": "gemini-3-pro-preview"
      }
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `deno task test`
5. Format code: `deno fmt`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
