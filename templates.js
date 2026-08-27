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

// Slide 2 — Articolo Ghost (neuralagora.com), stile vino/oro
function ghostSlide({ title, excerpt, image_url, category }) {
  const style = `
  .slide { width: 1080px; height: 1350px; background: #2A121D; display: flex; flex-direction: column; }
  .imgwrap { position: relative; width: 1080px; height: 760px; background: #D4A64A; }
  .imgwrap img { width: 100%; height: 100%; object-fit: cover; }
  .tag { position: absolute; top: 40px; left: 40px; background: #2A121D; color: #D4A64A; font-size: 26px; padding: 10px 26px; border-radius: 999px; letter-spacing: 0.04em; }
  .content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 56px 70px; }
  .title { color: #D4A64A; font-size: 66px; line-height: 1.08; font-weight: 700; margin-bottom: 28px; }
  .excerpt { color: #f5f0e6; font-size: 34px; line-height: 1.4; margin-bottom: 34px; }
  .site { color: #b28e5f; font-size: 28px; letter-spacing: 0.04em; }
  `;
  return page(`
  <div class="slide">
  <div class="imgwrap">
  <img src="${escapeHtml(image_url)}" onerror="this.style.display='none'" />
  ${category ? `<div class="tag">${escapeHtml(category)}</div>` : ""}
  </div>
  <div class="content">
  <div class="title serif">${escapeHtml(truncate(title, 80))}</div>
  <div class="excerpt">${escapeHtml(truncate(excerpt, 140))}</div>
  <div class="site">neuralagora.com</div>
  </div>
  </div>
  `, style);
}

// Slide 3 — Articolo Blogger (blog.neuralagora.com), stile crema
function bloggerSlide({ title, excerpt }, image_url) {
  const style = `
  .slide { width: 1080px; height: 1350px; background: #E6DCC6; display: flex; flex-direction: column; }
  .header { display: flex; align-items: center; gap: 16px; padding: 56px 70px 0 70px; }
  .dot { width: 34px; height: 34px; border-radius: 50%; background: #2A121D; }
  .brand { color: #2A121D; font-size: 32px; font-weight: 600; }
  .title { color: #2A121D; font-size: 58px; line-height: 1.12; font-weight: 700; padding: 24px 70px 0 70px; }
  .imgwrap { width: 1080px; height: 560px; margin-top: 40px; }
  .imgwrap img { width: 100%; height: 100%; object-fit: cover; }
  .footer { flex: 1; display: flex; align-items: center; border-top: 4px solid #2A121D; padding: 0 70px; }
  .footer .col { flex: 1; color: #2A121D; font-size: 27px; line-height: 1.3; }
  .footer .col + .col { border-left: 4px solid #2A121D; padding-left: 40px; margin-left: 40px; }
  `;
  return page(`
  <div class="slide">
  <div class="header">
  <div class="dot"></div>
  <div class="brand">Neural Agora</div>
  </div>
  <div class="title serif">${escapeHtml(truncate(title, 80))}</div>
  <div class="imgwrap"><img src="${escapeHtml(image_url)}" onerror="this.style.display='none'" /></div>
  <div class="footer">
  <div class="col">${escapeHtml(truncate(excerpt, 60))}</div>
  <div class="col">Visita<br>blog.neuralagora.com</div>
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

module.exports = { coverSlide, ghostSlide, bloggerSlide, ctaSlide, truncate, escapeHtml };
