// PostToolUse hook: format the file Claude just edited/wrote.
// Only runs a formatter the project already has installed; otherwise does nothing.

import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  try {
    const file = String(JSON.parse(input)?.tool_input?.file_path ?? '');
    if (!file || !existsSync(file)) process.exit(0);

    const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const ext = extname(file).toLowerCase();

    if (/^\.(js|jsx|mjs|ts|tsx|json|css|scss|html|md|yml|yaml)$/.test(ext)) {
      const prettier = join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
      if (existsSync(prettier)) {
        spawnSync(process.execPath, [prettier, '--write', file], { stdio: 'ignore' });
      }
    }
  } catch {
    // Formatting is best-effort; never fail the edit.
  }
  process.exit(0);
});
