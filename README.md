# Sito Coverlines

Sito statico con pannello di gestione dei prodotti.
Il cliente modifica i contenuti dal pannello, il sito si ricostruisce e si pubblica da solo.

## Come modificare i prodotti

1. Vai su **https://timely-sunflower-28d156.netlify.app/admin/** ed entra con le tue credenziali.
2. Apri **Prodotti**, cerca la scheda e modificala.
3. Premi **Publish**. Entro un paio di minuti il sito è aggiornato.

Per ogni prodotto puoi cambiare:

| Campo | A cosa serve |
|---|---|
| Titolo del prodotto | Titolo della pagina e titolo su Google |
| Nome commerciale | Nome breve del modello (Plissè, Evotwin…) |
| Categoria | In quale sezione compare il prodotto |
| Descrizione | Il testo della scheda. Lascia una riga vuota tra i paragrafi |
| Caratteristiche tecniche | Le righe della tabella (voce + valore) |
| Colori disponibili | Elenco dei colori |
| Foto del prodotto | Immagine della scheda |
| Documenti PDF | Schede tecniche, manuali, certificazioni, capitolati |
| Videoguida | Link YouTube/Vimeo del video di installazione |
| Pubblicato sul sito | Spegni per nascondere il prodotto senza cancellarlo |

### Videoguide

Il modo consigliato è **incollare il link di YouTube o Vimeo**: il video appare dentro la pagina e non appesantisce il sito.
Il caricamento diretto del file va usato solo per video brevi (indicativamente sotto i 50 MB), perché i file video pesanti rallentano il sito e occupano spazio nel repository.

## Com'è fatto

```
content/prodotti/   una scheda prodotto per file (quello che il pannello modifica)
pages/              le pagine fisse: home, categorie, contatti, FAQ…
static/             foglio di stile, script, immagini, cataloghi PDF
static/uploads/     i file caricati dal pannello
admin/              il pannello di gestione
build.mjs           genera il sito dentro dist/
```

Il segnaposto `<!--PGRID-->` dentro le pagine di categoria e nella home indica dove il generatore inserisce le schede prodotto.

## Comandi

```bash
npm run build     # genera il sito in dist/
npm run serve     # genera e apre un'anteprima locale
```

Netlify esegue `node build.mjs` a ogni modifica e pubblica la cartella `dist`.

## Da completare

- **File del vecchio sito**: immagini e PDF di alcune schede puntano ancora a `coverlines.it`. Vanno caricati qui prima che il vecchio sito venga spento.
- **Moduli di contatto**: i form non inviano ancora email; vanno collegati a Netlify Forms o a un servizio di posta.
