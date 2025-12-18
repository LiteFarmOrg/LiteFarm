const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = process.cwd();

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  if (!/navigate\(/.test(src)) return false;
  if (/useNavigate/.test(src)) return false;

  let lines = src.split('\n');

  // Handle imports: if there's an import from 'react-router-dom', add useNavigate
  const rrIndex = lines.findIndex(l => /from\s+['"]react-router-dom['"]/.test(l));
  if (rrIndex !== -1) {
    // add to named imports
    const m = lines[rrIndex].match(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];/);
    if (m) {
      const imports = m[1].split(',').map(s => s.trim()).filter(Boolean);
      if (!imports.includes('useNavigate')) {
        imports.push('useNavigate');
        lines[rrIndex] = `import { ${imports.join(', ')} } from 'react-router-dom';`;
      }
    } else if (/import\s+\w+\s+from\s+['"]react-router-dom['"]/.test(lines[rrIndex])) {
      // default import from react-router-dom (rare) - add separate named import below
      lines.splice(rrIndex+1, 0, "import { useNavigate } from 'react-router-dom';");
    }
  } else {
    // find React import to insert below
    const reactIndex = lines.findIndex(l => /from\s+['"]react['"]/.test(l));
    const insertAt = reactIndex !== -1 ? reactIndex+1 : 0;
    lines.splice(insertAt, 0, "import { useNavigate } from 'react-router-dom';");
  }

  // Insert `const navigate = useNavigate();` inside the first functional component body
  const content = lines.join('\n');
  // find common component starts
  const funcPatterns = [/^export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/, /^function\s+\w+\s*\([^)]*\)\s*\{/, /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/, /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\(/];
  let inserted = false;

  for (let i = 0; i < lines.length && !inserted; i++) {
    const line = lines[i];
    for (const pat of funcPatterns) {
      if (pat.test(line)) {
        // find the line with the opening brace
        let j = i;
        if (!line.includes('{')) {
          // scan forward for the brace
          while (j < lines.length && !lines[j].includes('{')) j++;
        }
        if (j < lines.length) {
          const indent = lines[j].match(/^(\s*)/)[1] + '  ';
          lines.splice(j+1, 0, `${indent}const navigate = useNavigate();`);
          inserted = true;
          break;
        }
      }
    }
  }

  if (!inserted) {
    // as a fallback, insert after imports block
    const lastImport = (() => {
      for (let i = 0; i < lines.length; i++) if (!lines[i].startsWith('import ')) return i-1;
      return -1;
    })();
    const insertLine = Math.max(0, lastImport+1);
    lines.splice(insertLine, 0, 'const navigate = useNavigate();');
  }

  fs.writeFileSync(file, lines.join('\n'));
  return true;
}

const patterns = ['packages/webapp/src/**/*.{js,jsx,ts,tsx}'];
let changed = 0;
patterns.forEach(pat => {
  const files = glob.sync(pat, { nodir: true });
  files.forEach(f => {
    try {
      if (processFile(f)) {
        console.log('patched', f);
        changed++;
      }
    } catch (e) {
      console.error('error', f, e.message);
    }
  });
});

console.log('total changed:', changed);
