import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchUsVix() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice || meta?.chartPreviousClose;
    if (price) {
      return parseFloat(price).toFixed(2);
    }
  } catch (err) {
    console.error('Failed to fetch US VIX:', err.message);
  }
  return null;
}

async function fetchTaiexData() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5ETWII?interval=1d&range=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (meta) {
      const current = meta.regularMarketPrice;
      const prev = meta.chartPreviousClose;
      const pctChange = ((current - prev) / prev) * 100;
      return { current, prev, pctChange };
    }
  } catch (err) {
    console.error('Failed to fetch TAIEX:', err.message);
  }
  return null;
}

async function main() {
  console.log('--- VIX & TAIEX Auto-Update Process ---');
  const usVixFetched = await fetchUsVix();
  const taiexData = await fetchTaiexData();

  console.log(`Fetched US VIX: ${usVixFetched}`);
  if (taiexData) {
    console.log(`Fetched TAIEX Index: ${taiexData.current} (Change: ${taiexData.pctChange.toFixed(2)}%)`);
  }

  const appJsxPath = path.join(__dirname, '../src/App.jsx');
  let content = fs.readFileSync(appJsxPath, 'utf8');

  // Read existing TW VIX
  const twMatch = content.match(/if \(localStorage\.getItem\('vixVersion'\) !== '[^']+'\) return '(\d+\.\d+)';/);
  let currentTwVix = twMatch ? parseFloat(twMatch[1]) : 30.50;

  // Calculate adjusted TW VIX if TAIEX data is available
  let newTwVix = currentTwVix;
  if (taiexData && taiexData.pctChange !== 0) {
    // Inverse relationship: TAIEX drop -> VIX rise
    const vixAdjustment = -taiexData.pctChange * 1.5;
    newTwVix = Math.max(15, Math.min(60, currentTwVix + vixAdjustment));
  }
  const formattedTwVix = newTwVix.toFixed(2);
  console.log(`Computed TW VIX: ${formattedTwVix}`);

  // Generate new version tag: vAuto_YYYYMMDD_HHmm
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const newVersion = `vAuto_${year}${month}${day}_${hours}${mins}`;

  // Match vixVersion pattern in App.jsx
  const versionRegex = /vixVersion'\) !== '([^']+)'/g;
  const match = versionRegex.exec(content);
  if (!match) {
    console.error('Could not find vixVersion in App.jsx');
    return;
  }
  const oldVersion = match[1];
  console.log(`Updating version from ${oldVersion} to ${newVersion}`);

  // Replace version strings
  content = content.replaceAll(oldVersion, newVersion);

  // Replace TW VIX default values
  content = content.replace(
    new RegExp(`return '${currentTwVix.toFixed(2)}';`, 'g'),
    `return '${formattedTwVix}';`
  );

  // Replace US VIX default values if fetched
  if (usVixFetched) {
    const usMatch = content.match(/usVix.*return '(\d+\.\d+)';/s);
    if (usMatch) {
      const oldUsVix = usMatch[1];
      content = content.replace(new RegExp(`return '${oldUsVix}';`, 'g'), `return '${usVixFetched}';`);
    }
  }

  fs.writeFileSync(appJsxPath, content, 'utf8');
  console.log('App.jsx updated successfully!');
}

main();
