# Liniennetz-Editor

[![Deploy](https://github.com/transitmapper/liniennetzeditor/actions/workflows/deploy.yml/badge.svg)](https://github.com/transitmapper/liniennetzeditor/actions/workflows/deploy.yml)

Datengetriebener Editor für moderne Liniennetzpläne, entstanden als Ersatz für Microsoft Publisher.
Man beschreibt das Netz (Linien, Kategorien, Haltestellen) und platziert nur die Haltestellen auf einem Raster.
Verbindungen, Rundungen, Bündelung paralleler Linien, Haltestellensymbole und Legende berechnet das Programm
(nur 0°/45°/90°, runde Knicke).

**Jetzt ausprobieren: https://transitmapper.github.io/liniennetzeditor/**

Läuft komplett im Browser, ohne Server und ohne Konto. Alle Daten bleiben auf dem eigenen Rechner.

> **Sprache:** Die Oberfläche ist derzeit nur auf Deutsch verfügbar.

## Funktionen

- Setup-Assistent für Plan und Entwurf
- Linien mit Stamm, Ästen, Ringlinien, Durchfahrt, Richtungshalt, zeitweiser Bedienung und Kopplung
- Bündelung paralleler Linien mit einstellbarer Spurreihenfolge
- aufgesplittete Haltestellen, Wegpunkte, mehrzeilige Namen mit automatischem Bindestrich
- Linienbadges an beliebigen Haltestellen, an Endhaltestellen wahlweise umrandet
- automatische Beschriftungspositionen mit Überlappungsprüfung
- Zeichenobjekte (Flüsse, Grenzen, Flächen) mit mehreren, wiederholbaren Beschriftungen, Beschriftung in der Flächenmitte und Pfeilspitzenbeschriftung
- Flächen in den Hintergrund stellen oder aus der Legende ausnehmen
- Bilder und Grafiken auf dem Plan platzieren und skalieren
- freie Texte und Astanmerkungen mit mehreren Linienbadges
- Legende und frei platzierbare Linienübersicht, eigene Textvorlagen, Entwurf speichern und laden
- Hintergrundbild als Pausvorlage, Auswahlmodus, CSV-Import und -Export
- Export als SVG, PNG und PDF (Dateiname = Überschrift des Plans), Speichern als JSON

## Fehler melden und Vorschläge

Fehler oder Ideen bitte als [Issue](../../issues/new/choose) melden. Hilfreich sind eine kurze Beschreibung,
der Browser und, wenn möglich, die Projektdatei (.json), mit der sich der Fehler nachstellen lässt.

## Hinweis zu KI

Dieses Programm wurde mit Unterstützung von KI (Claude von Anthropic) entwickelt und vom Autor geprüft und getestet.

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
Die Seiten `public/impressum.html` und `public/datenschutz.html` müssen vor der Veröffentlichung mit den eigenen Angaben gefüllt werden.

## Projektstruktur

```
src/core/engine.js   Berechnung und SVG-Zeichnung (Routing, Bündelung, Legende)
src/store.js         Zustand mit Undo/Redo
src/App.jsx          Ribbon und Dateifunktionen
src/*Dialog*.jsx     Pop-ups für Plan, Haltestellen, Linien, Entwurf, Zeichnen
src/Wizard.jsx       Setup-Assistent
src/Info.jsx         Info-Pop-up
public/              Impressum und Datenschutz
```

## Lizenz

MIT, siehe [LICENSE](LICENSE).
