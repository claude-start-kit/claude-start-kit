// 공식 문서의 슬래시 명령 표를 받아 한국어 레퍼런스 페이지를 생성합니다.
//   node tools/build-reference.mjs            공식 문서를 내려받아 content/reference/slash-commands.md 생성
//   node tools/build-reference.mjs --file p   내려받아 둔 commands.md 로 생성 (오프라인 테스트)
// - 설명(한국어)은 tools/reference-ko/slash-commands.json 에서 가져오고,
//   별칭·스킬/워크플로·버전 조건·문서 링크는 원문에서 자동 추출합니다.
// - 번역이 없는 새 명령은 원문 문장을 그대로 표시하고 경고를 출력합니다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "https://code.claude.com/docs/en/commands.md";
const ko = JSON.parse(fs.readFileSync(path.join(root, "tools", "reference-ko", "slash-commands.json"), "utf8"));
const fileArg = process.argv.indexOf("--file");
const text = fileArg > -1 ? fs.readFileSync(process.argv[fileArg + 1], "utf8")
  : await (await fetch(SRC, { headers: { "User-Agent": "build-reference/1.0" } })).text();

const CATS = [
  ["conv", "대화·컨텍스트 관리"],
  ["model", "모델·화면·입력 설정"],
  ["perm", "권한·보안·훅"],
  ["proj", "프로젝트·메모리·작업 폴더"],
  ["work", "작업 실행·계획·검토"],
  ["parallel", "병렬·백그라운드 작업"],
  ["ext", "확장: MCP·플러그인·스킬·에이전트"],
  ["acct", "계정·사용량·플랜"],
  ["integ", "연동·클라우드·다른 기기"],
  ["diag", "진단·도움말·종료"],
  ["design", "디자인·아티팩트·문서 만들기"],
  ["misc", "기타 · 제거된 명령"],
];

// --strict: 자동 머지 판단용. 파싱 실패·번역 누락·낡은 번역 키·항목 수 급감이 하나라도 있으면 종료 코드 3
const STRICT = process.argv.includes("--strict");
const problems = [];

