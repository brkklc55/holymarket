const fs = require('fs');
const path = require('path');

const SITE_ID = 'e46b8687-b88a-4e6f-8e56-76eec5c9d723';

function getToken() {
  const cfgPath = path.join(process.env.APPDATA || '', 'netlify', 'Config', 'config.json');
  if (!process.env.APPDATA) throw new Error('APPDATA is not set');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const token = cfg?.users?.[cfg.userId]?.auth?.token;
  if (!token) throw new Error('Token not found in Netlify CLI config');
  return token;
}

async function fetchJson(token, url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, ok: res.ok, json };
}

function collectPublishLike(obj) {
  const hits = [];
  const seen = new Set();
  const walk = (v, p) => {
    if (v && typeof v === 'object') {
      if (seen.has(v)) return;
      seen.add(v);
      for (const [k, val] of Object.entries(v)) {
        walk(val, p ? `${p}.${k}` : k);
      }
      return;
    }
    if (typeof v === 'string') {
      const lv = v.toLowerCase();
      if (lv.includes('publish') || lv.includes('origin') || lv.includes('.next')) {
        hits.push([p, v]);
      }
    }
  };
  walk(obj, '');
  return hits;
}

(async () => {
  const token = getToken();

  const base = 'https://api.netlify.com/api/v1';
  const endpoints = [
    `${base}/sites/${SITE_ID}`,
    `${base}/sites/${SITE_ID}/builds`,
    `${base}/sites/${SITE_ID}/build_settings`,
    `${base}/sites/${SITE_ID}/settings`,
    `${base}/sites/${SITE_ID}/metadata`,
  ];

  for (const url of endpoints) {
    const r = await fetchJson(token, url);
    console.log('---');
    console.log(url);
    console.log('status', r.status);
    if (!r.ok) {
      console.log('error', typeof r.json === 'string' ? r.json.slice(0, 200) : JSON.stringify(r.json).slice(0, 200));
      continue;
    }

    const hits = collectPublishLike(r.json);
    console.log('publish-like hits', hits.length);
    for (const [p, v] of hits.slice(0, 30)) {
      console.log(p + ':', JSON.stringify(v));
    }
  }
})();
