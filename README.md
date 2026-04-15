# Course Chatbot MVP (Next.js + Cloudflare D1 + OpenAI)

Test commit from Codex

A production-oriented MVP for a **subject-scoped university course chatbot** with:
- Student chat UI
- Admin management for subjects and files
- OpenAI Responses API + file_search grounding
- Cloudflare D1 (built-in database)

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env
   ```
3. Create D1 database + binding in Cloudflare (`DB`).
4. Apply schema:
   ```bash
   wrangler d1 execute <YOUR_DB_NAME> --file=./d1/schema.sql
   ```
5. Seed example subjects:
   ```bash
   wrangler d1 execute <YOUR_DB_NAME> --file=./d1/seed.sql
   ```
6. Start app:
   ```bash
   npm run dev
   ```

## Required environment variables

Preferred names:
- `SESSION_SECRET`
- `APP_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional default `gpt-4.1-mini`)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Backward-compatible aliases (accepted):
- `NEXTAUTH_SECRET` (alias of `SESSION_SECRET`)
- `NEXTAUTH_URL` (alias of `APP_URL`)

## How subject isolation works

- Every `Subject` row stores its own `vector_store_id`.
- Student and admin test chat endpoints always require a `subjectId`.
- The selected subject resolves to exactly one vector store.
- OpenAI `file_search` is invoked with only that vector store.
- If no ready files exist for the selected subject, the API returns a clear error.

This design prevents retrieval from other subjects and keeps answers constrained to selected subject materials.

## How admin uploads work

- Admin uploads a file from the subject detail page.
- Server stores a `subject_files` record with `UPLOADING` status.
- Server uploads to OpenAI Files API and attaches the file to the subject vector store.
- Server polls vector store indexing until `READY`/`FAILED`.
- Final status is persisted and shown in the admin UI.
- Removing files marks them inactive/archived in D1 records.

## Known MVP limitations

- OpenAI file deletion is not automatic when a file is archived in D1.
- Student authentication is not implemented yet.
- Admin auth is env-credential based for MVP simplicity.
- Tests currently cover schema validation and should be expanded to route-level tests.
