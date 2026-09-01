const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const target = /var(--brand-primary)/gi; // case-insensitive
const replacement = 'var(--brand-primary)';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      walk(full);
    } else {
      // Only touch text files
      if (!/\.(js|jsx|ts|tsx|css|scss|md|json|html|svg)$/i.test(entry.name)) continue;
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (target.test(content)) {
          const updated = content.replace(target, replacement);
          fs.writeFileSync(full, updated, 'utf8');
          console.log('Replaced in', full);
        }
      } catch (err) {
        console.error('Failed', full, err.message);
      }
    }
  }
}

console.log('Starting replacement in', root);
walk(root);
console.log('Done');
