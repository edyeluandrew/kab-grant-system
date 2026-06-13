#!/usr/bin/env node
/**
 * Fetches open grant calls from the public API and writes
 * frontend/public/open-grant-calls.json as an offline fallback.
 *
 * Usage:
 *   node scripts/sync-open-grant-calls.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = (process.env.VITE_API_BASE_URL || 'https://kab-grant-system.onrender.com/api/v1')
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '') + '/api/v1';

const response = await fetch(`${API_BASE}/general/grant-calls`, {
  headers: { 'Content-Type': 'application/json' },
});

if (!response.ok) {
  console.error('Fetch failed:', response.status, await response.text());
  process.exit(1);
}

const calls = await response.json();
const openCalls = (Array.isArray(calls) ? calls : []).filter((c) => c.status === 'Open');
const outPath = join(__dirname, '../public/open-grant-calls.json');

writeFileSync(outPath, JSON.stringify(openCalls, null, 2));
console.log(`Wrote ${openCalls.length} open grant call(s) to ${outPath}`);
