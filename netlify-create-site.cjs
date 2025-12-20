const token = process.env.NETLIFY_AUTH_TOKEN;
if (!token) {
  console.error('Missing NETLIFY_AUTH_TOKEN');
  process.exit(1);
}

const SITE_NAME = process.env.NETLIFY_SITE_NAME || 'holymarket';
const ACCOUNT_SLUG = process.env.NETLIFY_ACCOUNT_SLUG || 'klcbrk12';

async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
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
  const accounts = await api('https://api.netlify.com/api/v1/accounts');
  const account = accounts.find((a) => a.slug === ACCOUNT_SLUG) || accounts[0];
  if (!account) {
    console.error('No accounts available for token');
    process.exit(1);
  }

  const payload = {
    name: SITE_NAME,
    account_slug: account.slug,
  };

  const site = await api('https://api.netlify.com/api/v1/sites', { method: 'POST', body: payload });

  console.log('site_id=' + site.id);
  console.log('name=' + site.name);
  console.log('url=' + site.url);
  console.log('admin_url=' + site.admin_url);
})();
