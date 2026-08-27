const path = require("path");
const { chromium } = require("playwright-core");
const { coverSlide, ghostSlide, bloggerSlide, ctaSlide } = require("./templates");

// In sandbox di test l'accesso a host immagine esterni (Unsplash ecc.) è bloccato dal firewall
// dell'ambiente: uso un'immagine inline (data URI) solo per verificare che il caricamento/layout
// funzioni. In produzione su Railway le vere image_url di Ghost/Blogger saranno raggiungibili.
const fs = require("fs");
const TEST_IMG_1 = "data:image/svg+xml;base64," + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#5b3a29"/><circle cx="900" cy="200" r="180" fill="#8a5a3a"/><circle cx="300" cy="600" r="220" fill="#3a2418"/></svg>`
).toString("base64");
const TEST_IMG_2 = "data:image/svg+xml;base64," + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#c9a876"/><rect x="0" y="500" width="1200" height="300" fill="#8a6a3a"/></svg>`
).toString("base64");
const TEST_IMG_BROKEN = "https://example-domain-that-does-not-resolve.invalid/photo.jpg";

const sample = {
  date: "27 agosto 2026",
  hook_headline: "I due articoli di oggi: AI e mobilità elettrica",
  ghost: {
    title: "I nuovi modelli linguistici stanno cambiando il modo in cui scriviamo codice",
    excerpt: "Un'analisi di come gli assistenti AI stanno trasformando il lavoro degli sviluppatori italiani.",
    image_url: TEST_IMG_1,
    category: "AI",
  },
  blogger: {
    title: "Colonnine di ricarica: la mappa dell'Italia nel 2026",
    excerpt: "Dove si trovano e come funzionano.",
    image_url: TEST_IMG_BROKEN, // testa apposta il fallback per immagine irraggiungibile
  },
};

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.TEST_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const slides = [
    ["1-cover", coverSlide(sample)],
    ["2-ghost", ghostSlide(sample.ghost)],
    ["3-blogger", bloggerSlide(sample.blogger, sample.blogger.image_url)],
    ["4-cta", ctaSlide()],
  ];
  for (const [name, html] of slides) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
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
    const outPath = path.join(__dirname, "img", `test-${name}.jpg`);
    await page.screenshot({ path: outPath, type: "jpeg", quality: 92 });
    console.log("Salvato:", outPath);
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
