# Neural Agorà — Carosello + Reel Instagram giornaliero

Servizio che genera, da un'unica GitHub Action innescata da Make, gli asset social
giornalieri di Neural Agorà a partire dai dati dell'ultimo articolo di ciascun sito
(neuralagora.com e blog.neuralagora.com):

- le 4 immagini del carosello (copertina, articolo Ghost, articolo Blogger, CTA finale);
- `cover.mp4`, breve video di reveal della sola copertina (usato nel carosello);
- `reel.mp4`, **reel verticale 1080×1920 completo** (~27,6s) con tipografia cinetica
  (titoli che entrano parola per parola) ed effetto Ken Burns sulle foto dei due articoli —
  copertina → slide Ghost → slide Blogger → CTA, stesso stile vino/oro e crema del resto
  del brand. Nessuna voce narrante: solo testo animato (pensato per essere guardato anche
  muto, come la maggior parte dei reel). Non include ancora una colonna sonora — vedi
  "Prossimi passi" sotto.

Nessun costo ricorrente: il rendering gira su GitHub Actions (Playwright + ffmpeg), gli
asset finiti vengono pubblicati gratis su GitHub Pages.

## Come funziona

1. Make (lo scenario giornaliero) prende l'ultimo post da Ghost e da Blogger.
2. Invia un `repository_dispatch` (evento `render`) a questo repo con i dati dei due
   articoli (stesso payload di prima, vedi sotto).
3. La GitHub Action (`.github/workflows/render.yml`) esegue `render-daily.js`: disegna le
   slide e il reel via HTML/CSS (Playwright headless) e li fotografa/registra, poi
   converte i video con ffmpeg; pubblica tutto in `docs/img/` (GitHub Pages).
4. Make recupera gli URL pubblici fissi (`.../img/cover.jpg`, `.../img/reel.mp4`, ecc.) e
   li passa ai moduli Instagram/Facebook — `reel.mp4` va al modulo "Create a Reel Post".

## Prossimi passi (non ancora fatto)

- **Colonna sonora per `reel.mp4`**: va scelta una traccia royalty-free e passata a
  `ffmpeg` in fase di conversione (`-i audio.mp3 -shortest`, mixata sul video già
  renderizzato). Da decidere: traccia fissa o rotazione, e dove viene ospitato il file
  audio.
- **Scenario Make**: serve uno scenario (nuovo o il "Carosello giornaliero" riattivato)
  che faccia il dispatch e poi pubblichi `reel.mp4` come Reel su Instagram/Facebook —
  finora questo repo veniva chiamato solo dal vecchio scenario del carosello, disattivato
  il 30/08/2026.

## Deploy su Railway

1. Crea un repository GitHub (anche privato) e carica questi file.
2. Su Railway: New Project → Deploy from GitHub repo → seleziona il repository.
   Railway userà automaticamente il `Dockerfile` incluso (contiene già Chromium via
   l'immagine ufficiale Playwright, non serve altro).
3. Imposta le variabili d'ambiente del servizio:
   - `RENDER_API_KEY`: una password a piacere (es. generata con `openssl rand -hex 20`).
     Va passata da Make in ogni chiamata come header `x-api-key`, altrimenti chiunque
     trovi l'URL potrebbe generare immagini a tuo nome.
   - `PUBLIC_BASE_URL`: dopo il primo deploy, genera un dominio pubblico da Railway
     (Settings → Networking → Generate Domain) e incolla qui l'URL completo
     (es. `https://neural-agora-carousel-production.up.railway.app`).
4. Ridistribuisci il servizio dopo aver impostato le variabili.

## Contratto dell'endpoint

`POST /render` — header `x-api-key: <RENDER_API_KEY>`, body JSON:

```json
{
  "date": "27 agosto 2026",
  "hook_headline": "I due articoli di oggi",
  "ghost": {
    "title": "Titolo dell'articolo su neuralagora.com",
    "excerpt": "Estratto breve dell'articolo (1-2 frasi).",
    "image_url": "https://neuralagora.com/content/images/.../cover.jpg",
    "category": "AI"
  },
  "blogger": {
    "title": "Titolo dell'articolo del blog",
    "excerpt": "Estratto breve dell'articolo.",
    "image_url": "https://blogger.googleusercontent.com/.../cover.jpg"
  }
}
```

Risposta:

```json
{ "ok": true, "batchId": "a1b2c3d4e5f6", "images": [
  "https://.../img/a1b2c3d4e5f6-1-cover.jpg",
  "https://.../img/a1b2c3d4e5f6-2-ghost.jpg",
  "https://.../img/a1b2c3d4e5f6-3-blogger.jpg",
  "https://.../img/a1b2c3d4e5f6-4-cta.jpg"
] }
```

Le immagini restano pubbliche sul dominio Railway per 48 ore (poi vengono ripulite
automaticamente), tempo più che sufficiente perché Instagram le scarichi al momento
della pubblicazione del carosello.

## File

- `templates.js` — markup e stile delle 4 slide (qui si personalizzano colori, font, layout).
- `server.js` — server Express + rendering Playwright.
- `test-render.js` — script per generare le 4 slide in locale con dati di prova
  (`node test-render.js`, richiede Playwright con Chromium installato).
- `Dockerfile` — immagine usata da Railway per il deploy.
