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

## Main-only release process (automated)

If you prefer shipping directly to `main`:

1. Merge PRs into `main` (or commit directly to `main` if you accept the risk).
2. GitHub Actions runs CI (`typecheck`, `test`) on `main` and PRs.
3. Cloudflare Pages auto-deploys from the latest `main` commit.

This keeps the flow simple while still adding a quality gate before or during release.

### Dependency stability note

`next`, `react`, `react-dom`, and `@cloudflare/next-on-pages` are pinned to known-compatible versions in `package.json` to reduce peer-dependency breakages during automated installs.

### Why you see Preview deployments in Cloudflare

- Branches like `codex/...` are preview branches.
- **Only `main` deploys to Production** for this project.
- A preview deployment becomes production only after its commit lands in `main`.

### Optional fast automation (enabled in this repo)

- Workflow: `.github/workflows/auto-merge-codex.yml`
- Behaviour: automatically enables GitHub auto-merge for PRs from `codex/*` into `main` (non-draft).
- Result: when CI checks pass, GitHub merges automatically and Cloudflare deploys production from `main`.

#### Auto-merge checklist

If PRs remain in Preview and do not promote to Production, confirm:
- Repository is public **or** has a plan that supports auto-merge.
- GitHub repository setting **Allow auto-merge** is enabled.
- PR is not draft and targets `main`.
- CI check (`CI / validate`) is green.

## Troubleshooting: "my commits are not showing on GitHub"

If local commits are not appearing on GitHub, it is usually one of these:

1. No git remote configured.
2. Branch has no upstream.
3. No GitHub authentication in the local environment.

Run this quick check:

```bash
git remote -v
git branch -vv
git status -sb
```

If needed, set remote + upstream:

```bash
git remote add origin https://github.com/Wayweroll/Nicschatbot.git
git fetch origin --prune
git push -u origin <your-branch>
```

If push fails with a username/password prompt error, authenticate first:

```bash
gh auth login
```

or use a Personal Access Token (PAT) and then push again.

You can also use the helper script in this repo:

```bash
npm run push:branch
```

It validates that:
- `origin` exists
- your working tree is clean
- your current branch exists locally

Then it runs `git push -u origin <current-branch>`.

### Repeatable non-interactive push runbook (without saving token in git config)

When you need to force reliability from a fresh machine/session:

1. Checkout the branch to publish (for example `sync-to-main`).
2. Export a PAT for this shell session only:
   ```bash
   export GITHUB_PAT='<paste-token-here>'
   ```
3. Push with the helper:
   ```bash
   npm run push:branch -- sync-to-main origin
   ```
4. Unset the token:
   ```bash
   unset GITHUB_PAT
   ```

The helper supports `GITHUB_PAT` and uses token-authenticated HTTPS push without persisting credentials.
Do **not** commit tokens into files or scripts.
