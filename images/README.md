# Guida Gestione Immagini in Locale

Tutte le immagini del portfolio sono ora organizzate in cartelle locali dentro `images/`:

```
Sito Portfolio/
└── images/
    ├── aether/          <- Foto del 1° progetto (es. ath_01.jpg, ath_02.jpg...)
    ├── nomod/           <- Foto del 2° progetto (es. nmd_01.jpg, nmd_02.jpg...)
    ├── luca/            <- Foto del 3° progetto (es. luca_01.jpg, luca_02.jpg...)
    └── reel/            <- Video (reel.mp4) e copertina (poster.jpg)
```

## Come sostituire o aggiungere immagini

1. **Sostituire un'immagine esistente**:
   Basta incollare la tua nuova immagine nella cartella del progetto corrispondente con lo stesso nome file (es. `images/aether/ath_01.jpg`).

2. **Aggiungere nuove immagini o cambiare i nomi**:
   Apri il file `js/main.js` e modifica l'elenco dentro `PROJECTS`:

```javascript
{
    image: "images/aether/il-tuo-file.jpg",
    caption: "TITOLO_FOTO.JPG",
    aspect: "tall", // opzioni: "tall" (verticale), "landscape" (orizzontale), "square" (quadrato)
}
```

3. **Motion Reel**:
   Inserisci il tuo video in `images/reel/reel.mp4`. Se il file non è ancora presente, comparirà automaticamente il placeholder pulito.
