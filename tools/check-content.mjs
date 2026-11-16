// 콘텐츠 점검: node tools/check-content.mjs
// - 목차(curriculum.json)의 레슨 파일이 모두 있는지
// - 레슨 안의 이미지 경로가 실제로 있는지
// - 레슨 안의 내부 링크(#/단계/레슨)가 목차에 있는지
// - 레슨 id 중복, 목차에 없는 .md 파일(고아 파일)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cur = JSON.parse(fs.readFileSync(path.join(root, "content", "curriculum.json"), "utf8"));
const errors = [];
const ids = new Set();
const routes = new Set();
const files = new Set();

for (const lv of cur.levels)
  for (const cat of lv.categories)
    for (const l of cat.lessons) {
      if (l.soon) { if (routes.has(`${lv.id}/${l.id}`)) errors.push(`중복 id: ${lv.id}/${l.id}`); routes.add(`${lv.id}/${l.id}`); continue; } // 준비 중 레슨은 파일 없이 목차에만 둠
      const key = `${lv.id}/${l.id}`;
      if (routes.has(key)) errors.push(`중복 id: ${key}`);
      routes.add(key);
      files.add(l.file.replace(/\\/g, "/"));
      ids.add(l.id);
    }

let lessonCount = 0, imageCount = 0;
for (const lv of cur.levels)
  for (const cat of lv.categories)
    for (const l of cat.lessons) {
      if (l.soon) continue;
      const p = path.join(root, l.file);
      if (!fs.existsSync(p)) { errors.push(`레슨 파일 없음: ${l.file}`); continue; }
      lessonCount++;
      const md = fs.readFileSync(p, "utf8");
      if (lv.kind !== "reference" && !l.minutes) errors.push(`minutes 없음: ${l.id}`);
      if (lv.kind !== "reference" && !l.prompt) errors.push(`prompt 없음: ${l.id}`);
      for (const m of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
        imageCount++;
        if (!fs.existsSync(path.join(root, m[1]))) errors.push(`${l.file}: 이미지 없음 → ${m[1]}`);
      }
      for (const m of md.matchAll(/\]\(#\/([^)]+)\)/g))
        if (!routes.has(m[1])) errors.push(`${l.file}: 잘못된 내부 링크 → #/${m[1]}`);
    }

// 목차에 없는 md
for (const dir of ["level1", "level2", "level3", "reference"]) {
  const d = path.join(root, "content", dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d))
    if (f.endsWith(".md") && !files.has(`content/${dir}/${f}`)) errors.push(`목차에 없는 파일: content/${dir}/${f}`);
}

console.log(`레슨 ${lessonCount}개, 이미지 참조 ${imageCount}개 점검`);
if (errors.length) { console.log("문제 " + errors.length + "건:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("문제 없음 ✔");
