# Reminders app

Sandbox project: a small browser-based reminders app. No build step, no dependencies.

## Run
Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000`.

## Structure
- `index.html` – markup
- `style.css` – styles (light/dark via `prefers-color-scheme`)
- `app.js` – state, rendering, due-time notifications

## Conventions
- Vanilla JS, no frameworks. Build DOM with `textContent`, never `innerHTML` with user input.
- Data lives in `localStorage` under the key `reminders.v1`; bump the version if the item shape changes.
- Item shape: `{ id, text, due (datetime-local string | null), done, notified }`.
- Notifications only fire while the page is open.

## CI/CD
- `.github/workflows/ci.yml`: ESLint (`npm run lint`) on pushes to non-main branches and on pull requests.
- `.github/workflows/deploy.yml`: on push to `main`, publishes `index.html`, `style.css`, `app.js` to GitHub Pages (https://petgeb.github.io/reminders-app/).
- New files the app needs at runtime must be added to the `cp` line in `deploy.yml`.
