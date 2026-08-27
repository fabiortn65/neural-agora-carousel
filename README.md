# Neural Agorà — Carosello Instagram giornaliero

Servizio che genera le 4 immagini del carosello Instagram giornaliero di Neural Agorà
(copertina, articolo Ghost, articolo Blogger, CTA finale), a partire dai dati dell'ultimo
articolo di ciascun sito. Nessun costo ricorrente: solo hosting Railway, come gli altri
progetti.

## Come funziona

1. Make (lo scenario giornaliero) prende l'ultimo post da Ghost e da Blogger.
2. Chiama `POST /render` su questo servizio con i dati dei due articoli.
3. Il servizio disegna le 4 slide via HTML/CSS (stesso stile approvato: vino/oro per
   neuralagora.com, crema per blog.neuralagora.com) e le fotografa con un browser headless
   (Playwright), salvandole come JPEG pubblici.
4. Make prende i 4 URL restituiti e li passa al modulo Instagram "Create a carousel post".

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
