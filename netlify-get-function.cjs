const token = process.env.NETLIFY_AUTH_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;
const name = process.env.NETLIFY_FUNCTION_NAME || '___netlify-server-handler';
if (!token) {
  console.error('Missing NETLIFY_AUTH_TOKEN');
  process.exit(1);
}
if (!siteId) {
  console.error('Missing NETLIFY_SITE_ID');
  process.exit(1);
}

async function req(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

(async () => {
  const base = `https://api.netlify.com/api/v1/sites/${siteId}`;

  const a = await req(`${base}/functions`);
  console.log('GET /functions status', a.status);

  const b = await req(`${base}/functions/${encodeURIComponent(name)}`);
  console.log('GET /functions/:name status', b.status);
  console.log(typeof b.data === 'string' ? b.data.slice(0, 400) : JSON.stringify(b.data, null, 2));
})();
