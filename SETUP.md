# CO Antique Feedback Kiosk — Setup Guide

No command line, no installs. Everything below happens in a browser.

## Part 1 — Put the site on GitHub Pages (free hosting, no domain)

1. Go to github.com and sign in (the account you made with your personal email).
2. Click the **+** icon top-right → **New repository**.
3. Name it something like `co-antique-feedback-kiosk`. Keep it **Public**. Don't add a README. Click **Create repository**.
4. On the new empty repo page, click **uploading an existing file** (or **Add file → Upload files**).
5. Drag in every file from this folder **except** `code.gs` and `SETUP.md`:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `dfa-seal-color.png`
   - `dfa-seal-mono.png`
   - `icon-192.png`
   - `icon-512.png`
6. Scroll down, click **Commit changes**.
7. Go to the repo's **Settings** tab → **Pages** (left sidebar).
8. Under "Build and deployment", set **Source** to **Deploy from a branch**, **Branch** to `main` / `/(root)`, click **Save**.
9. Wait about a minute, refresh the page — it'll show a green box with your live link, something like:
   `https://yourusername.github.io/co-antique-feedback-kiosk/`
   That's the link you'll open on the kiosk tablets.

You now have a live site — it just isn't saving anywhere yet. That's Part 2.

## Part 2 — Connect it to a Google Sheet

1. Create a new Google Sheet (or open the one you want to use) — this can be under your DFA Gmail, since this is where the actual feedback data lives, separate from the code ownership question.
2. In the Sheet, go to **Extensions → Apps Script**. A new tab opens with an empty code editor.
3. Delete whatever's in the default `Code.gs` file, and paste in the entire contents of **`code.gs`** from this folder.
4. Click **Deploy → New deployment**.
5. Click the gear icon next to "Select type" → choose **Web app**.
6. Fill in:
   - Description: anything, e.g. "kiosk submissions"
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**. The first time, Google will ask you to authorize it — click through the "Google hasn't verified this app" warning (this is normal for your own script; click **Advanced → Go to [project name] (unsafe)** → **Allow**).
8. Copy the **Web app URL** it gives you (ends in `/exec`).

## Part 3 — Wire them together

1. Open `index.html` (from this folder, or directly on GitHub by clicking the file → the pencil/edit icon).
2. Find this near the top of the `<script>` section:
   ```
   SUBMIT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
   ```
3. Replace the placeholder text with the Web app URL you copied in Part 2, keeping the quotes, e.g.:
   ```
   SUBMIT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
4. While you're in there, also set:
   - `KIOSK_LABEL` — a name for this specific tablet, e.g. `"Main-Tablet-1"`, `"Main-Tablet-2"`, `"Releasing-Tablet"`. Each tablet's copy of the file should have a different label so you can tell submissions apart later.
   - `RECOGNIZE_OPTIONS` — replace the placeholder window numbers/nicknames with the real ones once you send them over.
5. Save the file, and if it's already on GitHub, upload this updated version over the old one (same Upload files screen, GitHub will ask to confirm replacing it).
6. Open the live GitHub Pages link on a tablet, tap through a test submission, and check that a row shows up in the "Responses" tab of your Google Sheet within a few seconds.

## Putting it on a tablet for real use

- Open the live link in the tablet's browser (Chrome).
- Use "Add to Home Screen" (Chrome's menu → Add to Home screen) so it opens full-screen without the address bar, and launch it from that home-screen icon from now on rather than a regular Chrome tab.
- The app itself already asks Chrome to go fullscreen and tries to keep the visitor inside it (see "What the app already does" below), but that's not a hard lock — **Android Screen Pinning is the step that actually matters.** Do this on every tablet before it goes out on the counter:

### Turn on Screen Pinning (do this once per tablet)

1. Open **Settings → Security** (on some Samsung tablets: **Settings → Biometrics and security → Other security settings**) → find **Screen pinning** (sometimes called **App pinning**) → turn it **On**. Also enable "Ask for PIN before unpinning" if offered — that's what stops a visitor from unpinning it themselves.
2. Open the kiosk app from its home-screen icon.
3. Open Android's **Recent Apps / Overview** screen (the square button, or swipe up and hold depending on the tablet).
4. Tap the kiosk app's icon at the top of its card → **Pin this app**.
5. The tablet is now locked to just this app — the Home and Recents buttons won't do anything, and Back only works inside the app itself. To unpin (for maintenance), hold Back and Overview together for a couple seconds, or per that tablet's exact prompt if you turned on the PIN option in step 1.

Do this again any time the tablet restarts, since pinning doesn't survive a reboot.

### What the app already does on its own

None of this replaces Screen Pinning above — it's what keeps things locked down between the moments Screen Pinning can't reach (e.g., before you've pinned it, or if it ever gets unpinned):

- Automatically requests real fullscreen (hides Chrome's UI) on the very first tap, and keeps re-asserting it — if fullscreen is ever exited, the next tap anywhere in the app puts it right back.
- Blocks the long-press "Download image" popup Chrome normally shows on the seal/logo/wave images.
- Absorbs an accidental swipe-back so a stray back-gesture doesn't bounce a visitor out of the page.
- **A staff-only way back in:** hold a finger on the small "PRE-RELEASE / BETA · Developed by LPD" watermark in the bottom-right corner (idle or thank-you screen only) for about 3 seconds. A small panel appears with **Exit Fullscreen** (to reach Chrome's UI / Android's own controls for troubleshooting) and **Reload App** (a quick soft-reset if the page ever looks stuck). This isn't shown or hinted at anywhere else in the app on purpose — it's for whoever is servicing the kiosk, not visitors.

### A few tablet settings worth checking too

- **Screen timeout / sleep:** set it long (or "never" while the office is open) — Settings → Display → Screen timeout. A kiosk that's gone to sleep looks broken to the next visitor.
- **Auto-rotate:** turn it off and lock the orientation you're mounting the tablet in, so a bump doesn't flip the layout.
- **Notifications:** keep the tablet signed out of any personal Google account, or at least mute notifications — a notification banner popping up over the kiosk looks unprofessional and could show private info.
- **Auto-updates for Chrome:** fine to leave on; the app doesn't depend on a specific Chrome version.

## If a tablet has multiple submission sources sharing one Sheet

Every tablet points at the *same* Apps Script URL and the *same* Sheet — Apps Script handles concurrent submissions fine, so 2–3 tablets writing at once is not a problem. The `Kiosk` column is what tells you which tablet each row came from.
