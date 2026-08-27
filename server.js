const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { chromium } = require("playwright-core");
const { coverSlide, ghostSlide, bloggerSlide, ctaSlide } = require("./templates");

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.RENDER_API_KEY || ""; // impostala su Railway; se vuota, l'endpoint è aperto (sconsigliato in produzione)
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || ""; // es. https://neural-agora-carousel-production.up.railway.app
const IMG_DIR = path.join(__dirname, "img");
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

app.use("/img", express.static(IMG_DIR, { maxAge: "1h" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  }
  return browserPromise;
}

async function renderHtmlToJpeg(html, outPath) {
  const browser = await getBrowser();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  try {
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
    // Aspetta che tutte le immagini abbiano finito di caricare (o siano andate in errore),
    // così un'immagine articolo lenta o irraggiungibile non produce uno screenshot a metà.
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          })
        )
      )
    ).catch(() => {});
    await page.screenshot({ path: outPath, type: "jpeg", quality: 92 });
  } finally {
    await page.close();
  }
}

function checkAuth(req, res) {
  if (!API_KEY) return true;
  const key = req.header("x-api-key");
  if (key !== API_KEY) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}

// POST /render
// Body atteso:
// {
//   "date": "27 agosto 2026",
//   "hook_headline": "I due articoli di oggi",
//   "ghost": { "title": "...", "excerpt": "...", "image_url": "https://...", "category": "AI" },
//   "blogger": { "title": "...", "excerpt": "...", "image_url": "https://..." }
// }
app.post("/render", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const { date, hook_headline, ghost, blogger } = req.body || {};
    if (!ghost || !ghost.title || !blogger || !blogger.title) {
      return res.status(400).json({ error: "Servono almeno ghost.title e blogger.title" });
    }

    const batchId = crypto.randomBytes(6).toString("hex");
    const slides = [
      { name: "1-cover", html: coverSlide({ date, hook_headline }) },
      { name: "2-ghost", html: ghostSlide(ghost) },
      { name: "3-blogger", html: bloggerSlide(blogger, blogger.image_url) },
      { name: "4-cta", html: ctaSlide() },
    ];

    const images = [];
    for (const slide of slides) {
      const filename = `${batchId}-${slide.name}.jpg`;
      const outPath = path.join(IMG_DIR, filename);
      await renderHtmlToJpeg(slide.html, outPath);
      const base = PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
      images.push(`${base}/img/${filename}`);
    }

    // Pulizia immagini più vecchie di 48h per non riempire il disco
    cleanupOldImages();

    res.json({ ok: true, batchId, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
});

function cleanupOldImages() {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  for (const f of fs.readdirSync(IMG_DIR)) {
    const p = path.join(IMG_DIR, f);
    const stat = fs.statSync(p);
    if (stat.mtimeMs < cutoff) fs.unlinkSync(p);
  }
}

app.listen(PORT, () => {
  console.log(`Neural Agorà carousel renderer in ascolto sulla porta ${PORT}`);
});
