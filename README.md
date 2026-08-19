# E-Circular System

React frontend in `react/` with a Node backend in `node/`.

## What changed in this update

- **Fixed the drawing toolbar** (pencil, circle, rectangle, triangle, line, curve, text box). The editor's drawing canvas was never being created because `editorDocumentMarkup()` called a helper that silently dropped its options and always rendered a read-only page. All shape tools now work.
- **Fixed a click-blocking bug**: the (invisible) drawing canvas used to sit on top of the document at all times, which could swallow clicks meant for the circular text underneath. It's now only active while a drawing tool is selected.
- **Visual refresh**: refined color palette, button/card hover states, focus rings, toolbar styling, and table/status polish across the whole app (`react/src/styles.css`).
- Added the missing `react/package.json`, `react/vite.config.js`, and `react/index.html` so `npm run install:react` / `npm run build` / `npm run dev` work out of the box (the build output still lands in the root `dist/` folder the Node server expects).

## Install

```powershell
npm run install:react
```

## Build React

```powershell
npm run build
```

## Run Node Backend

```powershell
npm start
```

Open:

```text
http://127.0.0.1:8000
```

## Development Frontend

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```
