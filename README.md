# Liniennetz-Editor

Datengetriebener Editor für moderne Liniennetzpläne, entstanden als Ersatz für Microsoft Publisher.
Man beschreibt das Netz (Linien, Kategorien, Haltestellen) und platziert nur die Haltestellen auf einem Raster.
Verbindungen, Rundungen, Bündelung paralleler Linien, Haltestellensymbole und Legende berechnet das Programm
(nur 0°/45°/90°, runde Knicke).

Läuft komplett im Browser, ohne Server und ohne Konto. Alle Daten bleiben auf dem eigenen Rechner.

## Funktionen

- Setup-Assistent für Plan und Entwurf
- Linien mit Stamm, Ästen, Ringlinien, Durchfahrt, Richtungshalt und Kopplung
- Bündelung paralleler Linien mit einstellbarer Spurreihenfolge
- aufgesplittete Haltestellen, Wegpunkte, automatische Beschriftungspositionen mit Überlappungsprüfung
- Zeichenobjekte (Flüsse, Grenzen, Flächen) mit mehreren, wiederholbaren Beschriftungen und Pfeilspitzen
- freie Texte und Astanmerkungen mit mehreren Linienbadges
- Legende und Linienübersicht, Textvorlagen, Entwurf speichern und laden
- Hintergrundbild als Pausvorlage, Auswahlmodus, CSV-Import und -Export
- Export als SVG, PNG und PDF (Dateiname = Überschrift des Plans), Speichern als JSON

## Lokal entwickeln

Voraussetzung: [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # erzeugt den Ordner dist
```

## Veröffentlichung (GitHub Pages)

Bei jedem Push auf `main` baut die GitHub Action unter `.github/workflows/deploy.yml` die App und veröffentlicht sie.
Einmalig nötig: im Repository unter **Settings → Pages → Source** den Eintrag **GitHub Actions** wählen.

## Projektstruktur

```
src/core/engine.js   Berechnung und SVG-Zeichnung (Routing, Bündelung, Legende)
src/store.js         Zustand mit Undo/Redo
src/App.jsx          Ribbon und Dateifunktionen
src/*Dialog*.jsx     Pop-ups für Plan, Haltestellen, Linien, Entwurf, Zeichnen
src/Wizard.jsx       Setup-Assistent
```

## Lizenz

MIT, siehe [LICENSE](LICENSE).
