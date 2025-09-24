// Netlify function: record-cohort
// Accepts POST JSON: { scenarioId, optionId }
// Tries to use @vercel/kv if present (works with some serverless KV providers).
// Falls back to a process-local in-memory store for local testing/demos.

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (err) {
      return { statusCode: 400, body: "Invalid JSON body" };
    }

    const { scenarioId, optionId } = data;
    if (!scenarioId || !optionId) {
      return { statusCode: 400, body: "Missing scenarioId or optionId" };
    }

    const key = `scenario:${scenarioId}:${optionId}`;

    // Try to use @vercel/kv if available and configured
    let usedKV = false;
    try {
      // require may throw if package isn't installed
      // eslint-disable-next-line global-require
      const { kv } = require('@vercel/kv');
      if (kv && typeof kv.incr === 'function') {
        await kv.incr(key);
        usedKV = true;
      }
    } catch (err) {
      // ignore and fall back to in-memory store below
    }

    // In-memory fallback for local/demo usage
    if (!usedKV) {
      if (!global.__COHORT_STORE) global.__COHORT_STORE = {};
      global.__COHORT_STORE[key] = (global.__COHORT_STORE[key] || 0) + 1;
    }

    const count = usedKV ? null : global.__COHORT_STORE[key];

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Choice recorded', scenarioId, optionId, count, usingKV: usedKV }),
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + (err && err.message ? err.message : String(err)) };
  }
};
