# Federal AI Training Institute

A fictional demo of a closed-access training app: signed-in learners read a seeded curriculum, take graded quizzes, and chat with an assistant that answers from that curriculum. Administrators see a roster and illustrative engagement charts.

**This is a fictional demo platform with sample data. It is not affiliated with or endorsed by any government agency.**

The product name, agency framing, and lesson text are sample content for the demo. They are not a real training program.

## What it does

- **Landing and sign-in.** `/` is public. Sign-in goes through WorkOS AuthKit. `proxy.ts` requires a session for every other matched route. `/callback` completes the OAuth redirect and returns the user to `/dashboard`.
- **Learner roster.** The first time a signed-in user hits a protected page, the app upserts a Convex `users` row. The first user becomes `admin`. Later users become `learner`. There is no invitation list, SCIM sync, or per-module enrollment check in this repo.
- **Curriculum.** Published modules, lessons, and quizzes are seeded. A lesson is a video embed, a reading, or a link to an external document. Opening a lesson marks it in progress. "Mark as complete" persists per user.
- **Quizzes.** Questions are stored without the correct answer on the read query. Submitting grades the attempt in Convex, stores the score, and returns per-question feedback.
- **Assistant.** Learners can open a full-page assistant or a lesson chat. Threads and messages are stored in Convex. The model is instructed to answer only from retrieved lesson excerpts and to decline when nothing relevant was retrieved.
- **Admin.** `/admin` is limited to the `admin` role. Counts (learners, completions, quiz passes) come from Convex. The weekly and per-module charts are synthesized in `lib/admin/fake-metrics.ts` and labeled as demo metrics in the UI.

## Architecture

There is one Mastra agent and no Mastra tools or workflows. Retrieval, grading, and persistence live in Convex and in the Next.js route that calls the agent.

```
Browser (useChat)
  → POST /api/chat          WorkOS session required
    → Convex action retrieval.retrieveContext
        embed the question (Vercel AI Gateway /v1/embeddings)
        vectorSearch lessonChunks (optional moduleId filter)
    → buildGroundedSystemAddendum (lesson text, 6,000 character cap)
    → Mastra Agent trainingAssistant.stream
    → @mastra/ai-sdk stream back to the AI SDK UI
  → client writes the user and assistant text to Convex
```

| Piece | Where it lives | What it actually does |
|---|---|---|
| Agent | `lib/mastra/agents/training-assistant.ts` | One `Agent` with a system prompt. Model defaults to `vercel/openai/gpt-4.1-mini` via `MASTRA_AGENT_MODEL`. No tools, memory module, or workflow graph. |
| Grounding | `app/api/chat/route.ts`, `lib/mastra/build-grounded-prompt.ts`, `convex/retrieval.ts` | The route embeds and searches before the model runs, then appends excerpts to the system prompt. The agent does not call a retriever itself. |
| Chat UI | `components/assistant/` | AI SDK `useChat` with a custom transport that sends `moduleId`. |
| Curriculum API | `convex/modules.ts`, `lessons.ts`, `progress.ts`, `quizzes.ts` | Authenticated queries and mutations. Quiz answers stay on the server until submit. |
| Seed and index | `convex/_seedData.ts`, `seed.ts`, `bootstrap.ts` | `bootstrap:run` is an internal action: upsert seed content, chunk lesson bodies, embed them, replace `lessonChunks`. |
| Auth | `proxy.ts`, `convex/auth.config.ts`, `convex/lib/auth.ts` | AuthKit middleware on the Next.js app. Convex checks the WorkOS JWT (`RS256`, user-management issuer). Helpers resolve the Convex user by the token subject. |

Module scope is whatever `moduleId` the client sends. Omit it and retrieval searches every indexed lesson. Any provisioned user can read every published module.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui primitives, Recharts for the admin charts |
| Auth | WorkOS AuthKit (`@workos-inc/authkit-nextjs`) |
| Data | Convex queries, mutations, actions, and a 1536-dimension vector index |
| Agent | Mastra (`@mastra/core`) bridged with `@mastra/ai-sdk` |
| Model and embeddings | Vercel AI Gateway. Chat uses the Mastra `vercel/…` model string. Embeddings use the gateway's OpenAI-compatible `/v1/embeddings` endpoint. |
| Chat client | AI SDK UI (`@ai-sdk/react`) |

