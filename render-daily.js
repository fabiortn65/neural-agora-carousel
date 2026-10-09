// Eseguito dalla GitHub Action ad ogni "repository_dispatch" (o manualmente).
// Legge i dati del giorno da process.env.PAYLOAD (JSON), genera le 4 slide
// e le salva con nome fisso in docs/img/, cosi l'URL pubblico (GitHub Pages)
// non cambia mai e Make non deve indovinare un nome file diverso ogni giorno.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const { coverSlide, coverSlideVideo, ghostSlide, bloggerSlide, ctaSlide, reelVideo, REEL_TOTAL } = require("./templates");

const OUT_DIR = path.join(__dirname, "docs", "img");

// Colonna sonora fissa del reel, scelta da Fabio: "Classical - Classical Song"
// di The_Mountain (Pixabay Music, royalty-free). Scaricata ad ogni run
// direttamente dalla CDN Pixabay: il runner di GitHub Actions ha accesso di
// rete pieno (a differenza del container dell'assistente), quindi non serve
// commitare il file nel repo.
const REEL_AUDIO_URL = "https://cdn.pixabay.com/audio/2026/06/09/audio_bc5cc02744.mp3";

// Scarica la traccia audio e la mixa sotto il video già renderizzato: la
// taglia alla durata esatta del reel, al 30% di volume (resta di sottofondo,
// non deve coprire l'attenzione sul testo animato) con un fade-in di 1.5s
// all'inizio e un fade-out di 2s alla fine cosi' non si interrompe di netto.
// Il video resta invariato (-c:v copy), solo l'audio viene codificato in AAC.
async function addSoundtrack(videoPath, audioUrl, durationSec) {
  const tmpAudio = path.join(os.tmpdir(), `reel-audio-${Date.now()}.mp3`);
  const tmpOut = `${videoPath}.withaudio.mp4`;
  try {
    execFileSync("curl", ["-sS", "-L", "--fail", "-o", tmpAudio, audioUrl], { stdio: "inherit" });
    const fadeOutStart = Math.max(0, durationSec - 2);
    execFileSync("ffmpeg", [
      "-y",
      "-i", videoPath,
      "-i", tmpAudio,
      "-filter_complex",
      `[1:a]atrim=0:${durationSec.toFixed(2)},afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=2,volume=0.3[a]`,
      "-map", "0:v",
      "-map", "[a]",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "128k",
      "-shortest",
      tmpOut,
    ], { stdio: "inherit" });
    fs.renameSync(tmpOut, videoPath);
  } finally {
    fs.rmSync(tmpAudio, { force: true });
    fs.rmSync(tmpOut, { force: true });
  }
}

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
async function renderVideo(browser, html, outPath, durationMs = 4500, size = { width: 1080, height: 1350 }) {
  const videoDir = fs.mkdtempSync(path.join(os.tmpdir(), "carousel-video-"));
  const context = await browser.newContext({
    viewport: size,
    recordVideo: { dir: videoDir, size },
  });
  const pageCreatedAt = Date.now();
  const page = await context.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    // Playwright comincia a registrare dalla creazione della pagina, non da
    // qui: il tempo speso ad aspettare "networkidle" (font Google, immagini
    // di sfondo) e' gia' incluso nel video. Le animazioni CSS partono anch'esse
    // da quell'istante (animation-duration assoluta), quindi a questo punto
    // sono gia' "avanti" di networkWaitMs. Aspettiamo solo quanto manca per
    // arrivare alla durata totale voluta, cosi' il video non si allunga di
    // un tempo di rete imprevedibile (visto fino a +7s sul reel in test).
    // La successiva -t in ffmpeg e' una seconda rete di sicurezza.
    const networkWaitMs = Date.now() - pageCreatedAt;
    await page.waitForTimeout(Math.max(0, durationMs - networkWaitMs));
    const video = page.video();
    await page.close();
    const webmPath = await video.path();
    execFileSync("ffmpeg", [
      "-y",
      "-i", webmPath,
      "-t", (durationMs / 1000).toFixed(2),
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

    // Reel verticale 9:16 con tipografia cinetica (titolo/estratto animati) e
    // Ken Burns sulle foto dei due articoli — vedi templates.js (reelVideo)
    // per la timeline completa delle 4 scene.
    const reelDurationSec = REEL_TOTAL + 0.3;
    await renderVideo(
      browser,
      reelVideo({ date: data.date, hook_headline: data.hook_headline, ghost, blogger }),
      path.join(OUT_DIR, "reel.mp4"),
      Math.round(reelDurationSec * 1000),
      { width: 1080, height: 1920 }
    );
  } finally {
    await browser.close();
  }

  // Colonna sonora: mixata dopo aver chiuso il browser (non serve Playwright).
  await addSoundtrack(path.join(OUT_DIR, "reel.mp4"), REEL_AUDIO_URL, REEL_TOTAL + 0.3);

 console.log("Slide generate in", OUT_DIR);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
