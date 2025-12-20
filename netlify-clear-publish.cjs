const fs = require('fs');
const path = require('path');

const SITE_ID = process.env.NETLIFY_SITE_ID;
if (!SITE_ID) {
  throw new Error('Missing NETLIFY_SITE_ID');
}

function getTokenFromNetlifyConfig() {
  const cfgPath = path.join(process.env.APPDATA || '', 'netlify', 'Config', 'config.json');
  if (!process.env.APPDATA) {
    throw new Error('APPDATA is not set; cannot locate Netlify CLI config.json');
  }
  if (!fs.existsSync(cfgPath)) {
    throw new Error(`Netlify CLI config not found at: ${cfgPath}`);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const userId = cfg.userId;
  const token = cfg?.users?.[userId]?.auth?.token;
  if (!token) {
    throw new Error('Netlify token not found in Netlify CLI config.json');
  }
  return token;
}

function getToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  return getTokenFromNetlifyConfig();
}

async function apiRequest(token, url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const msg = json?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

(async () => {
  const token = getToken();

  const base = 'https://api.netlify.com/api/v1/sites';
  const before = await apiRequest(token, `${base}/${SITE_ID}`);

  // Try to clear any UI publish override. Some accounts store this under build_settings.publish.
  // We set it to null so Netlify can fall back to plugin-managed publish.
  await apiRequest(token, `${base}/${SITE_ID}`, {
    method: 'PATCH',
    body: { build_settings: { dir: null, publish: null } },
  });

  const after = await apiRequest(token, `${base}/${SITE_ID}`);

  console.log('Before build_settings.dir:', before?.build_settings?.dir ?? null);
  console.log('Before build_settings.publish:', before?.build_settings?.publish ?? null);
  console.log('After build_settings.dir:', after?.build_settings?.dir ?? null);
  console.log('After build_settings.publish:', after?.build_settings?.publish ?? null);
  console.log('After build_settings:', after?.build_settings ?? null);
})();
