// 공식 CLI reference 문서의 명령·플래그 표를 받아 한국어 레퍼런스 페이지를 생성합니다.
//   node tools/build-cli-reference.mjs            공식 문서를 내려받아 content/reference/cli.md 생성
//   node tools/build-cli-reference.mjs --file p   내려받아 둔 cli-reference.md 로 생성 (오프라인 테스트)
// - 설명(한국어)은 tools/reference-ko/cli-reference.json 에서 가져옵니다.
// - 번역이 없는 새 항목은 원문 문장을 그대로 표시하고 경고를 출력합니다.
// - 설명에 적지 않은 버전 조건("vX.Y.Z or later")은 비고에 자동으로 붙입니다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "https://code.claude.com/docs/en/cli-reference.md";
const ko = JSON.parse(fs.readFileSync(path.join(root, "tools", "reference-ko", "cli-reference.json"), "utf8"));
const fileArg = process.argv.indexOf("--file");
const text = fileArg > -1 ? fs.readFileSync(process.argv[fileArg + 1], "utf8")
  : await (await fetch(SRC, { headers: { "User-Agent": "build-cli-reference/1.0" } })).text();

const CMD_CATS = [
  ["start", "세션 시작·이어가기"],
  ["manage", "설치·업데이트·로그인·진단"],
  ["bg", "백그라운드 세션 관리"],
  ["ext", "연동·확장·관리자용"],
];
const FLAG_CATS = [
  ["f-session", "세션·작업 폴더·연동"],
  ["f-model", "모델·노력도"],
  ["f-perm", "권한·도구 제한"],
  ["f-print", "비대화형(-p)·스크립트"],
  ["f-prompt", "시스템 프롬프트"],
  ["f-ext", "에이전트·MCP·플러그인·설정"],
  ["f-bg", "백그라운드·클라우드·원격"],
  ["f-diag", "디버그·진단·접근성"],
];

// --strict: 자동 머지 판단용. 파싱 실패·번역 누락·낡은 번역 키·항목 수 급감이 하나라도 있으면 종료 코드 3
const STRICT = process.argv.includes("--strict");
const problems = [];

// ---- 표 파싱 (명령 표와 플래그 표만. 'System prompt flags' 표는 플래그 표와 중복이라 제외) ----
const strip = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const rows = [];
let section = "";
for (const line of text.split("\n")) {
  const h = line.match(/^#{2,3} (.+)/); // '### System prompt flags' 같은 하위 제목도 구역을 끊음
  if (h) section = h[1].trim();
  if (!/^\| `/.test(line)) continue;
  const type = section === "CLI commands" ? "cmd" : section === "CLI flags" ? "flag" : null;
  if (!type) continue;
  const cells = line.slice(2, -2).split(/(?<!\\) \| /);
  if (cells.length < 2) { console.warn("파싱 실패:", line.slice(0, 80)); problems.push("파싱 실패"); continue; }
  const cell = cells[0].trim();
  const example = (cells[2] || "").trim();
  const first = (cell.match(/`([^`]+)`/) || [])[1] || cell;
  const key = first.replace(/\\\|/g, "|");
  const plain = strip(cells[1]);
  const versions = [...new Set([...plain.matchAll(/v(\d+\.\d+\.\d+) or later/g)].map((x) => x[1]))];
  const removed = /^Removed/.test(plain);
  const deprecated = /^Deprecated/.test(plain);
  rows.push({ type, key, cell, example, plain, versions, removed, deprecated });
}

// ---- 페이지 생성 ----
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }); // 한국 시간 기준 날짜 (서버가 UTC여도 같은 날짜)
const esc = (s) => s.replace(/\|/g, "\\|");
const missing = [];
const byCat = new Map([...CMD_CATS, ...FLAG_CATS].map(([id]) => [id, []]));

for (const r of rows) {
  const t = ko[r.key];
  let cat = r.type === "cmd" ? "ext" : "f-ext", desc, tr = "";
  if (t) { cat = t.cat; desc = esc(t.ko); tr = t.ko; }
  else {
    missing.push(r.key);
    desc = esc("(번역 없음 — 원문 참고) " + r.plain.split(/(?<=\.)\s/)[0]);
  }
  const notes = [];
  if (r.removed) notes.push("제거됨");
  if (r.deprecated) notes.push("더 이상 권장되지 않음");
  const need = r.versions.filter((v) => !tr.includes(v));
  if (need.length === 1) notes.push(`v${need[0]}+`);
  else if (need.length > 1) notes.push("옵션별 버전 조건 다름(원문 참고)");
  const ex = r.example.replace(/^`(.*)`$/, "$1");
  if (ex && ex !== r.key && ex !== "-") notes.push(`예: \`${ex.replace(/\\\|/g, "\\|")}\``);
  (byCat.get(cat) || byCat.get("f-ext")).push(`| ${r.cell} | ${desc} | ${notes.join("<br>")} |`);
}
const stale = Object.keys(ko).filter((k) => k !== "_comment" && !rows.some((r) => r.key === k));

