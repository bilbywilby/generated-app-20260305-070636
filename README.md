# AI Chat Assistant

A production-ready, full-stack AI chat application powered by Cloudflare Workers and Agents. Features multi-session conversations, streaming responses, tool calling (weather, web search, and extensible MCP tools), and model switching with Gemini models via Cloudflare AI Gateway.

[![Deploy to Cloudflare][cloudflarebutton]]

## ✨ Features

- **Persistent Chat Sessions**: Unlimited sessions with titles, timestamps, and activity tracking using Durable Objects.
- **Streaming Responses**: Real-time message streaming for natural chat experience.
- **Tool Integration**: Built-in tools for weather, web search (SerpAPI), and Model Context Protocol (MCP) extensibility.
- **Model Switching**: Support for Gemini 2.5 Flash/Pro/2.0 Flash (via CF AI Gateway).
- **Responsive UI**: Modern React frontend with shadcn/ui, Tailwind CSS, and dark mode.
- **Session Management**: Create, list, update, delete sessions via API.
- **Type-Safe**: Full TypeScript with Workers types and strict typing.
- **Production-Ready**: Error handling, CORS, logging, health checks, and client error reporting.

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query + React Router
- Framer Motion + Lucide Icons
- Vite + Bun

### Backend
- Cloudflare Workers + Durable Objects
- Cloudflare Agents SDK
- Hono (routing)
- OpenAI SDK (CF AI Gateway compatible)
- SerpAPI + MCP SDK

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed
- Cloudflare account and [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/)
- Cloudflare AI Gateway setup (for `@vars.CF_AI_BASE_URL` and `@vars.CF_AI_API_KEY`)
- Optional: SerpAPI key for web search (`@vars.SERPAPI_KEY`)

### Installation
```bash
bun install
```

### Configuration
Copy `wrangler.jsonc.example` to `wrangler.jsonc` and update:
```json
{
  "vars": {
    "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
    "CF_AI_API_KEY": "{your-api-token}",
    "SERPAPI_KEY": "{optional-serpapi-key}"
  }
}
```
Run `bun run cf-typegen` to generate types.

### Development
```bash
# Start dev server (Workers + Vite)
bun dev

# Open http://localhost:3000 (or $PORT)
```

Hot reload works for both frontend and worker. UI at `/`, API at `/api/*`.

## 📚 Usage

### Chat Sessions
- **Create**: `POST /api/sessions` `{ "title": "My Chat", "firstMessage": "Hello" }`
- **List**: `GET /api/sessions`
- **Delete**: `DELETE /api/sessions/:id`
- **Chat**: `POST /api/chat/:sessionId/chat` `{ "message": "Hi" }` (supports `stream: true`)

### Frontend
Replace `src/pages/HomePage.tsx` with your UI. Use `chatService` from `@/lib/chat` for API integration:
```tsx
import { chatService } from '@/lib/chat';

await chatService.sendMessage('Hello', undefined, (chunk) => {
  console.log(chunk); // Stream handler
});
```

### Custom Tools
Extend `worker/tools.ts`:
```ts
// Add to customTools array
{
  type: 'function',
  function: {
    name: 'my_tool',
    description: 'My tool',
    parameters: { /* schema */ }
  }
}
```
Implement in `executeTool()`.

### MCP Tools
Add servers to `worker/mcp-client.ts`:
```ts
const MCP_SERVERS = [
  { name: 'my-server', sseUrl: 'https://example.com/sse' }
];
```

## ☁️ Deployment

Deploy to Cloudflare Workers/Pages:

```bash
bun run build  # Build assets
wrangler deploy  # Deploy worker + assets
```

Or use the one-click deploy:

[cloudflarebutton]

**Post-Deploy**:
1. Bind custom domain or use `*.workers.dev`.
2. Configure `@vars` in Wrangler dashboard (AI keys).
3. Assets served from `/` (SPA mode).

## 🔧 Development Scripts
```bash
bun dev          # Local dev
bun lint         # Lint
bun run build    # Production build
bun run preview  # Preview build
wrangler dev     # Wrangler tunnel dev
wrangler deploy  # Deploy
```

## 🤝 Contributing
1. Fork and clone.
2. `bun install`.
3. `bun dev`.
4. Add features in `src/` (UI) or `worker/userRoutes.ts` (API).
5. Test thoroughly.
6. PR with clear description.

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- Report issues on GitHub.

Built with ❤️ for the Cloudflare ecosystem.