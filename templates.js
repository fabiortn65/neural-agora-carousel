// Template HTML per le 4 slide del carosello Instagram giornaliero di Neural Agora.
// Dimensioni: 1080x1350 (formato 4:5, ideale per il feed Instagram).
// Palette Ghost (neuralagora.com): vino scuro #2A121D + oro #D4A64A
// Palette Blogger (blog.neuralagora.com): crema #E6DCC6 + testo vino scuro #2A121D

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
`;

const BASE_STYLE = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1350px; overflow: hidden; }
body { font-family: 'Inter', sans-serif; }
.serif { font-family: 'Playfair Display', serif; }
`;

function truncate(text, max) {
  if (!text) return "";
  const clean = String(text).trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function page(bodyContent, extraStyle = "") {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
  <style>${BASE_STYLE}${extraStyle}</style></head><body>${bodyContent}</body></html>`;
}

// Slide 1 — Copertina / hook del giorno
function coverSlide({ date, hook_headline }) {
  const style = `
  .cover { width: 1080px; height: 1350px; background: #2A121D; display: flex; flex-direction: column; align-items: center; padding: 80px 90px; }
  .header { text-align: center; }
  .kicker { color: #e8c8a5; font-size: 24px; letter-spacing: 0.05em; margin-bottom: 18px; }
  .wordmark { color: #b28e5f; font-size: 64px; letter-spacing: 0.25em; text-transform: uppercase; }
  .middle { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hook { color: #e8c8a5; font-size: 84px; line-height: 1.15; text-align: center; font-weight: 700; }
  .rule { width: 260px; height: 2px; background: #b28e5f; margin-top: 36px; }
  `;
  return page(`
  <div class="cover">
  <div class="header">
  <div class="kicker">${escapeHtml(date)}</div>
  <div class="wordmark serif">Neural Agora</div>
  </div>
  <div class="middle">
  <div class="hook serif">${escapeHtml(truncate(hook_headline, 90))}</div>
  <div class="rule"></div>
  </div>
  </div>
  `, style);
}

// Slide 1 (variante video) — stessa copertina, ma con un piccolo reveal
// animato via CSS: usata solo per catturare cover.mp4 (render-daily.js).
// cover.jpg resta lo screenshot statico di coverSlide(), invariato, perche'
// serve a Facebook che non accetta video nel post multi-foto.
function coverSlideVideo({ date, hook_headline }) {
  const words = escapeHtml(truncate(hook_headline, 90)).split(" ").filter(Boolean);
  const wordSpans = words
    .map((w, i) => `<span class="word" style="animation-delay:${(0.9 + i * 0.09).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");
  const ruleDelay = (0.9 + words.length * 0.09 + 0.35).toFixed(2);
  const style = `
  .cover { width: 1080px; height: 1350px; background: #2A121D; display: flex; flex-direction: column; align-items: center; padding: 80px 90px; position: relative; overflow: hidden; }
  .glow {
    position: absolute; top: 50%; left: 50%; width: 1400px; height: 1400px; margin: -700px 0 0 -700px;
    background: radial-gradient(circle, rgba(212,166,74,0.16) 0%, rgba(212,166,74,0) 62%);
    animation: pulse 4.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.08); opacity: 1; } }
  .header { text-align: center; opacity: 0; animation: fadeDown .7s ease-out forwards .15s; position: relative; z-index: 1; }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  .kicker { color: #e8c8a5; font-size: 24px; letter-spacing: 0.05em; margin-bottom: 18px; }
  .wordmark { color: #b28e5f; font-size: 64px; letter-spacing: 0.25em; text-transform: uppercase; }
  .middle { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 1; }
  .hook { color: #e8c8a5; font-size: 84px; line-height: 1.15; text-align: center; font-weight: 700; }
  .hook .word { display: inline-block; opacity: 0; transform: translateY(28px); animation: wordUp .6s cubic-bezier(.2,.8,.2,1) forwards; }
  @keyframes wordUp { to { opacity: 1; transform: translateY(0); } }
  .rule { width: 0; height: 2px; background: #b28e5f; margin-top: 36px; animation: growRule .7s ease-out forwards ${ruleDelay}s; }
  @keyframes growRule { to { width: 260px; } }
  `;
  return page(`
  <div class="cover">
  <div class="glow"></div>
  <div class="header">
  <div class="kicker">${escapeHtml(date)}</div>
  <div class="wordmark serif">Neural Agora</div>
  </div>
  <div class="middle">
  <div class="hook serif">${wordSpans}</div>
  <div class="rule"></div>
  </div>
  </div>
  `, style);
}

// Slide 2 — Articolo Ghost (neuralagora.com), stile vino/oro
// Foto a piena pagina con scrim scuro in basso: titolo ed estratto sono
// sovrapposti direttamente alla foto (non più in un blocco separato sotto).
function ghostSlide({ title, excerpt, image_url, category }) {
  const style = `
  .slide { width: 1080px; height: 1350px; position: relative; background: #2A121D; overflow: hidden; }
  .photo { position: absolute; inset: 0; width: 1080px; height: 1350px; object-fit: cover; }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      rgba(42,18,29,0.10) 0%, rgba(42,18,29,0.12) 34%,
      rgba(42,18,29,0.74) 60%, rgba(42,18,29,0.97) 100%);
  }
  .tag { position: absolute; top: 48px; left: 48px; background: #2A121D; color: #D4A64A; font-size: 26px; padding: 10px 26px; border-radius: 999px; letter-spacing: 0.04em; }
  .content { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 70px 64px 70px; }
  .title { color: #D4A64A; font-size: 64px; line-height: 1.1; font-weight: 700; margin-bottom: 26px; }
  .excerpt { color: #f5f0e6; font-size: 32px; line-height: 1.42; margin-bottom: 28px; }
  .site { color: #e8c8a5; font-size: 27px; letter-spacing: 0.04em; }
  `;
  return page(`
  <div class="slide">
  <img class="photo" src="${escapeHtml(image_url)}" onerror="this.style.display='none'" />
  <div class="scrim"></div>
  ${category ? `<div class="tag">${escapeHtml(category)}</div>` : ""}
  <div class="content">
  <div class="title serif">${escapeHtml(truncate(title, 80))}</div>
  <div class="excerpt">${escapeHtml(truncate(excerpt, 140))}</div>
  <div class="site">neuralagora.com</div>
  </div>
  </div>
  `, style);
}

// Slide 3 — Articolo Blogger (blog.neuralagora.com), stile crema
// Stessa idea della slide Ghost ma speculare: scrim chiaro/crema in basso
// con testo scuro sopra, cosi la foto resta a piena pagina ma l'identita
// visiva crema resta distinguibile da quella vino/oro di Ghost.
function bloggerSlide({ title, excerpt }, image_url) {
  const style = `
  .slide { width: 1080px; height: 1350px; position: relative; background: #E6DCC6; overflow: hidden; }
  .photo { position: absolute; inset: 0; width: 1080px; height: 1350px; object-fit: cover; }
  .scrim {
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      rgba(230,220,198,0.08) 0%, rgba(230,220,198,0.10) 34%,
      rgba(230,220,198,0.80) 60%, rgba(230,220,198,0.96) 100%);
  }
  .brand { position: absolute; top: 44px; left: 44px; display: flex; align-items: center; gap: 14px; background: rgba(230,220,198,0.92); padding: 12px 26px 12px 18px; border-radius: 999px; }
  .dot { width: 30px; height: 30px; border-radius: 50%; background: #2A121D; }
  .brandtext { color: #2A121D; font-size: 28px; font-weight: 600; }
  .content { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 70px 64px 70px; }
  .title { color: #2A121D; font-size: 58px; line-height: 1.14; font-weight: 700; margin-bottom: 24px; }
  .excerpt { color: #4a352c; font-size: 30px; line-height: 1.4; margin-bottom: 26px; }
  .site { color: #723535; font-size: 27px; letter-spacing: 0.04em; }
  `;
  return page(`
  <div class="slide">
  <img class="photo" src="${escapeHtml(image_url)}" onerror="this.style.display='none'" />
  <div class="scrim"></div>
  <div class="brand"><div class="dot"></div><div class="brandtext">Neural Agora</div></div>
  <div class="content">
  <div class="title serif">${escapeHtml(truncate(title, 80))}</div>
  <div class="excerpt">${escapeHtml(truncate(excerpt, 110))}</div>
  <div class="site">blog.neuralagora.com</div>
  </div>
  </div>
  `, style);
}

// Slide 4 — CTA finale, split wine/cream
function ctaSlide() {
  const style = `
  .slide { width: 1080px; height: 1350px; display: flex; }
  .half { width: 540px; height: 1350px; }
  .wine { background: #2A121D; }
  .cream { background: #E6DCC6; }
  .center { position: absolute; top: 565px; left: 0; width: 1080px; text-align: center; }
  .wordmark { font-size: 84px; letter-spacing: 0.02em; }
  .wordmark .n { color: #d8a85b; }
  .wordmark .a { color: #723535; }
  .cta { font-size: 46px; font-style: italic; margin-top: 24px; }
  .cta .in { color: #f8d8c4; }
  .cta .bio { color: #723535; }
  .foot { font-size: 26px; margin-top: 380px; color: #d8a85b; }
  .foot .sep { color: #723535; }
  .wrap { position: relative; width: 1080px; height: 1350px; }
  `;
  return page(`
  <div class="wrap">
  <div class="slide">
  <div class="half wine"></div>
  <div class="half cream"></div>
  </div>
  <div class="center">
  <div class="wordmark serif"><span class="n">NEURAL</span><span class="a">AGORA</span></div>
  <div class="cta serif"><span class="in">Link in</span><span class="bio"> bio</span></div>
  <div class="foot serif">neuralagora.com<span class="sep"> · </span>blog.neuralagora.com</div>
  </div>
  </div>
  `, style);
}

module.exports = { coverSlide, coverSlideVideo, ghostSlide, bloggerSlide, ctaSlide, truncate, escapeHtml };
