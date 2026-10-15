// Hook for the reviewer subagent: only read-only commands are allowed.
// Anything not on the allowlist is blocked (exit 2). Fails closed on parse errors.

const allowed = [
  /^git\s+(diff|log|status|show|blame)\b/i,
  /^(ls|dir|Get-ChildItem|Get-Content|cat|type)\b/i,
];

function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let cmd;
  try {
    cmd = String(JSON.parse(input)?.tool_input?.command ?? '').trim();
  } catch {
    block('Hook không đọc được lệnh, chặn để an toàn.');
  }
  if (!cmd) process.exit(0);

  // No chaining, redirection to files, or nested commands.
  if (/[;&|>`]|\$\(/.test(cmd)) {
    block('Reviewer chỉ được chạy một lệnh đọc đơn lẻ, không nối lệnh hay ghi file.');
  }
  if (allowed.some((p) => p.test(cmd))) process.exit(0);
  block(`Reviewer là agent chỉ đọc. Lệnh bị chặn: ${cmd}`);
});
