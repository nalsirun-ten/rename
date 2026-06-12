const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const ruFile = path.join(srcDir, 'i18n', 'ru.ts');

const ruContent = fs.readFileSync(ruFile, 'utf8');
const ruKeys = new Set();
const keyRegex = /"([^"]+)":/g;
let match;
while ((match = keyRegex.exec(ruContent)) !== null) {
  ruKeys.add(match[1]);
}

const foundKeys = new Set();
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const tRegex = /t\(['"]([^'"]+)['"]/g;
      let match;
      while ((match = tRegex.exec(content)) !== null) {
        foundKeys.add(match[1]);
      }
    }
  }
}
walk(srcDir);

const missing = [];
for (const key of foundKeys) {
  if (!ruKeys.has(key)) {
    missing.push(key);
  }
}
console.log('Missing keys:', missing);