// ---- 표 파싱 ----
const rows = [];
for (const line of text.split("\n")) {
  if (!/^\| `\//.test(line)) continue;
  const m = line.match(/^\| (.+?) \| (.*) \|$/);
  if (!m) { console.warn("파싱 실패:", line.slice(0, 80)); problems.push("파싱 실패"); continue; }
  const cell = m[1];
  const desc = m[2];
  const firstGroup = (cell.match(/`([^`]+)`/) || [])[1] || cell;
  const key = firstGroup.replace(/\s*[\[<(].*$/, "").trim();
  const plain = desc.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const links = [...desc.matchAll(/\]\((https:\/\/code\.claude\.com\/docs[^)]+)\)/g)].map((x) => x[1]).filter((u) => !/#bundled-/.test(u));
  const aliases = new Set();
  for (const a of plain.matchAll(/Aliases?: ((?:`[^`]+`(?:, | and )?)+)/g)) for (const x of a[1].matchAll(/`(\/[^`]+)`/g)) aliases.add(x[1]);
  for (const a of plain.matchAll(/Also available as (`\/[^`]+`)/g)) aliases.add(a[1].replace(/`/g, ""));
  const versions = [...new Set([...plain.matchAll(/v(\d+\.\d+\.\d+) or later/g)].map((x) => x[1]))];
  const kind = /^\*\*Skill\./.test(plain) ? "스킬" : /^\*\*Workflow\./.test(plain) ? "워크플로" : /^Removed/.test(plain) ? "제거됨" : "";
  rows.push({ key, cell, plain, link: links[0] || "", aliases: [...aliases], versions, kind });
}

// ---- 페이지 생성 ----
const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; // 로컬(한국) 날짜
const esc = (s) => s.replace(/\|/g, "\\|");
const missing = [];
const byCat = new Map(CATS.map(([id]) => [id, []]));

for (const r of rows) {
  const t = ko[r.key];
  let cat = "misc", desc;
  if (t) { cat = t.cat; desc = esc(t.ko); }
  else {
    missing.push(r.key);
    desc = esc("(번역 없음 — 원문 참고) " + r.plain.replace(/^\*\*[^*]+\*\*\s*/, "").split(/(?<=\.)\s/)[0]);
  }
  const notes = [];
  if (r.kind) notes.push(r.kind);
  if (r.aliases.length) notes.push("별칭 " + r.aliases.map((a) => "`" + a + "`").join(", "));
  if (r.versions.length === 1) notes.push(`v${r.versions[0]}+`);
  else if (r.versions.length > 1) notes.push("옵션별 버전 조건 다름(원문 참고)");
  (byCat.get(cat) || byCat.get("misc")).push(`| ${r.cell} | ${desc} | ${notes.join("<br>")} |`);
}
const stale = Object.keys(ko).filter((k) => k !== "_comment" && !rows.some((r) => r.key === k));

const tables = CATS.map(([id, title]) => {
  const list = byCat.get(id);
  if (!list.length) return "";
  return `## ${title} (${list.length})\n\n| 명령 | 설명 | 비고 |\n| :- | :- | :- |\n${list.join("\n")}\n`;
}).join("\n");

const md = `# Commands — 세션 안에서 쓰는 / 명령

> 공식 문서의 **전체 명령 ${rows.length}개**를 한국어로 정리한 참고용 표입니다. 이미 Claude Code를 써 본 분이 확인용으로 찾아보세요. 위의 검색창에 명령 이름이나 키워드를 입력하면 바로 거를 수 있습니다.

## 읽는 법
- \`<arg>\`는 **필수** 인자, \`[arg]\`는 **선택** 인자입니다
- 명령은 **메시지의 맨 앞**에서만 인식됩니다. 뒤따르는 글자는 인자가 됩니다
- Claude가 응답하는 동안 보낸 명령은 대기했다가 턴이 끝나면 실행됩니다. \`/status\`, \`/tasks\`, \`/usage\`는 즉시 실행됩니다
- **내 화면에 안 보이는 명령이 있을 수 있습니다.** 플랫폼·플랜·환경·버전에 따라 달라집니다 (예: \`/desktop\`은 macOS와 x64 Windows에서 구독으로 로그인했을 때만 표시)
- 메뉴에서 **일부러 숨겨 둔 명령**(예: \`/heapdump\`)은 전체 이름을 입력해야 나타납니다
- **스킬**과 **워크플로** 표시는 번들로 제공되는 스킬·워크플로라는 뜻입니다. 내 명령은 [스킬](https://code.claude.com/docs/en/skills.md)로 만듭니다
- MCP 서버가 제공하는 프롬프트도 명령으로 나타납니다 ([MCP 프롬프트](https://code.claude.com/docs/en/mcp.md))

## 작업 흐름별로 보면
| 상황 | 자주 쓰는 명령 |
| :- | :- |
| **저장소에서 첫 세션** | \`/init\` → \`/memory\` → \`/mcp\` → \`/permissions\` |
| **작업 중** | \`/plan\`, \`/model\`, \`/effort\`, \`/context\`, \`/compact\`, \`/btw\` |
| **병렬 작업** | \`/tasks\`, \`/background\`, \`/batch\` |
| **배포 전** | \`/diff\`, \`/code-review\`(별칭 \`/review\`), \`/security-review\` |
| **세션 사이** | \`/clear\`, \`/resume\`, \`/branch\`, \`/fork\`, \`/teleport\`, \`/remote-control\` |
| **문제가 생겼을 때** | \`/rewind\`, \`/doctor\`, \`/debug\`, \`/feedback\` |

${tables}
---

**출처:** [공식 문서 commands](https://code.claude.com/docs/en/commands) · 이 표는 ${today}에 공식 문서에서 자동 추출했고, 설명은 한국어로 옮긴 것입니다. 한국어 설명이 원문과 다르거나 새 명령이 보이지 않으면 원문을 기준으로 하세요. 이 표는 작성에 쓴 Claude Code 2.1.323 기준 문서이며, 내 버전에 따라 다를 수 있습니다.
`;

const outDir = path.join(root, "content", "reference");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "slash-commands.md");
const prevCount = fs.existsSync(outFile) ? Number((fs.readFileSync(outFile, "utf8").match(/전체 명령 (\d+)개/) || [])[1]) || 0 : 0;
if (prevCount && rows.length < prevCount * 0.8) problems.push(`명령 수가 ${prevCount}개 → ${rows.length}개로 급감`);
fs.writeFileSync(outFile, md);

console.log(`명령 ${rows.length}개 → content/reference/slash-commands.md`);
for (const [id, title] of CATS) console.log(`  ${title}: ${byCat.get(id).length}`);
if (missing.length) console.warn(`\n⚠ 번역 없는 명령 ${missing.length}개: ${missing.join(", ")}`);
if (stale.length) console.warn(`⚠ 문서에 더는 없는 번역 키 ${stale.length}개: ${stale.join(", ")}`);
for (const p of problems) console.warn(`⚠ ${p}`);
if (STRICT && (missing.length || stale.length || problems.length)) { console.warn("strict: 사람의 검토가 필요합니다"); process.exitCode = 3; }
