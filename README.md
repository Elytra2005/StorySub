# StorySub (MVP)

StorySub is a lightweight Reddit story reader/listener app inspired by the browsing + playback flow of Spotify, but with a Reddit-first UI and color system.

## What it does

- No landing page; opens directly to the Discover experience.
- Category chips for story subreddits:
  - r/shortstories
  - r/nosleep
  - r/tifu
  - r/LetsNotMeet
  - r/Glitch_in_the_Matrix
  - r/WritingPrompts
- Search stories by title/content.
- Click a story and listen via in-browser text-to-speech controls (play/pause/prev/next).

## Data source (no Reddit OAuth required)

This app uses Reddit's public JSON feed endpoint per subreddit:

`https://www.reddit.com/r/<subreddit>/top.json?limit=25&t=month&raw_json=1`

If that endpoint is blocked in your network/browser, the app automatically falls back to:

- `https://old.reddit.com/...`
- `https://api.allorigins.win/raw?url=...`

So you can run this MVP without setting up a Reddit API app.

## Preview locally

### Option A (recommended)

```bash
./preview.sh
```

Then open `http://127.0.0.1:4173`.

### Option B (manual)

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`.

## If you see `ERR_CONNECTION_REFUSED`

That error means there is no local web server currently running on that port.

Try this checklist:

1. Start the server in this project directory:
   ```bash
   cd /workspace/StorySub
   ./preview.sh
   ```
2. Keep that terminal window open while previewing.
3. Open the exact URL shown by the script (default `http://127.0.0.1:4173`).
4. If port `4173` is taken, run a different port:
   ```bash
   ./preview.sh 8080
   ```
   and open `http://127.0.0.1:8080`.
5. If you are in a remote/container environment, use the environment's forwarded URL for the same port.
