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

// Reel verticale 1080x1920 (9:16) con tipografia cinetica e Ken Burns sulle
// foto dei due articoli. Un'unica pagina HTML con 4 "scene" sovrapposte
// (copertina, Ghost, Blogger, CTA), ciascuna con la propria animazione di
// opacità sincronizzata su una timeline assoluta (stessa logica di
// coverSlideVideo, estesa all'intero reel). Catturata come video da
// render-daily.js con Playwright recordVideo + ffmpeg, durata REEL_TOTAL.
//
// Timeline (secondi dall'inizio del video):
//   0.0 – 2.8   copertina ferma (hook_headline in reveal parola per parola)
//   2.8 – 3.2   dissolvenza verso Ghost
//   3.2 – 12.8  slide Ghost (Ken Burns + titolo cinetico + estratto)
//  12.8 – 13.2  dissolvenza verso Blogger
//  13.2 – 22.8  slide Blogger (stesso trattamento, palette crema)
//  22.8 – 23.2  dissolvenza verso CTA
//  23.2 – 27.6  CTA finale ferma
const REEL_T = {
  coverStart: 0, coverFadeStart: 2.8, coverEnd: 3.2,
  ghostFadeInEnd: 3.2, ghostHoldEnd: 12.8, ghostFadeOutEnd: 13.2,
  bloggerFadeInEnd: 13.2, bloggerHoldEnd: 22.8, bloggerFadeOutEnd: 23.2,
  ctaFadeInEnd: 23.2, total: 27.6,
};
const REEL_TOTAL = REEL_T.total;

function pct(t) {
  return `${((t / REEL_TOTAL) * 100).toFixed(4)}%`;
}

