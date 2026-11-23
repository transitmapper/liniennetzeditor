# Liniennetz-Editor

[![Deploy](https://github.com/transitmapper/liniennetzeditor/actions/workflows/deploy.yml/badge.svg)](https://github.com/transitmapper/liniennetzeditor/actions/workflows/deploy.yml)

A data-driven editor for modern transit network maps, created as a replacement for Microsoft Publisher.
You describe the network (lines, categories, stops) and only place the stops on a grid.
The program calculates connections, rounded corners, bundling of parallel lines, stop symbols and the key
(0°/45°/90° only, rounded bends).

**Try it now:**

- Open the editor: https://transitmapper.github.io/liniennetzeditor/app/
- Landing page (English): https://transitmapper.github.io/liniennetzeditor/en/
- Landing page (German): https://transitmapper.github.io/liniennetzeditor/

Runs entirely in your browser, with no server and no account. All data stays on your computer.

> **Language:** The editor interface is currently available in German only. An English interface is planned.

## Features

- Setup wizard for the plan and the design
- Lines with trunk, branches, loop lines, pass-through stops, direction-only stops, temporary service and coupling
- Bundling of parallel lines with adjustable lane order
- Split stops, waypoints, multi-line names with automatic hyphenation
- Line badges at any stop, outlined at terminal stops if desired
- Automatic label positions with overlap check
- Drawing objects (rivers, borders, areas) with multiple, repeatable labels, labels in the centre of areas and arrowhead labels
- Send areas to the background or exclude them from the key
- Place and scale images and graphics on the plan
- Free text and branch annotations with multiple line badges
- Key and freely placeable line overview, custom text styles, save and load designs
- Background image as tracing template, selection mode, CSV import and export
- Export as SVG, PNG and PDF (file name = plan title), save as JSON

## Reporting bugs and suggestions

Please report bugs or ideas as an [issue](../../issues/new/choose). A short description, your browser and,
if possible, the project file (.json) that reproduces the problem are helpful.

## Note on AI

This program was developed with the support of AI (Claude by Anthropic) and reviewed and tested by the author.

## Local development

Requires [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npm run dev      # development server
npm run build    # creates the dist folder
```

## Deployment (GitHub Pages)

On every push to `main`, the GitHub Action in `.github/workflows/deploy.yml` builds and publishes the app.
One-time setup: in the repository, go to **Settings → Pages → Source** and choose **GitHub Actions**.
The pages `public/impressum.html` and `public/datenschutz.html` (legal notice and privacy policy) must be filled in with your own details before publishing.

## Project structure

```
src/core/engine.js   Calculation and SVG drawing (routing, bundling, key)
src/store.js         State with undo/redo
src/App.jsx          Ribbon and file functions
src/*Dialog*.jsx     Pop-ups for plan, stops, lines, design, drawing
src/Wizard.jsx       Setup wizard
src/Info.jsx         Info pop-up
public/              Landing pages (de/en), legal notice and privacy policy
app/                 Entry point of the editor
```

## License

MIT, see [LICENSE](LICENSE).