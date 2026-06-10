# Harinder Kumar for Councillor — Static Site test

Plain HTML / CSS / JS. **No build step.** Just open `index.html`.

## How to run locally
**Easiest:** Double-click `index.html` to open in your browser.

**Better (so forms + paths behave perfectly):** serve the folder:
```bash
# Option A — Python (already installed on Mac/Linux)
python3 -m http.server 8000

# Option B — Node
npx serve .
```
Then visit http://localhost:8000

## File map
```
index.html          ← homepage
about.html
platform.html
volunteer.html      ← volunteer signup form
lawn-sign.html      ← lawn sign request form
contact.html        ← contact form
css/styles.css      ← all styles (edit colors at the top in :root)
js/main.js          ← form handler + mobile menu
images/             ← replace candidate.jpg with the real photo
```

## Edit the colors
Open `css/styles.css` and edit the top `:root` block:
```css
:root {
  --burgundy: #5b1a25;   /* main brand color */
  --cream:    #faf5ec;   /* background */
  --gold:     #c79a3a;   /* accent */
}
```

## Edit the candidate photo
Replace `images/candidate.jpg` with your own photo (same filename).

## Edit text
Open the relevant `.html` file and edit the text directly. The header and footer
are inlined in each page — if you change a nav link, update it in every page.

## Form submissions
Forms save to the browser's `localStorage` (keys: `volunteer-signups`,
`lawn-sign-requests`, `contact-messages`). To wire to a real backend, edit
`js/main.js` and replace the `localStorage.setItem(...)` block with a `fetch()`
to your endpoint.
