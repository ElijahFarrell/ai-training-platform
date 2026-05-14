# Federal AI Training Institute · Demo platform

Closed-access AI training for federal employees. Watch reviewed video modules, read reference material, take quizzes, and ask a module-grounded AI assistant — all behind invitation-only WorkOS AuthKit login.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | Next.js 16 App Router (TypeScript) | Server Components for auth/data, route handlers for AI streaming. |
| Styling | Tailwind CSS v4 + shadcn/ui primitives | Single design token system tuned for an institutional, high-trust visual language. |
| Auth | WorkOS AuthKit (Next.js SDK) | Enterprise-ready sign-in, application-wide invitations, agency SSO when needed. |
| Database & API | Convex (queries, mutations, actions, vector search) | One backend for system-of-record state, real-time UI, and grounded retrieval. |
| Vector store | Convex native `vectorSearch` | Already in the stack; sufficient for seeded modules. Production path swaps in Qdrant via `@mastra/qdrant`. |
| AI agent | Mastra (`@mastra/core`) + `@mastra/ai-sdk` bridge | Provider-agnostic agent layer with retrieval grounding. |
| LLM + embeddings | Vercel AI Gateway | One key, every model. Routed via Mastra's `vercel/…` model prefix and the Gateway's OpenAI-compatible embeddings endpoint. |
| Chat UI | AI SDK UI (`@ai-sdk/react`) | `useChat` for streaming, with custom transport that forwards module scope. |

## Project layout

```
app/
  (protected)/                Authenticated learner & admin shell
    dashboard/                Progress, catalogue, next action
    modules/[moduleSlug]/     Lesson player + quiz route
    assistant/                Module-grounded chat
    admin/                    Roster + activity (admin role only)
  api/chat/route.ts           AI SDK stream endpoint backed by Mastra
  callback/route.ts           WorkOS AuthKit OAuth callback
  layout.tsx                  Fonts + Convex/AuthKit providers
  page.tsx                    Public landing
components/
  ui/                         shadcn primitives (button, card, dialog, …)
  layout/                     App shell, sign-out, user bootstrap
  modules/                    Module sidebar & lesson viewer
  quiz/                       Quiz form with grading feedback
  assistant/                  Assistant workspace, thread list, chat
  landing/                    Public sign-in trigger
  providers/                  ConvexProviderWithAuth + AuthKitProvider
convex/
  schema.ts                   Tables, indexes, vectorIndex
  auth.config.ts              WorkOS JWT validators
  lib/auth.ts                 getCurrentUser / requireAdmin helpers
  users.ts                    Identity upsert, me, listAll
  modules.ts | lessons.ts     Curriculum reads
  progress.ts                 Lesson progress mutations & queries
  quizzes.ts                  Quiz + attempt grading
  assistantThreads.ts         Thread/message persistence
  retrieval.ts                Embedding + vectorSearch action + indexer
  seed.ts                     Curriculum upsert + chunk replacement
  bootstrap.ts                One-shot seed + reindex orchestrator
  _seedData.ts                Seeded modules, lessons, quizzes (not exposed as a public function)
lib/
  utils.ts                    cn() helper
  mastra/                     Agent + grounding helpers
proxy.ts                      Next.js 16 middleware (AuthKit)
```

## Local setup

### Minimal: landing + auth only (no Convex required)

You can boot the platform and exercise the auth flow before standing up Convex. Modules, quizzes, and the assistant require Convex; everything else works.

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in **only** the WorkOS variables:
   - `WORKOS_CLIENT_ID`, `WORKOS_API_KEY` from the WorkOS dashboard.
   - `WORKOS_COOKIE_PASSWORD` — generate with `openssl rand -base64 32`.
   - `NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback` (must match a Redirect URI registered in WorkOS).
3. `npm run dev` → visit http://localhost:3000.

Landing page loads. Sign-in goes through WorkOS. After auth, you'll see a "Convex not configured" screen with the next four commands to run.

### Full demo: add Convex + the AI assistant

4. Get a Vercel AI Gateway key at https://vercel.com/dashboard → AI → Gateway and put it in `.env.local`:

   ```env
   AI_GATEWAY_API_KEY="..."
   ```

5. Provision Convex.

   ```bash
   npx convex dev
   ```

   First run creates the deployment, writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`, and starts a watch loop. Leave it running.

6. Set Convex deployment secrets (these live inside Convex, not Next.js).

   ```bash
   npx convex env set WORKOS_CLIENT_ID "<same value as Next.js>"
   npx convex env set AI_GATEWAY_API_KEY "<same value as Next.js>"
   ```

7. Seed the curriculum and build the vector index.

   ```bash
   npx convex run bootstrap:run
   ```

   Upserts the seeded modules, lessons, quizzes, then chunks every lesson, hits the AI Gateway's `/v1/embeddings` endpoint, and writes `lessonChunks`.

8. Refresh the app. The first user to sign in is auto-promoted to `admin`; subsequent users join as `learner`.

## Acceptance check (manual)

- [ ] Visit `/` while logged out → see landing, sign-in routes to WorkOS AuthKit.
- [ ] Complete invitation flow → land on `/dashboard` with your name in the sidebar.
- [ ] Open a module → lesson auto-marks "in progress", "Mark as complete" persists across reload.
- [ ] Take the quiz → grading shows per-question feedback, attempts persist in Convex.
- [ ] Open the assistant → ask a curriculum question, get an answer that quotes the module text.
- [ ] Ask the assistant something off-curriculum → it declines instead of hallucinating.
- [ ] Sign in as a second user → only the first user sees `/admin`.

## Production path

See `~/.cursor/plans/ai_training_platform_8fe08549.plan.md` for the full delta from this demo to a production-grade build (agency SSO/SCIM, content management, ingestion pipeline, vector store migration to Qdrant, compliance foundations, evals).
