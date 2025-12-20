const token = process.env.NETLIFY_AUTH_TOKEN;
if (!token) {
  console.error('Missing NETLIFY_AUTH_TOKEN');
  process.exit(1);
}

(async () => {
  const res = await fetch('https://api.netlify.com/api/v1/accounts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    console.error('HTTP', res.status);
    console.error(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('accounts:', data.length);
  for (const a of data) {
    console.log(`${a.slug || a.name || a.id} | ${a.id} | ${a.type_name || ''}`);
  }
})();
