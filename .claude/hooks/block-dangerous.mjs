// PreToolUse hook: block dangerous Bash/PowerShell commands.
// Claude Code sends JSON on stdin. Exit code 2 = block; stderr is sent to Claude as the reason.
// Fails closed: any error while parsing the payload also blocks the command.

const rules = [
  { pattern: /git\s+push/i, reason: 'Không được push. Người dùng tự push.' },
  { pattern: /git\s+reset\s+--hard/i, reason: 'Không được reset --hard.' },
  { pattern: /git\s+clean\s+-[a-z]*f/i, reason: 'Không được git clean -f.' },
  { pattern: /git\s+branch\s+-D/i, reason: 'Không được xoá nhánh.' },
  { pattern: /rm\s+-[a-z]*r[a-z]*f|rm\s+-[a-z]*f[a-z]*r/i, reason: 'Không được rm -rf.' },
  { pattern: /Remove-Item.*-Recurse/i, reason: 'Không được xoá đệ quy bằng Remove-Item.' },
  { pattern: /\b(rd|rmdir)\s+\/s/i, reason: 'Không được xoá thư mục đệ quy.' },
  { pattern: /Format-Volume|diskpart/i, reason: 'Lệnh hệ thống bị cấm.' },
  { pattern: /\.env(?!\.example)(\b|\.)/i, reason: 'Không được đọc hoặc ghi file .env. Dùng .env.example.' },
  { pattern: /\.ssh[\\/]|\.aws[\\/]|\.azure[\\/]/i, reason: 'Không được truy cập thư mục chứa khoá bí mật.' },
];

function block(reason) {
  process.stderr.write(`Bị chặn bởi hook an toàn: ${reason}\n`);
  process.exit(2);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let cmd;
  try {
    cmd = String(JSON.parse(input)?.tool_input?.command ?? '');
  } catch {
    block('Hook không đọc được lệnh, chặn để an toàn.');
  }
  if (!cmd.trim()) process.exit(0);
  for (const r of rules) {
    if (r.pattern.test(cmd)) block(r.reason);
  }
  process.exit(0);
});
