const token = process.env.NETLIFY_AUTH_TOKEN;
if (!token) {
  console.error('Missing NETLIFY_AUTH_TOKEN');
  process.exit(1);
}

const SITE_ID = process.env.NETLIFY_SITE_ID || 'b58cd42e-13b3-49e4-8cce-06daef4ae6c3';
const DEPLOY_ID = process.env.NETLIFY_DEPLOY_ID || '6946d0714827e035f56902e2';

async function api(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

async function apiMaybe(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

function hasFile(filesObj, name) {
  if (!filesObj) return false;
  if (Array.isArray(filesObj)) return filesObj.some((f) => f?.path === `/${name}` || f?.path === name);
  return Object.prototype.hasOwnProperty.call(filesObj, name) || Object.prototype.hasOwnProperty.call(filesObj, `/${name}`);
}

(async () => {
  const site = await api(`https://api.netlify.com/api/v1/sites/${SITE_ID}`);
  console.log('site.name=' + site.name);
  console.log('site.url=' + site.url);
  console.log('site.state=' + site.state);
  console.log('published_deploy.id=' + (site.published_deploy?.id || ''));
  console.log('published_deploy.deploy_url=' + (site.published_deploy?.deploy_url || ''));

  const deploy = await api(`https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}`);
  console.log('deploy.id=' + deploy.id);
  console.log('deploy.state=' + deploy.state);
  console.log('deploy.deploy_url=' + deploy.deploy_url);
  console.log('deploy.published_at=' + (deploy.published_at || ''));

  const files = await api(`https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}/files`);
  const fileCount = Array.isArray(files) ? files.length : Object.keys(files || {}).length;
  console.log('files.count=' + fileCount);

  const important = [
    'index.html',
    '_redirects',
    'netlify.toml',
    '.netlify/state.json',
    '.netlify/functions-internal/___netlify-server-handler/___netlify-server-handler.mjs',
  ];

  for (const f of important) {
    console.log(`has:${f}=` + (hasFile(files, f) ? 'yes' : 'no'));
  }

  const fileChecks = [
    'index.html',
    '_redirects',
    '__netlify/edge-functions/manifest.json',
    '.netlify/functions-internal/___netlify-server-handler/___netlify-server-handler.mjs',
  ];

  for (const p of fileChecks) {
    // Netlify expects slashes to remain in the path segment; don't encode '/'
    const safePath = p
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    const r = await apiMaybe(`https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}/files/${safePath}`);
    console.log(`file:${p}.status=` + r.status);
  }
})();
