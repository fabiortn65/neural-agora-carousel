// Eseguito dalla GitHub Action ad ogni "repository_dispatch" (o manualmente).
// Legge i dati del giorno da process.env.PAYLOAD (JSON), genera le 4 slide
// e le salva con nome fisso in docs/img/, cosi l'URL pubblico (GitHub Pages)
// non cambia mai e Make non deve indovinare un nome file diverso ogni giorno.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const { coverSlide, coverSlideVideo, ghostSlide, bloggerSlide, ctaSlide } = require("./templates");

const OUT_DIR = path.join(__dirname, "docs", "img");

function readPayload() {
  const raw = process.env.PAYLOAD;
  if (!raw || raw === "null" || raw.trim() === "") {
    throw new Error(
      "PAYLOAD mancante o vuoto. Attesa una stringa JSON con { date, hook_headline, ghost_title, ghost_excerpt, ghost_image, ghost_category, blogger_title, blogger_excerpt, blogger_image }."
      );
  }
  return JSON.parse(raw);
}

async function renderOne(browser, html, outPath) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    await page
    .evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
                                        ? Promise.resolve()
          : new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          })
                                        )
        )
              )
    .catch(() => {});
    await page.screenshot({ path: outPath, type: "jpeg", quality: 92 });
  } finally {
    await page.close();
  }
}

// Cattura l'animazione CSS della copertina come video e lo converte in mp4
// (H264, 1080x1350, sotto i 5Mbps richiesti da Instagram per i video nel
// carosello). cover.jpg statico resta invariato per Facebook.
async function renderVideo(browser, html, outPath, durationMs = 4500) {
  const videoDir = fs.mkdtempSync(path.join(os.tmpdir(), "carousel-video-"));
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    recordVideo: { dir: videoDir, size: { width: 1080, height: 1350 } },
  });
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(durationMs);
    const video = page.video();
    await page.close();
    const webmPath = await video.path();
    execFileSync("ffmpeg", [
      "-y",
      "-i", webmPath,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-profile:v", "high",
      "-movflags", "+faststart",
      "-vf", "fps=30",
      "-b:v", "3M",
      "-maxrate", "4M",
      "-bufsize", "6M",
      outPath,
    ], { stdio: "inherit" });
  } finally {
    await context.close();
    fs.rmSync(videoDir, { recursive: true, force: true });
  }
}

(async () => {
  const data = readPayload();
  fs.mkdirSync(OUT_DIR, { recursive: true });

 const ghost = {
   title: data.ghost_title,
   excerpt: data.ghost_excerpt,
   image_url: data.ghost_image,
   category: data.ghost_category,
 };
  const blogger = {
    title: data.blogger_title,
    excerpt: data.blogger_excerpt,
    image_url: data.blogger_image,
  };

 if (!ghost.title || !blogger.title) {
   throw new Error("Servono almeno ghost_title e blogger_title nel payload.");
 }

 const browser = await chromium.launch({
   executablePath: process.env.TEST_CHROMIUM_PATH || undefined,
   args: ["--no-sandbox", "--disable-dev-shm-usage"],
 });
  try {
    await renderOne(browser, coverSlide({ date: data.date, hook_headline: data.hook_headline }), path.join(OUT_DIR, "cover.jpg"));
    await renderVideo(browser, coverSlideVideo({ date: data.date, hook_headline: data.hook_headline }), path.join(OUT_DIR, "cover.mp4"));
    await renderOne(browser, ghostSlide(ghost), path.join(OUT_DIR, "ghost.jpg"));
    await renderOne(browser, bloggerSlide(blogger, blogger.image_url), path.join(OUT_DIR, "blogger.jpg"));
    await renderOne(browser, ctaSlide(), path.join(OUT_DIR, "cta.jpg"));
  } finally {
    await browser.close();
  }

 console.log("Slide generate in", OUT_DIR);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
