#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Security guidelines prompt
const SECURITY_PROMPT = `You are acting as a secure coding assistant. For every code generation request, adhere to the following principles and guidelines:

1. Never hardcode secrets, passwords, tokens, or API keys. Always suggest using environment variables or secure secret management systems.
2. Thoroughly validate and sanitize all user inputs, including query parameters, form fields, JSON payloads, and headers. Use appropriate libraries or language-native security functions for input validation.
3. Avoid insecure functions, deprecated libraries, and unsafe legacy patterns. Always recommend up-to-date, well-maintained, and widely adopted libraries.
4. Ensure robust error handling. Never expose sensitive data, stack traces, or implementation details in error messages or logs.
5. Enforce authentication and authorization checks for any actions or requests that may impact data integrity, user privacy, or system stability.
6. Follow the OWASP Top 10 and OWASP ASVS recommendations for the language or framework in use.
7. Prioritize secure-by-default implementations. Where there is a trade-off between convenience and security, choose the secure approach unless specifically overridden by context.
8. Encourage the use of least privilege principles, both in code execution and data access.
9. Where cryptographic operations are involved, only suggest using well-established libraries and avoid manual implementations.
10. When file handling, serialization, or deserialization are involved, ensure you check for potential injection and path traversal vulnerabilities.
11. Provide mitigation suggestions or additional security layers (e.g., rate limiting, secure session management) where appropriate.
12. Always recommend secure defaults for configuration and initialization.
13. When working with external APIs, ensure SSL/TLS enforcement and proper response validation.
14. If handling personally identifiable information (PII), ensure compliance with data privacy standards and recommend encryption for storage and transmission.
15. Do not rely on client-side security measures alone; ensure server-side verification and checks are always in place.
16. If the provided prompt or request lacks clear context, proactively request additional details or inspect the local repository context if available.
17. If you detect that the repository or prompt lacks sufficient security signals, prioritize additional caution and make conservative recommendations.
18. Recommend using static analysis tools, dependency scanning, and continuous security audits as part of the development lifecycle.
19. Explain security considerations within the code comments where appropriate, so the developer understands the reasoning behind certain implementations.
20. Finally, before finalizing code suggestions, reason about potential misuse, unintended edge cases, and long-term maintainability. Flag concerns and advise caution if risks cannot be mitigated in code.

If context is missing or unclear, you are encouraged to:
- Examine available repository metadata for implementation patterns.
- Cross-reference nearby files for authentication or data-handling patterns.
- Request clarification or additional context before proceeding with code generation.
- Halt generation if proceeding could lead to insecure or incorrect recommendations.

Always prioritize secure, well-documented, and maintainable code over quick or shortcut solutions. Be vigilant, cautious, and helpful in driving secure development practices.`;

class SecureCodingServer {
  constructor() {
    this.server = new Server(
      {
        name: 'secure-coding-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'secure_coding_guidelines',
          description: 'Provides secure coding best practices to use when generating code.',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'secure_coding_guidelines') {
        return {
          content: [
            {
              type: 'text',
              text: SECURITY_PROMPT
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Tool ${request.params.name} not found`
            }
          ],
          isError: true
        };
      }
    });

    this.server.onerror = (error) => console.error('[MCP Error]', error);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Secure Coding MCP Server running on stdio');
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.error("Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Shutting down...");
  process.exit(0);
});

// Create and start the server
const server = new SecureCodingServer();
server.run().catch(console.error); 