const tableOf = (cats, head, prefix) => cats.map(([id, title]) => {
  const list = byCat.get(id);
  if (!list.length) return "";
  return `## ${prefix} · ${title} (${list.length})\n\n| ${head} | 설명 | 비고 |\n| :- | :- | :- |\n${list.join("\n")}\n`;
}).join("\n");
const nCmd = rows.filter((r) => r.type === "cmd").length;
const nFlag = rows.filter((r) => r.type === "flag").length;

const md = `# CLI reference — 터미널 명령·플래그

> 터미널에서 \`claude\`를 실행할 때 쓰는 **명령 ${nCmd}개와 플래그 ${nFlag}개**를 한국어로 정리한 참고용 표입니다. 위의 검색창에 이름이나 키워드를 입력하면 바로 거를 수 있습니다. (세션 안에서 쓰는 \`/명령\`은 [Commands](#/ref/slash-all)를 보세요.)

## 읽는 법
- **명령**은 \`claude\` 뒤에 붙는 하위 명령, **플래그**는 \`claude\` 뒤에 붙는 시작 옵션입니다
- \`<arg>\`는 **필수** 인자, \`[arg]\`는 **선택** 인자입니다
- **\`claude --help\`에 안 나오는 플래그도 있습니다.** 도움말에 없다고 해서 쓸 수 없는 것은 아닙니다
- **print 모드 전용** 표시가 있는 플래그는 \`-p\`(비대화형)로 실행할 때만 동작합니다
- 설명에 적힌 \`v2.1.xxx 이상\`은 그 버전부터 지원한다는 뜻입니다. \`claude -v\`으로 내 버전을 확인하세요
- 같은 설정이 \`settings.json\`에도 있을 때 어느 쪽이 우선인지는 항목 설명에 적힌 것만 확실합니다 (예: \`--model\`은 \`model\` 설정보다 우선)

## 자주 쓰는 조합
| 하고 싶은 일 | 명령 |
| :- | :- |
| 일반 대화 시작 | \`claude\` |
| 가장 최근 대화 이어가기 | \`claude -c\` |
| 이름 붙인 세션 다시 열기 | \`claude -r "이름"\` |
| 한 번만 물어보고 끝내기 | \`claude -p "질문"\` |
| 파일 내용을 넘겨 처리 | \`cat logs.txt \\| claude -p "요약해 줘"\` |
| 계획부터 세우고 시작 | \`claude --permission-mode plan\` |
| 모델 지정 | \`claude --model sonnet\` |
| 작업 폴더 추가 | \`claude --add-dir ../lib\` |
| 격리된 작업 공간에서 시작 | \`claude -w\` |
| 설치·설정 점검 | \`claude doctor\` |
| 설정이 꼬였을 때 원인 찾기 | \`claude --safe-mode\` |

${tableOf(CMD_CATS, "명령", "명령")}
${tableOf(FLAG_CATS, "플래그", "플래그")}
---

**출처:** [공식 문서 cli-reference](https://code.claude.com/docs/en/cli-reference) · 이 표는 ${today}에 공식 문서에서 자동 추출했고, 설명은 한국어로 옮긴 것입니다. 한국어 설명이 원문과 다르거나 새 항목이 보이지 않으면 원문을 기준으로 하세요. 이 표는 작성에 쓴 Claude Code 2.1.323 기준 문서이며, 내 버전에 따라 다를 수 있습니다.
`;

const outDir = path.join(root, "content", "reference");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "cli.md");
const prev = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8").match(/명령 (\d+)개와 플래그 (\d+)개/) : null;
if (prev && (nCmd < Number(prev[1]) * 0.8 || nFlag < Number(prev[2]) * 0.8)) problems.push(`항목 수 급감: 명령 ${prev[1]}→${nCmd}, 플래그 ${prev[2]}→${nFlag}`);
fs.writeFileSync(outFile, md);

console.log(`명령 ${nCmd}개, 플래그 ${nFlag}개 → content/reference/cli.md`);
for (const [id, title] of [...CMD_CATS, ...FLAG_CATS]) console.log(`  ${title}: ${byCat.get(id).length}`);
if (missing.length) console.warn(`\n⚠ 번역 없는 항목 ${missing.length}개: ${missing.join(", ")}`);
if (stale.length) console.warn(`⚠ 문서에 더는 없는 번역 키 ${stale.length}개: ${stale.join(", ")}`);
for (const p of problems) console.warn(`⚠ ${p}`);
if (STRICT && (missing.length || stale.length || problems.length)) { console.warn("strict: 사람의 검토가 필요합니다"); process.exitCode = 3; }