## Project layout

```
app/
  (protected)/          Session required. Dashboard, modules, quiz, assistant, admin
  api/chat/route.ts     Authenticated stream endpoint
  callback/route.ts     WorkOS AuthKit callback
  page.tsx              Public landing
components/             Shell, lesson player, quiz, assistant, admin charts
convex/                 Schema, auth, curriculum, retrieval, seed
lib/mastra/             Agent and grounding prompt
lib/admin/fake-metrics.ts
proxy.ts                AuthKit middleware (Next.js 16 proxy convention)
```

## Run locally

Requirements: Node.js, npm, a WorkOS AuthKit application, and (for modules and the assistant) a Convex account plus a Vercel AI Gateway key.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

### Auth only

Fill in the WorkOS variables in `.env.local` (see the table below). Leave `NEXT_PUBLIC_CONVEX_URL` empty. The landing page and sign-in work. Protected pages render a setup screen instead of the dashboard.

Register `http://localhost:3000/callback` as a WorkOS redirect URI. It must match `NEXT_PUBLIC_WORKOS_REDIRECT_URI`.

### Curriculum and assistant

1. Set `AI_GATEWAY_API_KEY` in `.env.local`.
2. Run `npm run convex:dev` (`npx convex dev`). Leave it running. The first run creates a deployment and writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.
3. Set the same WorkOS client id and gateway key inside Convex:

   ```bash
   npx convex env set WORKOS_CLIENT_ID "<same value as .env.local>"
   npx convex env set AI_GATEWAY_API_KEY "<same value as .env.local>"
   ```

4. Seed lessons and build the vector index: `npm run bootstrap` (`npx convex run bootstrap:run`).
5. Refresh the app and sign in. The first user is an admin.

`EMBEDDING_MODEL` and `MASTRA_AGENT_MODEL` are read from the environment. The Convex embedding action reads `EMBEDDING_MODEL` and `AI_GATEWAY_API_KEY` from the Convex deployment, not from Next.js.

## Environment variables

Copy `.env.example` to `.env.local`. The example file contains placeholders only. `.gitignore` ignores `.env*` and keeps `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `WORKOS_CLIENT_ID` | Yes, for sign-in | AuthKit client id. Also set on the Convex deployment so `convex/auth.config.ts` can validate JWTs. |
| `WORKOS_API_KEY` | Yes, for sign-in | AuthKit API key. |
| `WORKOS_COOKIE_PASSWORD` | Yes, for sign-in | Secret used to encrypt the session cookie. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Yes, for sign-in | Must match a redirect URI in the WorkOS dashboard. Local default: `http://localhost:3000/callback`. |
| `NEXT_PUBLIC_CONVEX_URL` | For curriculum and chat | Written by `npx convex dev`. |
| `AI_GATEWAY_API_KEY` | For chat and indexing | Vercel AI Gateway key. Set in `.env.local` and on the Convex deployment. |
| `MASTRA_AGENT_MODEL` | No | Gateway model id. Default `vercel/openai/gpt-4.1-mini`. |
| `EMBEDDING_MODEL` | No | Embeddings model. Default `openai/text-embedding-3-small`. Set this on the Convex deployment if you override it. |

## Manual check

- Signed out, `/` shows the landing page and sign-in starts WorkOS.
- After sign-in, `/dashboard` shows the user and the seeded modules.
- Opening a lesson marks it in progress. Marking it complete survives a reload.
- Submitting a quiz shows per-question feedback and a stored attempt.
- The assistant answers from lesson text and cites the module and lesson. A question with no matching excerpt gets the decline line from the system prompt.
- A second user can use the learner pages. Only the first user gets `/admin`.

## Scripts

| Script | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint | `npm run lint` |
| Convex dev | `npm run convex:dev` |
| Seed and index | `npm run bootstrap` |
