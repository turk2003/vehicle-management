// Render presentation/motion-graphic.html to MP4 frame by frame.
// Usage: FFMPEG=/path/to/ffmpeg node presentation/render-motion.mjs [--fps 30] [--shots 3,9,27]
//   --shots renders only PNG stills at the given seconds (for checking layout).
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const fps = Number(arg("--fps", 30));
const shots = arg("--shots");
const duration = 67;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(path.join(dir, "motion-graphic.html")).href + "?render");
await page.evaluate(() => document.fonts.ready);

const shot = (t, type = "png") =>
  page.evaluate((s) => window.seek(s), t).then(() =>
    page.screenshot({ type, ...(type === "jpeg" ? { quality: 92 } : {}) }),
  );

if (shots) {
  for (const t of shots.split(",").map(Number)) {
    await page.evaluate((s) => window.seek(s), t);
    await page.screenshot({ path: path.join(dir, `still-${t}.png`) });
  }
} else {
  const out = path.join(dir, "motion-graphic.mp4");
  const ff = spawn(process.env.FFMPEG || "ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
    "-movflags", "+faststart", out,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(duration * fps);
  for (let f = 0; f < total; f++) {
    const buf = await shot(f / fps, "jpeg");
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % fps === 0) process.stdout.write(`\r${(f / fps).toFixed(0)}s / ${duration}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`\nwrote ${out}`);
}
await browser.close();
