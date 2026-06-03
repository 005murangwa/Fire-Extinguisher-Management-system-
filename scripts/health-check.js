/**
 * Quick health probe for all FEMS processes (run after `npm run dev`).
 * Usage: npm run status
 */

const checks = [
  { name: 'User service', url: 'http://localhost:4002/health' },
  { name: 'Auth service', url: 'http://localhost:4001/health' },
  { name: 'Extinguisher service', url: 'http://localhost:4003/health' },
  { name: 'Inspection service', url: 'http://localhost:4004/health' },
  { name: 'Reporting service', url: 'http://localhost:4006/health' },
  { name: 'Notification service', url: 'http://localhost:4005/health' },
  { name: 'Request service', url: 'http://localhost:4007/health' },
  { name: 'API gateway', url: 'http://localhost:8080/health' },
  { name: 'Frontend (Vite)', url: 'http://localhost:5173/' },
];

async function probe({ name, url }) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const ok = res.status === 200 || res.status === 503;
    const tag = ok ? 'OK  ' : 'FAIL';
    console.log(`${tag}  ${name}  ${url}  → ${res.status}`);
    return ok;
  } catch (err) {
    console.log(`FAIL  ${name}  ${url}  → ${err.cause?.code || err.message}`);
    return false;
  }
}

const results = await Promise.all(checks.map(probe));
const up = results.filter(Boolean).length;
console.log(`\n${up}/${checks.length} reachable (503 on /health means process is up but DB may be down).`);
process.exit(results.every(Boolean) ? 0 : 1);
