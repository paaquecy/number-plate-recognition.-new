Admindashboard

## Supabase Edge Functions: CI Deploy

This repo auto-deploys Supabase Edge Functions via GitHub Actions when you push to `main`/`master`.

1) Add the following repository secrets in GitHub Settings → Secrets and variables → Actions:
- `SUPABASE_PROJECT_ID` (Project Ref, e.g. abcdefghijklmn)
- `SUPABASE_ACCESS_TOKEN` (Personal access token from Supabase dashboard)
- `SUPABASE_URL` (https://<PROJECT_REF>.supabase.co)
- `SUPABASE_ANON_KEY` (Anon/public key)

2) Put Edge Functions in either directory:
- Root: `supabase/functions/<function-name>/index.ts`
- Police: `police/supabase/functions/<function-name>/index.ts`

3) On push, CI deploys each function and sets secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` for them.

Endpoints will look like:
- `https://<PROJECT_REF>.functions.supabase.co/<function-name>`

Local dev (optional):
```bash
supabase functions serve --no-verify-jwt
# Then POST to http://127.0.0.1:54321/functions/v1/<function-name>
```

## Netlify: CI Deploy via GitHub Actions

This repo includes `.github/workflows/netlify-deploy.yml` to build and deploy the site to Netlify.

Set these GitHub repo secrets (Settings → Secrets and variables → Actions):
- `NETLIFY_AUTH_TOKEN` (from Netlify User Settings → Applications → Personal access tokens)
- `NETLIFY_SITE_ID` (from your Site Settings → General → Site details → API ID)
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` (used at build time for Vite)

On push to `main`/`master` it deploys to production; PRs and non-main branches create preview deploys.

Ensure `netlify.toml` exists (it does) with:
- build command: `npm run build`
- publish dir: `dist`
- SPA redirect: `/* -> /index.html 200`
