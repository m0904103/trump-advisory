import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('dist/index.html', 'utf8');
const jsCode = fs.readFileSync(
  'dist/' + fs.readdirSync('dist/assets').find(f => f.endsWith('.js')), 
  'utf8'
);

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Mock APIs that browser has
window.fetch = async () => ({ json: async () => ({ status: 'ok', items: [] }) });
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };

const scriptEl = window.document.createElement("script");
scriptEl.textContent = jsCode;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
    if (window.document.querySelector('#root').innerHTML.length > 50) {
        console.log("SUCCESS: React rendered!");
    } else {
        console.log("FAILED: Root is empty.");
        console.log("Errors:", window.__REACT_DEVTOOLS_GLOBAL_HOOK__); // Try to find errors
    }
}, 2000);
