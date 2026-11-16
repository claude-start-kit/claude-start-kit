// 실제로 명령을 실행하고, 그 결과를 터미널 모양 PNG로 저장합니다.
// 사용법: node tools/make-shots.mjs            (tools/shots.json 의 모든 작업)
//         node tools/make-shots.mjs install-check  (이름이 일치하는 작업만)
// 요구: Windows + Chrome(또는 Edge). 개인 경로는 displayCwd 로 치환되어 이미지에 노출되지 않습니다.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jobs = JSON.parse(fs.readFileSync(path.join(root, "tools", "shots.json"), "utf8"));
const only = process.argv[2];
const outDir = path.join(root, "assets", "img", "shots");
fs.mkdirSync(outDir, { recursive: true });

const browser = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => fs.existsSync(p));
if (!browser) throw new Error("Chrome 또는 Edge를 찾을 수 없습니다.");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function run(cmd, cwd) {
  try {
    const out = execFileSync(
      "powershell.exe",
      ["-NoProfile", "-Command", `[Console]::OutputEncoding=[Text.Encoding]::UTF8; ${cmd}`],
      { cwd, encoding: "utf8", timeout: 180000, stdio: ["ignore", "pipe", "pipe"] }
    );
    return out.replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "");
  } catch (e) {
    return ((e.stdout || "") + (e.stderr || "") || String(e.message)).replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "");
  }
}

for (const job of jobs) {
  if (only && job.name !== only) continue;
  const shortCwd = path.join(os.tmpdir(), "cskit-demo", job.demoDir || "test-project");
  if (job.clean) fs.rmSync(shortCwd, { recursive: true, force: true }); // 매번 깨끗한 실습 폴더에서 시작
  fs.mkdirSync(shortCwd, { recursive: true });
  const realCwd = fs.realpathSync.native(shortCwd); // 8.3 단축 경로 → 긴 경로
  for (const f of job.demoFiles || []) fs.writeFileSync(path.join(realCwd, f), "demo\n");

  const home = fs.realpathSync.native(os.homedir());
  for (const d of job.cleanDirs || []) fs.rmSync(path.join(path.dirname(realCwd), d), { recursive: true, force: true });
  const fwd = (p) => p.replace(/\\/g, "/");
  const demoRoot = path.dirname(realCwd), demoRootShort = path.dirname(shortCwd);
  const sanitize = (t) =>
    t.split(realCwd).join(job.displayCwd).split(shortCwd).join(job.displayCwd)
      .split(fwd(demoRoot)).join("C:/Users/me").split(fwd(demoRootShort)).join("C:/Users/me")
      .split(demoRoot).join("C:\\Users\\me").split(demoRootShort).join("C:\\Users\\me")
      .split(fwd(realCwd)).join(fwd(job.displayCwd)).split(fwd(shortCwd)).join(fwd(job.displayCwd))
      .split(home).join("C:\\Users\\me").split(fwd(home)).join("C:/Users/me");

  let lines = [];
  for (const step of job.steps) {
    if (step.hide) { run(step.cmd, realCwd); continue; }
    if (step.fake !== undefined) { // 실제로 실행하지 않고 보여 줄 화면만 지정 (폴더 생성·claude 실행 등)
      lines.push(`<div><span class="p">PS ${esc(step.at || job.displayCwd)}&gt;</span> <span class="c">${esc(step.cmd)}</span></div>`);
      if (step.fake) lines.push(`<div class="o">${esc(step.fake)}</div>`);
      continue;
    } // 준비용 명령: 실행만 하고 화면에는 표시하지 않음
    lines.push(`<div><span class="p">PS ${esc(job.displayCwd)}&gt;</span> <span class="c">${esc(step.display || step.cmd)}</span></div>`);
    const out = sanitize(run(step.cmd, realCwd));
    if (out) lines.push(`<div class="o">${esc(out)}</div>`);
  }
  if (job.endPrompt !== false) lines.push(`<div><span class="p">PS ${esc(job.displayCwd)}&gt;</span> <span class="cur"></span></div>`);

  const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#0d1017;font-family:Consolas,'Malgun Gothic',monospace;}
  .win{margin:16px;border:1px solid #343c52;border-radius:12px;overflow:hidden;background:#0b0e14;width:${job.width || 860}px}
  .bar{background:#222838;padding:9px 14px;display:flex;gap:8px;align-items:center;color:#8b93a7;font:13px 'Malgun Gothic',sans-serif}
  .ico{font:700 10px Consolas,monospace;color:#c9d1e3;background:#2f3a52;border:1px solid #8b93a7;border-radius:3px;padding:1px 3px}
  .wb{width:34px;text-align:center;color:#c9d1e3;font-size:13px}
  .body{padding:16px 18px;font-size:16px;line-height:1.55;color:#c9d1e3;white-space:pre-wrap;word-break:break-all}
  .p{color:#7ee2a8}.c{color:#ffd9c8}.o{margin:2px 0 10px}
  .cur{display:inline-block;width:9px;height:17px;background:#ff8a5c;vertical-align:middle}
  </style><script>addEventListener("load",()=>{document.body.dataset.h=Math.ceil(document.querySelector(".win").getBoundingClientRect().height)+32})</script><div class="win"><div class="bar"><span class="ico">&gt;_</span><span style="flex:1;color:#c9d1e3">${esc(job.title || "Windows PowerShell")}</span><span class="wb">&#x2500;</span><span class="wb">&#x25A1;</span><span class="wb">&#x2715;</span></div><div class="body">${lines.join("")}</div></div>`;

  const tmp = path.join(os.tmpdir(), `cskit-${job.name}.html`);
  fs.writeFileSync(tmp, html);
  const out = path.join(outDir, `${job.name}.png`);
  // 1) 실제 높이 측정  2) 그 높이로 캡처 (아래 여백 제거)
  const dom = execFileSync(browser, [
    "--headless=new", "--disable-gpu", `--user-data-dir=${path.join(os.tmpdir(), "cskit-chrome")}`,
    `--window-size=${(job.width || 860) + 32},2000`, "--virtual-time-budget=2000", "--dump-dom", pathToFileURL(tmp).href,
  ], { encoding: "utf8" });
  const m = dom.match(/data-h="(\d+)"/);
  const height = job.height || (m ? Number(m[1]) : 400);
  execFileSync(browser, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    `--user-data-dir=${path.join(os.tmpdir(), "cskit-chrome")}`,
    `--window-size=${(job.width || 860) + 32},${height}`,
    `--screenshot=${out}`, pathToFileURL(tmp).href,
  ], { stdio: "ignore" });
  console.log("생성:", path.relative(root, out));
}
