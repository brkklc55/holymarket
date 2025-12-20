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

async function main() {
  const token = getToken();
  const res = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const site = await res.json();
  if (!res.ok) {
    throw new Error(site?.message || JSON.stringify(site));
  }

  fs.writeFileSync('netlify-site-dump.json', JSON.stringify(site, null, 2));

  const hits = [];
  const seen = new Set();

  function walk(v, p) {
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
      if (lv.includes('.next') || lv.includes('publish') || lv.includes('origin')) {
        hits.push([p, v]);
      }
    }
  }

  walk(site, '');
  console.log('Dumped to netlify-site-dump.json');
  console.log('Hits:', hits.length);
  for (const [p, v] of hits.slice(0, 120)) {
    console.log(p + ':', JSON.stringify(v));
  }
}

main().catch((e) => {
  console.error('ERROR:', e.message || e);
  process.exit(1);
});
