# Test workspace

This workspace contains a Netlify Function example at `Netlify/Functions/record-cohort.js`.

What it does
- Accepts POST requests with JSON body: { scenarioId, optionId }
- Tries to increment a KV counter using `@vercel/kv` if available
- Falls back to a process-local in-memory counter for local testing

Local testing
1. Install Netlify CLI (if you don't have it):

```bash
npm install -g netlify-cli
```

2. (Optional) Install `@vercel/kv` if you plan to use a KV provider in your environment:

```bash
npm install @vercel/kv
```

3. Run the dev server in the workspace root:

```bash
netlify dev
```

4. POST to the function (example):

```bash
curl -X POST http://localhost:8888/.netlify/functions/record-cohort \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"s1","optionId":"a"}'
```

Notes
- The in-memory fallback is only for demos and will not persist across function cold starts or deployments.
- For production use, configure a persistent KV/database and remove the fallback.
