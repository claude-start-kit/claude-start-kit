// 공식 문서 변경 감지.
// (감시 대상은 curriculum.json 에서 "watch": true 로 표시한 레슨만입니다)
//   node tools/docs-sync.mjs --init              현재 문서 상태를 기준선으로 저장 (content/.docs-hash.json)
//   node tools/docs-sync.mjs --check             변경된 레슨을 찾아 changed.json 으로 출력 (기준선은 건드리지 않음)
//   node tools/docs-sync.mjs --accept            check 결과를 기준선에 반영 (PR 머지 전 워크플로에서 사용)
// 변경 내용이 있으면 .docs-snapshots/<id>.md 에 최신 문서 본문을 저장해 AI가 참고하게 합니다.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hashFile = path.join(root, "content", ".docs-hash.json");
const snapDir = path.join(root, ".docs-snapshots");
const mode = process.argv[2] || "--check";

const cur = JSON.parse(fs.readFileSync(path.join(root, "content", "curriculum.json"), "utf8"));
const base = fs.existsSync(hashFile) ? JSON.parse(fs.readFileSync(hashFile, "utf8")) : {};

// 공식 문서(code.claude.com)만 감시. 다른 사이트(git-scm 등)는 대상 아님.
const targets = [];
for (const lv of cur.levels) for (const c of lv.categories) for (const l of c.lessons)
  if (!l.soon && l.watch === true && l.docsUrl && l.docsUrl.startsWith("https://code.claude.com/docs")) targets.push({ id: l.id, file: l.file, url: l.docsUrl, generated: l.generated || null });

const norm = (t) => t.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
const sha = (t) => crypto.createHash("sha256").update(norm(t)).digest("hex");

async function get(url) {
  const md = url.replace(/\/$/, "") + ".md";
  const res = await fetch(md, { headers: { "User-Agent": "docs-sync/1.0" } });
  if (!res.ok) throw new Error(`${res.status} ${md}`);
  return res.text();
}

const byUrl = new Map(); // 같은 문서를 여러 레슨이 쓰면 한 번만 가져옴
const result = { checkedAt: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }), changed: [], failed: [], hashes: {} };

for (const t of targets) {
  try {
    if (!byUrl.has(t.url)) byUrl.set(t.url, await get(t.url));
    const text = byUrl.get(t.url);
    const h = sha(text);
    result.hashes[t.url] = h;
    if (mode === "--init") continue;
    if (base[t.url] && base[t.url] !== h) {
      result.changed.push({ id: t.id, file: t.file, url: t.url, generated: t.generated });
      fs.mkdirSync(snapDir, { recursive: true });
      fs.writeFileSync(path.join(snapDir, `${t.id}.md`), text);
    } else if (!base[t.url]) {
      result.failed.push({ id: t.id, url: t.url, reason: "기준선 없음 (--init 필요)" });
    }
  } catch (e) {
    result.failed.push({ id: t.id, url: t.url, reason: String(e.message) });
  }
}

if (mode === "--init" || mode === "--accept") {
  const merged = { ...base, ...result.hashes };
  fs.writeFileSync(hashFile, JSON.stringify(merged, null, 2) + "\n");
  console.log(`기준선 저장: 문서 ${Object.keys(result.hashes).length}개 → ${path.relative(root, hashFile)}`);
}

fs.writeFileSync(path.join(root, "changed.json"), JSON.stringify(result, null, 2));
console.log(`변경 ${result.changed.length}건, 실패/기준선없음 ${result.failed.length}건`);
for (const c of result.changed) console.log(`  - ${c.id}  (${c.url})`);
for (const f of result.failed) console.log(`  ! ${f.id}: ${f.reason}`);

// GitHub Actions 출력
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result.changed.length > 0}\n`);
// 문서 가져오기 실패가 있으면 비정상 종료해서 알림이 가도록 함 (--init 제외)
if (mode !== "--init" && result.failed.some((f) => f.reason !== "기준선 없음 (--init 필요)")) process.exitCode = 2;
