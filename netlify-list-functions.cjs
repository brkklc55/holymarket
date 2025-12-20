const token = process.env.NETLIFY_AUTH_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;
if (!token) {
  console.error('Missing NETLIFY_AUTH_TOKEN');
  process.exit(1);
}
if (!siteId) {
  console.error('Missing NETLIFY_SITE_ID');
  process.exit(1);
}

async function get(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    console.error('HTTP', res.status);
    console.error(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

(async () => {
  const url = `https://api.netlify.com/api/v1/sites/${siteId}/functions`;
  const fns = await get(url);
  console.log('functions.count=' + (Array.isArray(fns) ? fns.length : 0));
  if (Array.isArray(fns)) {
    for (const fn of fns) {
      console.log(`${fn.name} | runtime=${fn.runtime || ''} | url=${fn.url || ''}`);
    }
  } else {
    console.log(typeof fns === 'string' ? fns : JSON.stringify(fns, null, 2));
  }
})();
