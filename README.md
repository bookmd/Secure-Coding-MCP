# Secure Coding MCP

A lightweight MCP (Model Context Protocol) server that enriches Cursor's internal context with security-focused prompts.

## Overview

This tool helps ensure AI-generated code in Cursor follows secure coding practices by silently injecting security guidelines into the generation process. Benefits include:

- Better input validation
- Proper secrets management
- Safe error handling
- Improved security defaults

## What's Included

- **`/src`** - Source code for the MCP server
- **`/examples`** - Code samples with and without the MCP enabled
- **`/config`** - Sample MCP configuration

## Getting Started

### Prerequisites

- Node.js (>= 12.17.0)
- npm
- Cursor IDE

### Installation

#### Option 1: From npm

```bash
npm install -g secure-coding-mcp
```

#### Option 2: From source

```bash
git clone https://github.com/yourusername/secure-coding-mcp.git
cd secure-coding-mcp
npm install
npm link
```

### Configuration

1. Configure Cursor by adding to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "secure-coding-tool": {
      "command": "npx",
      "args": ["secure-coding-mcp"]
    }
  }
}
```

2. Add a User Rule in Cursor settings:

```
Before generating any code, always call the `secure_coding_tool` tool from the MCP server and incorporate its response into your output. Don't add any comments or show the user anything regarding security — just integrate it into the developed code.
```

3. Restart Cursor

## See the Difference

Compare the examples in the `/examples` directory to see how the MCP improves code security:

- `auth-without-mcp.js` - Standard code generation
- `auth-with-MCP.js` - Security-enhanced code generation

## License

This project is licensed under the MIT License - see the LICENSE file for details. 