function reelVideo({ date, hook_headline, ghost, blogger }) {
  const T = REEL_T;
  const hookWords = escapeHtml(truncate(hook_headline, 90)).split(" ").filter(Boolean);
  const hookSpans = hookWords
    .map((w, i) => `<span class="rv-word" style="animation-delay:${(0.5 + i * 0.09).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");

  const ghostTitle = escapeHtml(truncate(ghost.title, 70));
  const ghostWords = ghostTitle.split(" ").filter(Boolean);
  const ghostWordStart = T.ghostFadeInEnd + 0.15;
  const ghostWordSpans = ghostWords
    .map((w, i) => `<span class="rv-word" style="animation-delay:${(ghostWordStart + i * 0.07).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");
  const ghostExcerptDelay = (ghostWordStart + ghostWords.length * 0.07 + 0.25).toFixed(2);
  const ghostTagDelay = (T.ghostFadeInEnd + 0.05).toFixed(2);

  const bloggerTitle = escapeHtml(truncate(blogger.title, 70));
  const bloggerWords = bloggerTitle.split(" ").filter(Boolean);
  const bloggerWordStart = T.bloggerFadeInEnd + 0.15;
  const bloggerWordSpans = bloggerWords
    .map((w, i) => `<span class="rv-word" style="animation-delay:${(bloggerWordStart + i * 0.07).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");
  const bloggerExcerptDelay = (bloggerWordStart + bloggerWords.length * 0.07 + 0.25).toFixed(2);
  const bloggerBrandDelay = (T.bloggerFadeInEnd + 0.05).toFixed(2);

  const style = `
  html, body { width: 1080px; height: 1920px; background: #2A121D; }
  .rv-scene { position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: hidden; }
  .rv-word { display: inline-block; opacity: 0; transform: translateY(26px); animation-name: rvWordUp; animation-duration: .6s; animation-timing-function: cubic-bezier(.2,.8,.2,1); animation-fill-mode: forwards; }
  @keyframes rvWordUp { to { opacity: 1; transform: translateY(0); } }
  @keyframes rvFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

  /* --- Scena 1: copertina --- */
  .rv-cover { background: #2A121D; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 90px; animation: rvCoverOpac ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvCoverOpac {
    0% { opacity: 1; } ${pct(T.coverFadeStart)} { opacity: 1; } ${pct(T.coverEnd)} { opacity: 0; } 100% { opacity: 0; }
  }
  .rv-glow { position: absolute; top: 50%; left: 50%; width: 1500px; height: 1500px; margin: -750px 0 0 -750px; background: radial-gradient(circle, rgba(212,166,74,0.16) 0%, rgba(212,166,74,0) 62%); animation: rvPulse 4.5s ease-in-out infinite; }
  @keyframes rvPulse { 0%, 100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.08); opacity: 1; } }
  .rv-kicker { color: #e8c8a5; font-size: 26px; letter-spacing: 0.05em; margin-bottom: 20px; text-align: center; opacity: 0; animation: rvFadeUp .7s ease-out forwards .1s; }
  .rv-wordmark { color: #b28e5f; font-size: 60px; letter-spacing: 0.22em; text-transform: uppercase; text-align: center; margin-bottom: 90px; opacity: 0; animation: rvFadeUp .7s ease-out forwards .1s; }
  .rv-hook { color: #e8c8a5; font-size: 92px; line-height: 1.16; text-align: center; font-weight: 700; position: relative; z-index: 1; }
  .rv-rule { width: 0; height: 2px; background: #b28e5f; margin-top: 44px; animation: rvGrowRule .7s ease-out forwards ${(0.5 + hookWords.length * 0.09 + 0.3).toFixed(2)}s; }
  @keyframes rvGrowRule { to { width: 260px; } }

  /* --- Scena 2: Ghost (neuralagora.com) --- */
  .rv-ghost { background: #2A121D; animation: rvGhostOpac ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvGhostOpac {
    0% { opacity: 0; } ${pct(T.coverFadeStart)} { opacity: 0; } ${pct(T.coverEnd)} { opacity: 1; }
    ${pct(T.ghostHoldEnd)} { opacity: 1; } ${pct(T.ghostFadeOutEnd)} { opacity: 0; } 100% { opacity: 0; }
  }
  .rv-photo { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; transform-origin: center; }
  .rv-ghost .rv-photo { animation: rvGhostZoom ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvGhostZoom {
    0% { transform: scale(1); } ${pct(T.coverFadeStart)} { transform: scale(1); } ${pct(T.ghostFadeOutEnd)} { transform: scale(1.14); } 100% { transform: scale(1.14); }
  }
  .rv-scrim-wine { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(42,18,29,0.12) 0%, rgba(42,18,29,0.16) 30%, rgba(42,18,29,0.80) 62%, rgba(42,18,29,0.98) 100%); }
  .rv-tag { position: absolute; top: 70px; left: 64px; background: #2A121D; color: #D4A64A; font-size: 28px; padding: 12px 30px; border-radius: 999px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .5s ease-out forwards var(--tag-delay, 0s); }
  .rv-content { position: absolute; left: 0; right: 0; bottom: 0; padding: 70px 72px 100px 72px; }
  .rv-title { color: #D4A64A; font-size: 68px; line-height: 1.12; font-weight: 700; margin-bottom: 32px; }
  .rv-excerpt { color: #f5f0e6; font-size: 34px; line-height: 1.44; margin-bottom: 30px; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }
  .rv-site { color: #e8c8a5; font-size: 28px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }

  /* --- Scena 3: Blogger --- */
  .rv-blogger { background: #E6DCC6; animation: rvBloggerOpac ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvBloggerOpac {
    0% { opacity: 0; } ${pct(T.ghostHoldEnd)} { opacity: 0; } ${pct(T.ghostFadeOutEnd)} { opacity: 1; }
    ${pct(T.bloggerHoldEnd)} { opacity: 1; } ${pct(T.bloggerFadeOutEnd)} { opacity: 0; } 100% { opacity: 0; }
  }
  .rv-blogger .rv-photo { animation: rvBloggerZoom ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvBloggerZoom {
    0% { transform: scale(1); } ${pct(T.ghostHoldEnd)} { transform: scale(1); } ${pct(T.bloggerFadeOutEnd)} { transform: scale(1.14); } 100% { transform: scale(1.14); }
  }
  .rv-scrim-cream { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(230,220,198,0.10) 0%, rgba(230,220,198,0.14) 30%, rgba(230,220,198,0.84) 62%, rgba(230,220,198,0.97) 100%); }
  .rv-brand { position: absolute; top: 66px; left: 60px; display: flex; align-items: center; gap: 16px; background: rgba(230,220,198,0.92); padding: 14px 30px 14px 20px; border-radius: 999px; opacity: 0; animation: rvFadeUp .5s ease-out forwards var(--brand-delay, 0s); }
  .rv-dot { width: 32px; height: 32px; border-radius: 50%; background: #2A121D; }
  .rv-brandtext { color: #2A121D; font-size: 30px; font-weight: 600; }
  .rv-title-dark { color: #2A121D; font-size: 62px; line-height: 1.16; font-weight: 700; margin-bottom: 30px; }
  .rv-excerpt-dark { color: #4a352c; font-size: 32px; line-height: 1.42; margin-bottom: 28px; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }
  .rv-site-dark { color: #723535; font-size: 28px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }

  /* --- Scena 4: CTA --- */
  .rv-cta { display: flex; animation: rvCtaOpac ${REEL_TOTAL}s linear 1 forwards; }
  @keyframes rvCtaOpac {
    0% { opacity: 0; } ${pct(T.bloggerHoldEnd)} { opacity: 0; } ${pct(T.bloggerFadeOutEnd)} { opacity: 1; } 100% { opacity: 1; }
  }
  .rv-half { width: 540px; height: 1920px; }
  .rv-wine { background: #2A121D; }
  .rv-cream { background: #E6DCC6; }
  .rv-cta-center { position: absolute; top: 900px; left: 0; width: 1080px; text-align: center; }
  .rv-cta-wordmark { font-size: 88px; letter-spacing: 0.02em; }
  .rv-cta-wordmark .n { color: #d8a85b; }
  .rv-cta-wordmark .a { color: #723535; }
  .rv-cta-line { font-size: 48px; font-style: italic; margin-top: 26px; }
  .rv-cta-line .in { color: #f8d8c4; }
  .rv-cta-line .bio { color: #723535; }
  .rv-cta-foot { font-size: 28px; margin-top: 60px; color: #d8a85b; }
  .rv-cta-foot .sep { color: #723535; }
  `;

  return page(`
  <div class="rv-scene rv-cover">
  <div class="rv-glow"></div>
  <div class="rv-kicker">${escapeHtml(date)}</div>
  <div class="rv-wordmark serif">Neural Agora</div>
  <div class="rv-hook serif">${hookSpans}</div>
  <div class="rv-rule"></div>
  </div>

  <div class="rv-scene rv-ghost">
  <img class="rv-photo" src="${escapeHtml(ghost.image_url)}" onerror="this.style.display='none'" />
  <div class="rv-scrim-wine"></div>
  ${ghost.category ? `<div class="rv-tag" style="--tag-delay:${ghostTagDelay}s">${escapeHtml(ghost.category)}</div>` : ""}
  <div class="rv-content">
  <div class="rv-title serif">${ghostWordSpans}</div>
  <div class="rv-excerpt" style="--excerpt-delay:${ghostExcerptDelay}s">${escapeHtml(truncate(ghost.excerpt, 140))}</div>
  <div class="rv-site" style="--excerpt-delay:${ghostExcerptDelay}s">neuralagora.com</div>
  </div>
  </div>

  <div class="rv-scene rv-blogger">
  <img class="rv-photo" src="${escapeHtml(blogger.image_url)}" onerror="this.style.display='none'" />
  <div class="rv-scrim-cream"></div>
  <div class="rv-brand" style="--brand-delay:${bloggerBrandDelay}s"><div class="rv-dot"></div><div class="rv-brandtext">Neural Agora</div></div>
  <div class="rv-content">
  <div class="rv-title-dark serif">${bloggerWordSpans}</div>
  <div class="rv-excerpt-dark" style="--excerpt-delay:${bloggerExcerptDelay}s">${escapeHtml(truncate(blogger.excerpt, 130))}</div>
  <div class="rv-site-dark" style="--excerpt-delay:${bloggerExcerptDelay}s">blog.neuralagora.com</div>
  </div>
  </div>

  <div class="rv-scene rv-cta">
  <div class="rv-half rv-wine"></div>
  <div class="rv-half rv-cream"></div>
  <div class="rv-cta-center">
  <div class="rv-cta-wordmark serif"><span class="n">NEURAL</span><span class="a">AGORA</span></div>
  <div class="rv-cta-line serif"><span class="in">Link in</span><span class="bio"> bio</span></div>
  <div class="rv-cta-foot serif">neuralagora.com<span class="sep"> · </span>blog.neuralagora.com</div>
  </div>
  </div>
  `, style);
}

// ============================================================================
// RECAP SETTIMANALE — N articoli (variabile), pubblicato il sabato.
// Stessa identità visiva (vino/oro per Ghost, crema per Blogger) ma
// generalizzata: non più 2 slide fisse, ma una per ogni articolo della
// settimana (max 8, limite imposto dal carosello Instagram: cover + CTA
// + max 8 foto = 10, il massimo consentito dall'API).
// ============================================================================

const WEEKLY_MAX_ARTICLES = 8;

// Copertina del recap: stessa struttura della cover giornaliera, con in più
// il conteggio articoli della settimana.
function weeklyCoverSlide({ week_label, hook_headline, count }) {
  const style = `
  .cover { width: 1080px; height: 1350px; background: #2A121D; display: flex; flex-direction: column; align-items: center; padding: 80px 90px; }
  .header { text-align: center; }
  .kicker { color: #e8c8a5; font-size: 24px; letter-spacing: 0.05em; margin-bottom: 18px; }
  .wordmark { color: #b28e5f; font-size: 64px; letter-spacing: 0.25em; text-transform: uppercase; }
  .middle { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hook { color: #e8c8a5; font-size: 76px; line-height: 1.15; text-align: center; font-weight: 700; }
  .count { color: #D4A64A; font-size: 30px; margin-top: 32px; letter-spacing: 0.04em; }
  .rule { width: 260px; height: 2px; background: #b28e5f; margin-top: 36px; }
  `;
  return page(`
  <div class="cover">
  <div class="header">
  <div class="kicker">${escapeHtml(week_label)}</div>
  <div class="wordmark serif">Neural Agora</div>
  </div>
  <div class="middle">
  <div class="hook serif">${escapeHtml(truncate(hook_headline, 90))}</div>
  <div class="count">${Number(count) || 0} articoli questa settimana</div>
  <div class="rule"></div>
  </div>
  </div>
  `, style);
}

// Variante animata della copertina (per cover.mp4 del carosello), stesso
// trattamento a reveal parola-per-parola della cover giornaliera.
function weeklyCoverSlideVideo({ week_label, hook_headline, count }) {
  const words = escapeHtml(truncate(hook_headline, 90)).split(" ").filter(Boolean);
  const wordSpans = words
    .map((w, i) => `<span class="word" style="animation-delay:${(0.9 + i * 0.09).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");
  const countDelay = (0.9 + words.length * 0.09 + 0.2).toFixed(2);
  const ruleDelay = (0.9 + words.length * 0.09 + 0.45).toFixed(2);
  const style = `
  .cover { width: 1080px; height: 1350px; background: #2A121D; display: flex; flex-direction: column; align-items: center; padding: 80px 90px; position: relative; overflow: hidden; }
  .glow { position: absolute; top: 50%; left: 50%; width: 1400px; height: 1400px; margin: -700px 0 0 -700px; background: radial-gradient(circle, rgba(212,166,74,0.16) 0%, rgba(212,166,74,0) 62%); animation: pulse 4.5s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.08); opacity: 1; } }
  .header { text-align: center; opacity: 0; animation: fadeDown .7s ease-out forwards .15s; position: relative; z-index: 1; }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  .kicker { color: #e8c8a5; font-size: 24px; letter-spacing: 0.05em; margin-bottom: 18px; }
  .wordmark { color: #b28e5f; font-size: 64px; letter-spacing: 0.25em; text-transform: uppercase; }
  .middle { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 1; }
  .hook { color: #e8c8a5; font-size: 76px; line-height: 1.15; text-align: center; font-weight: 700; }
  .hook .word { display: inline-block; opacity: 0; transform: translateY(28px); animation: wordUp .6s cubic-bezier(.2,.8,.2,1) forwards; }
  @keyframes wordUp { to { opacity: 1; transform: translateY(0); } }
  .count { color: #D4A64A; font-size: 30px; margin-top: 32px; letter-spacing: 0.04em; opacity: 0; animation: fadeDown .5s ease-out forwards ${countDelay}s; }
  .rule { width: 0; height: 2px; background: #b28e5f; margin-top: 36px; animation: growRule .7s ease-out forwards ${ruleDelay}s; }
  @keyframes growRule { to { width: 260px; } }
  `;
  return page(`
  <div class="cover">
  <div class="glow"></div>
  <div class="header">
  <div class="kicker">${escapeHtml(week_label)}</div>
  <div class="wordmark serif">Neural Agora</div>
  </div>
  <div class="middle">
  <div class="hook serif">${wordSpans}</div>
  <div class="count">${Number(count) || 0} articoli questa settimana</div>
  <div class="rule"></div>
  </div>
  </div>
  `, style);
}

// Slide di un singolo articolo del recap: stessa foto piena pagina + scrim
// delle slide Ghost/Blogger fisse, ma parametrica su un array di N articoli.
// Palette scelta da article.source ("ghost" = vino/oro, "blogger" = crema).
// Badge "i/totale" in alto a destra per orientarsi dentro il carosello.
function articleSlide(article, index, total) {
  const isGhost = article.source !== "blogger";
  const siteLabel = isGhost ? "neuralagora.com" : "blog.neuralagora.com";
  const style = isGhost ? `
  .slide { width: 1080px; height: 1350px; position: relative; background: #2A121D; overflow: hidden; }
  .photo { position: absolute; inset: 0; width: 1080px; height: 1350px; object-fit: cover; }
  .scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(42,18,29,0.10) 0%, rgba(42,18,29,0.12) 34%, rgba(42,18,29,0.74) 60%, rgba(42,18,29,0.97) 100%); }
  .tag { position: absolute; top: 48px; left: 48px; background: #2A121D; color: #D4A64A; font-size: 26px; padding: 10px 26px; border-radius: 999px; letter-spacing: 0.04em; }
  .badge { position: absolute; top: 48px; right: 48px; color: #e8c8a5; font-size: 26px; letter-spacing: 0.04em; }
  .content { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 70px 64px 70px; }
  .title { color: #D4A64A; font-size: 60px; line-height: 1.12; font-weight: 700; margin-bottom: 26px; }
  .excerpt { color: #f5f0e6; font-size: 31px; line-height: 1.42; margin-bottom: 28px; }
  .site { color: #e8c8a5; font-size: 27px; letter-spacing: 0.04em; }
  ` : `
  .slide { width: 1080px; height: 1350px; position: relative; background: #E6DCC6; overflow: hidden; }
  .photo { position: absolute; inset: 0; width: 1080px; height: 1350px; object-fit: cover; }
  .scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(230,220,198,0.08) 0%, rgba(230,220,198,0.10) 34%, rgba(230,220,198,0.80) 60%, rgba(230,220,198,0.96) 100%); }
  .brand { position: absolute; top: 44px; left: 44px; display: flex; align-items: center; gap: 14px; background: rgba(230,220,198,0.92); padding: 12px 26px 12px 18px; border-radius: 999px; }
  .dot { width: 30px; height: 30px; border-radius: 50%; background: #2A121D; }
  .brandtext { color: #2A121D; font-size: 28px; font-weight: 600; }
  .badge { position: absolute; top: 48px; right: 48px; color: #723535; font-size: 26px; letter-spacing: 0.04em; }
  .content { position: absolute; left: 0; right: 0; bottom: 0; padding: 60px 70px 64px 70px; }
  .title { color: #2A121D; font-size: 54px; line-height: 1.16; font-weight: 700; margin-bottom: 24px; }
  .excerpt { color: #4a352c; font-size: 29px; line-height: 1.4; margin-bottom: 26px; }
  .site { color: #723535; font-size: 27px; letter-spacing: 0.04em; }
  `;
  const topBadge = isGhost
    ? `${article.category ? `<div class="tag">${escapeHtml(article.category)}</div>` : ""}<div class="badge">${index}/${total}</div>`
    : `<div class="brand"><div class="dot"></div><div class="brandtext">Neural Agora</div></div><div class="badge">${index}/${total}</div>`;
  return page(`
  <div class="slide">
  <img class="photo" src="${escapeHtml(article.image_url)}" onerror="this.style.display='none'" />
  <div class="scrim"></div>
  ${topBadge}
  <div class="content">
  <div class="title serif">${escapeHtml(truncate(article.title, 78))}</div>
  <div class="excerpt">${escapeHtml(truncate(article.excerpt, 130))}</div>
  <div class="site">${siteLabel}</div>
  </div>
  </div>
  `, style);
}

// Timeline del reel settimanale: cover + una scena per articolo + CTA,
// durata totale variabile in base al numero di articoli (stessa logica di
// dissolvenza/Ken Burns del reel giornaliero, generalizzata a N scene).
function buildWeeklyTimeline(n) {
  const coverHold = 2.6, fade = 0.4, articleHold = 4.8, ctaHold = 3.8;
  let t = 0;
  const cover = { start: 0 };
  t += coverHold; cover.fadeStart = t; t += fade; cover.end = t;
  const articles = [];
  for (let i = 0; i < n; i++) {
    const fadeInEnd = t;
    t += articleHold;
    const holdEnd = t;
    t += fade;
    const fadeOutEnd = t;
    articles.push({ fadeInEnd, holdEnd, fadeOutEnd });
  }
  const cta = { fadeInEnd: t };
  t += ctaHold;
  return { cover, articles, cta, total: t };
}

function weeklyReelVideo({ week_label, hook_headline, articles }) {
  const list = articles.slice(0, WEEKLY_MAX_ARTICLES);
  const TL = buildWeeklyTimeline(list.length);
  const total = TL.total;
  const pctOf = (t) => `${((t / total) * 100).toFixed(4)}%`;

  const hookWords = escapeHtml(truncate(hook_headline, 90)).split(" ").filter(Boolean);
  const hookSpans = hookWords
    .map((w, i) => `<span class="rv-word" style="animation-delay:${(0.5 + i * 0.09).toFixed(2)}s">${w}&nbsp;</span>`)
    .join("");
  const countDelay = (0.5 + hookWords.length * 0.09 + 0.2).toFixed(2);
  const ruleDelay = (0.5 + hookWords.length * 0.09 + 0.4).toFixed(2);

  let scenesHtml = "";
  let scenesCss = "";

  scenesCss += `
  .rv-cover { background: #2A121D; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 90px; animation: rvCoverOpac ${total}s linear 1 forwards; }
  @keyframes rvCoverOpac { 0% { opacity: 1; } ${pctOf(TL.cover.fadeStart)} { opacity: 1; } ${pctOf(TL.cover.end)} { opacity: 0; } 100% { opacity: 0; } }
  `;
  scenesHtml += `
  <div class="rv-scene rv-cover">
  <div class="rv-glow"></div>
  <div class="rv-kicker">${escapeHtml(week_label)}</div>
  <div class="rv-wordmark serif">Neural Agora</div>
  <div class="rv-hook serif">${hookSpans}</div>
  <div class="rv-count" style="--count-delay:${countDelay}s">${list.length} articoli questa settimana</div>
  <div class="rv-rule" style="animation-delay:${ruleDelay}s"></div>
  </div>
  `;

  list.forEach((article, i) => {
    const seg = TL.articles[i];
    const prevEnd = i === 0 ? TL.cover.end : TL.articles[i - 1].fadeOutEnd;
    const isGhost = article.source !== "blogger";
    const title = escapeHtml(truncate(article.title, 72));
    const excerptDelay = (seg.fadeInEnd + 0.4).toFixed(2);
    const cls = isGhost ? "rv-art-wine" : "rv-art-cream";
    scenesCss += `
    .rv-art-${i} { background: ${isGhost ? "#2A121D" : "#E6DCC6"}; animation: rvArtOpac${i} ${total}s linear 1 forwards; }
    @keyframes rvArtOpac${i} {
      0% { opacity: 0; } ${pctOf(prevEnd)} { opacity: 0; } ${pctOf(seg.fadeInEnd)} { opacity: 1; }
      ${pctOf(seg.holdEnd)} { opacity: 1; } ${pctOf(seg.fadeOutEnd)} { opacity: 0; } 100% { opacity: 0; }
    }
    .rv-art-${i} .rv-photo { animation: rvArtZoom${i} ${total}s linear 1 forwards; }
    @keyframes rvArtZoom${i} { 0% { transform: scale(1); } ${pctOf(prevEnd)} { transform: scale(1); } ${pctOf(seg.fadeOutEnd)} { transform: scale(1.14); } 100% { transform: scale(1.14); } }
    `;
    const topBadge = isGhost
      ? `${article.category ? `<div class="rv-tag" style="--tag-delay:${(seg.fadeInEnd + 0.1).toFixed(2)}s">${escapeHtml(article.category)}</div>` : ""}`
      : `<div class="rv-brand" style="--brand-delay:${(seg.fadeInEnd + 0.1).toFixed(2)}s"><div class="rv-dot"></div><div class="rv-brandtext">Neural Agora</div></div>`;
    scenesHtml += `
    <div class="rv-scene rv-art-${i} ${cls}">
    <img class="rv-photo" src="${escapeHtml(article.image_url)}" onerror="this.style.display='none'" />
    <div class="${isGhost ? "rv-scrim-wine" : "rv-scrim-cream"}"></div>
    ${topBadge}
    <div class="rv-content">
    <div class="${isGhost ? "rv-title" : "rv-title-dark"} serif" style="opacity:0; animation: rvFadeUp .6s ease-out forwards ${(seg.fadeInEnd + 0.15).toFixed(2)}s">${title}</div>
    <div class="${isGhost ? "rv-excerpt" : "rv-excerpt-dark"}" style="--excerpt-delay:${excerptDelay}s">${escapeHtml(truncate(article.excerpt, isGhost ? 140 : 130))}</div>
    <div class="${isGhost ? "rv-site" : "rv-site-dark"}" style="--excerpt-delay:${excerptDelay}s">${isGhost ? "neuralagora.com" : "blog.neuralagora.com"}</div>
    </div>
    </div>
    `;
  });

  const lastFadeOut = list.length ? TL.articles[list.length - 1].fadeOutEnd : TL.cover.end;
  scenesCss += `
  .rv-cta { display: flex; animation: rvCtaOpac ${total}s linear 1 forwards; }
  @keyframes rvCtaOpac { 0% { opacity: 0; } ${pctOf(TL.cta.fadeInEnd)} { opacity: 0; } ${pctOf(Math.min(TL.cta.fadeInEnd + 0.4, total))} { opacity: 1; } 100% { opacity: 1; } }
  `;
  scenesHtml += `
  <div class="rv-scene rv-cta">
  <div class="rv-half rv-wine"></div>
  <div class="rv-half rv-cream"></div>
  <div class="rv-cta-center">
  <div class="rv-cta-wordmark serif"><span class="n">NEURAL</span><span class="a">AGORA</span></div>
  <div class="rv-cta-line serif"><span class="in">Link in</span><span class="bio"> bio</span></div>
  <div class="rv-cta-foot serif">neuralagora.com<span class="sep"> · </span>blog.neuralagora.com</div>
  </div>
  </div>
  `;

  const style = `
  html, body { width: 1080px; height: 1920px; background: #2A121D; }
  .rv-scene { position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: hidden; }
  .rv-word { display: inline-block; opacity: 0; transform: translateY(26px); animation-name: rvWordUp; animation-duration: .6s; animation-timing-function: cubic-bezier(.2,.8,.2,1); animation-fill-mode: forwards; }
  @keyframes rvWordUp { to { opacity: 1; transform: translateY(0); } }
  @keyframes rvFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

  .rv-glow { position: absolute; top: 50%; left: 50%; width: 1500px; height: 1500px; margin: -750px 0 0 -750px; background: radial-gradient(circle, rgba(212,166,74,0.16) 0%, rgba(212,166,74,0) 62%); animation: rvPulse 4.5s ease-in-out infinite; }
  @keyframes rvPulse { 0%, 100% { transform: scale(1); opacity: .75; } 50% { transform: scale(1.08); opacity: 1; } }
  .rv-kicker { color: #e8c8a5; font-size: 26px; letter-spacing: 0.05em; margin-bottom: 20px; text-align: center; opacity: 0; animation: rvFadeUp .7s ease-out forwards .1s; }
  .rv-wordmark { color: #b28e5f; font-size: 60px; letter-spacing: 0.22em; text-transform: uppercase; text-align: center; margin-bottom: 70px; opacity: 0; animation: rvFadeUp .7s ease-out forwards .1s; }
  .rv-hook { color: #e8c8a5; font-size: 86px; line-height: 1.16; text-align: center; font-weight: 700; position: relative; z-index: 1; }
  .rv-count { color: #D4A64A; font-size: 32px; margin-top: 30px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--count-delay, 0s); }
  .rv-rule { width: 0; height: 2px; background: #b28e5f; margin-top: 40px; animation: rvGrowRule .7s ease-out forwards; animation-delay: inherit; }
  @keyframes rvGrowRule { to { width: 260px; } }

  .rv-photo { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; transform-origin: center; }
  .rv-scrim-wine { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(42,18,29,0.12) 0%, rgba(42,18,29,0.16) 30%, rgba(42,18,29,0.80) 62%, rgba(42,18,29,0.98) 100%); }
  .rv-tag { position: absolute; top: 70px; left: 64px; background: #2A121D; color: #D4A64A; font-size: 28px; padding: 12px 30px; border-radius: 999px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .5s ease-out forwards var(--tag-delay, 0s); }
  .rv-content { position: absolute; left: 0; right: 0; bottom: 0; padding: 70px 72px 100px 72px; }
  .rv-title { color: #D4A64A; font-size: 64px; line-height: 1.14; font-weight: 700; margin-bottom: 30px; }
  .rv-excerpt { color: #f5f0e6; font-size: 33px; line-height: 1.44; margin-bottom: 30px; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }
  .rv-site { color: #e8c8a5; font-size: 28px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }

  .rv-scrim-cream { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(230,220,198,0.10) 0%, rgba(230,220,198,0.14) 30%, rgba(230,220,198,0.84) 62%, rgba(230,220,198,0.97) 100%); }
  .rv-brand { position: absolute; top: 66px; left: 60px; display: flex; align-items: center; gap: 16px; background: rgba(230,220,198,0.92); padding: 14px 30px 14px 20px; border-radius: 999px; opacity: 0; animation: rvFadeUp .5s ease-out forwards var(--brand-delay, 0s); }
  .rv-dot { width: 32px; height: 32px; border-radius: 50%; background: #2A121D; }
  .rv-brandtext { color: #2A121D; font-size: 30px; font-weight: 600; }
  .rv-title-dark { color: #2A121D; font-size: 58px; line-height: 1.18; font-weight: 700; margin-bottom: 28px; }
  .rv-excerpt-dark { color: #4a352c; font-size: 31px; line-height: 1.42; margin-bottom: 28px; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }
  .rv-site-dark { color: #723535; font-size: 28px; letter-spacing: 0.04em; opacity: 0; animation: rvFadeUp .6s ease-out forwards var(--excerpt-delay, 0s); }

  .rv-cta { display: flex; }
  .rv-half { width: 540px; height: 1920px; }
  .rv-wine { background: #2A121D; }
  .rv-cream { background: #E6DCC6; }
  .rv-cta-center { position: absolute; top: 900px; left: 0; width: 1080px; text-align: center; }
  .rv-cta-wordmark { font-size: 88px; letter-spacing: 0.02em; }
  .rv-cta-wordmark .n { color: #d8a85b; }
  .rv-cta-wordmark .a { color: #723535; }
  .rv-cta-line { font-size: 48px; font-style: italic; margin-top: 26px; }
  .rv-cta-line .in { color: #f8d8c4; }
  .rv-cta-line .bio { color: #723535; }
  .rv-cta-foot { font-size: 28px; margin-top: 60px; color: #d8a85b; }
  .rv-cta-foot .sep { color: #723535; }
  ${scenesCss}
  `;

  return { html: page(scenesHtml, style), durationSec: total };
}

module.exports = {
  coverSlide, coverSlideVideo, ghostSlide, bloggerSlide, ctaSlide, reelVideo, REEL_TOTAL, truncate, escapeHtml,
  weeklyCoverSlide, weeklyCoverSlideVideo, articleSlide, weeklyReelVideo, WEEKLY_MAX_ARTICLES,
};
