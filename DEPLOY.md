# VSI — Deployment Guide (Coolify)

## Prerequisites
- Coolify instance with Docker support
- Private Git repository (GitHub / GitLab / Gitea)
- Supabase project with schema applied
- API keys for: Serper (optional), SerpAPI, OpenRouter, Firecrawl

## 1. Push code to your private repo

```bash
# In the project root
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

> `.env.local` is in `.gitignore` — your keys will NOT be pushed. Verify with `git status` before committing.

## 2. Apply database schema in Supabase

In the Supabase SQL Editor, run in order:
1. `supabase/schema.sql` (full schema)
2. `supabase/migration_002_frequency.sql`
3. `supabase/migration_003_rich_results.sql`
4. `supabase/migration_004_fix_gap_labels.sql`

Then run the dev-mode setup:
```sql
insert into public.agencies (id, name, slug)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'ValGrow Digital', 'valgrow-digital');

create policy "dev_clients_all"   on public.clients          for all using (true) with check (true);
create policy "dev_keywords_all"  on public.tracked_keywords for all using (true) with check (true);
create policy "dev_results_all"   on public.search_results   for all using (true) with check (true);
```

## 3. Create the app in Coolify

1. New Resource → Application
2. Source: your private Git repo
3. Branch: `main`
4. Build Pack: **Dockerfile** (Coolify detects the included Dockerfile)
5. Port: `3000`

## 4. Set environment variables in Coolify panel

Required (set under the app's Environment Variables tab):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SERPER_API_KEY=your_serper_key
SEARCHAPI_KEY=your_searchapi_key
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
FIRECRAWL_API_KEY=fc-...
```

> Mark `NEXT_PUBLIC_*` as build-time. The others are runtime-only.

## 5. Deploy

Click **Deploy** in Coolify. Build takes 2-3 minutes (Docker multi-stage).

After deploy, verify:
- Hit the public URL
- HTTP headers should NOT show `Next.js`, `Vercel`, or `Cloudflare-Workers`
- `Server: VSI` should be present
- No `X-Powered-By` header

## 6. Custom domain (optional)

In Coolify → app settings → Domains, add your custom domain.
Coolify auto-provisions SSL via Let's Encrypt.

---

## Tech-stack masking checklist

| Vector | Status |
|---|---|
| HTTP `X-Powered-By` | Removed via `poweredByHeader: false` |
| `Server` header | Set to "VSI" |
| Build ID | Opaque timestamp-based |
| Source maps | Disabled in production |
| Telemetry | `NEXT_TELEMETRY_DISABLED=1` |
| Search engine indexing | Blocked via robots meta |
| Referrer | `strict-origin-when-cross-origin` |
| Inner JS bundles | Aggressively minified by Next.js production build |
| External API endpoints | Called server-side only — never appear in client network tab |

---

## Updating in production

```bash
git add .
git commit -m "Your update"
git push
```

Coolify auto-deploys on push (if webhook is enabled) or you can hit "Deploy" manually.
