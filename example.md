# Gemini MCP Server Usage Example

## Starting the Server

1. Set your Gemini API key:

```bash
export GEMINI_API_KEY=your_api_key_here
```

2. Start the server:

```bash
deno task start
```

## MCP Tool

### ask_gemini

The unified AI assistant that combines Google Search, URL analysis, and Gemini 2.5 Pro capabilities.

```json
{
  "name": "ask_gemini",
  "arguments": {
    "prompt": "What are the latest breakthroughs in quantum computing? Please also analyze this research paper.",
    "urls": ["https://arxiv.org/abs/2301.01234"],
    "temperature": 0.6,
    "max_tokens": 4000
  }
}
```

**Key Benefits:**
- 🔍 Automatically searches for current information
- 📄 Analyzes provided URLs for context
- 🧠 Uses Gemini 2.5 Pro for high-quality responses
- 📚 Provides comprehensive, well-sourced answers

## MCP Prompts (Claude Desktop)

### /research_analysis
Perfect for academic research and comprehensive analysis:

```bash
/research_analysis topic:"quantum computing applications" urls:"https://arxiv.org/abs/2301.01234" focus_areas:"recent developments"
```

### /current_events
Get the latest news and developments:

```bash
/current_events topic:"AI regulation" time_period:"past month" region:"US"
```

### /technical_documentation
Analyze technical docs and specifications:

```bash
/technical_documentation documentation_urls:"https://datatracker.ietf.org/doc/html/rfc6749" question:"How to implement OAuth 2.0?" complexity_level:"intermediate"
```

### /compare_sources
Compare information across multiple sources:

```bash
/compare_sources topic:"climate change" source_urls:"https://ipcc.ch,https://noaa.gov" comparison_criteria:"methodology"
```

### /fact_check
Verify claims with reliable sources:

```bash
/fact_check claim:"Vaccines cause autism" context:"Social media post"
```

## Common Use Cases

### Research & Analysis
Use the research_analysis prompt for comprehensive investigations:
- Academic research papers
- Market analysis reports
- Technology trend analysis
- Scientific breakthroughs

### Current Events & News
Use current_events for up-to-date information:
- Breaking news analysis
- Recent developments in specific fields
- Current status of ongoing situations
- Regional news and updates

### Technical Documentation
Use technical_documentation for:
- API documentation analysis
- RFC and specification reviews
- Code implementation guides
- Technical troubleshooting

### Source Comparison
Use compare_sources for:
- Research validation
- Bias analysis
- Methodology comparison
- Conflicting information resolution

### Fact Checking
Use fact_check for:
- Social media claims
- News article verification
- Scientific claim validation
- Urban legend debunking

## Integration

This MCP server can be integrated with any MCP-compatible client. The server
communicates via stdio transport and follows the Model Context Protocol
specification.
