// Netlify function: get-cohort
// Returns counts for scenarios 1..10 and options A..E

exports.handler = async () => {
  try {
    let kvAvailable = false;
    let kv;
    try {
      // eslint-disable-next-line global-require
      ({ kv } = require('@vercel/kv'));
      if (kv && typeof kv.get === 'function') kvAvailable = true;
    } catch (err) {
      // ignore, will use fallback
    }

    const scenarios = {};

    for (let i = 1; i <= 10; i++) {
      scenarios[i] = { A: 0, B: 0, C: 0, D: 0, E: 0, total: 0 };

      for (const opt of ['A', 'B', 'C', 'D', 'E']) {
        const key = `scenario:${i}:${opt}`;
        let count = 0;

        if (kvAvailable) {
          // kv.get may return null for missing keys
          count = (await kv.get(key)) || 0;
        } else {
          if (global.__COHORT_STORE && typeof global.__COHORT_STORE[key] === 'number') {
            count = global.__COHORT_STORE[key];
          } else {
            count = 0;
          }
        }

        scenarios[i][opt] = count;
        scenarios[i].total += count;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ scenarios }),
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + (err && err.message ? err.message : String(err)) };
  }
};
