# Sicherheitsrichtlinie

Vielen Dank, dass du dazu beitragen möchtest, den Liniennetz-Editor sicherer zu machen.

## Über das Projekt

Der Liniennetz-Editor ist eine reine Browser-Anwendung (React, mit Vite gebaut und als statische Dateien über GitHub Pages ausgeliefert). Sie hat **kein Backend**, keine Benutzerkonten und überträgt keine Daten an Server. Projekte werden lokal als JSON-Datei gespeichert; zusätzlich nutzt die Anwendung den `localStorage` des Browsers für die Liste zuletzt geöffneter Dateien und zuletzt verwendete Farben.

Zur Veröffentlichung gehören außerdem statische Landingpages (Deutsch und Englisch) ohne Skripte von Dritten.

Sicherheitsrelevant sind daher vor allem:

- das Verarbeiten **nicht vertrauenswürdiger Dateien** (JSON-Projekte, Entwurfsdateien, Netzausschnitte, CSV-Import, eingefügte Bilder), z. B. Cross-Site-Scripting (XSS) durch eingeschleuste Inhalte in Namen, Texten oder Farbwerten, die ungeprüft in das SVG oder die Oberfläche übernommen werden
- Fehler im **SVG-, PNG- oder PDF-Export**, die zu unerwünschten Inhalten in exportierten Dateien führen
- Probleme bei der **Auslieferung** der App (z. B. über einen Webserver) und beim Einbinden externer Ressourcen
- Schwachstellen in **Abhängigkeiten** (npm-Pakete), soweit sie die ausgelieferte Anwendung betreffen

## Unterstützte Versionen

Sicherheitsupdates erhalten nur der aktuelle Stand des Hauptzweigs (`main`) und die jeweils neueste veröffentlichte Version.

| Version                    | Unterstützt |
| -------------------------- | ----------- |
| Aktueller Stand von `main` | ja          |
| Neueste Release-Version    | ja          |
| Ältere Versionen           | nein          |

## Eine Schwachstelle melden

**Bitte melde Sicherheitslücken nicht über öffentliche Issues, Pull Requests oder Diskussionen.**

Nutze stattdessen eine dieser Möglichkeiten:

1. **Bevorzugt:** die private Meldefunktion von GitHub unter *Security → Report a vulnerability* in diesem Repository (Private Vulnerability Reporting).
2. Alternativ per E-Mail an: **kontakt.transitmapper@outlook.de**

Bitte gib in deiner Meldung möglichst an:

- eine Beschreibung der Schwachstelle und ihrer möglichen Auswirkungen
- die Schritte zur Reproduktion, idealerweise mit einer Beispieldatei (JSON oder CSV)
- Browser, Version und Betriebssystem
- falls vorhanden, einen Vorschlag zur Behebung

*English: Please do not report security issues publicly. Use GitHub's private vulnerability reporting (Security → Report a vulnerability) or the e-mail address above. Reports in English are welcome.*

## Was dich erwartet

Dies ist ein Hobbyprojekt, das in der Freizeit gepflegt wird. Ich bemühe mich um folgende Reaktionszeiten, kann sie aber nicht garantieren:

- **Eingangsbestätigung:** innerhalb von 7 Tagen
- **Erste Einschätzung:** innerhalb von 14 Tagen
- **Behebung:** je nach Schwere und Aufwand, kritische Probleme werden bevorzugt behandelt

Über den Fortgang informiere ich dich in der Regel direkt. Nach der Behebung veröffentliche ich auf Wunsch einen Hinweis in den Release-Notes und nenne dich dort als Melder, sofern du das möchtest.

## Verantwortungsvolle Offenlegung

Bitte gib Details zur Schwachstelle erst öffentlich bekannt, nachdem ein Fix verfügbar ist oder wir uns auf einen Zeitpunkt geeinigt haben. Im Gegenzug werden gutgläubige Meldungen nicht verfolgt oder beanstandet.

## Hinweise für Nutzerinnen und Nutzer

- Öffne **nur Projekt-, Entwurfs-, Netzausschnitt- und CSV-Dateien aus vertrauenswürdigen Quellen**.
- Halte deinen Browser aktuell.
- Wenn du die App auf einem eigenen Webserver bereitstellst, empfiehlt sich eine restriktive Content-Security-Policy und die Auslieferung über HTTPS.
- Die App speichert keine sensiblen Daten. Lege trotzdem keine Zugangsdaten oder vertraulichen Informationen in Projektdateien ab.

## Außerhalb des Geltungsbereichs

Nicht als Sicherheitslücken gelten in der Regel:

- Probleme, die nur durch bereits kompromittierte Browser, Erweiterungen oder Systeme entstehen
- Darstellungsfehler oder Abstürze ohne Sicherheitsauswirkung (bitte als normales Issue melden)
- Schwachstellen in Browsern oder in Drittsoftware, die nicht Teil dieses Projekts ist