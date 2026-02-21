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

So you can run this MVP without setting up a Reddit API app.

## Run locally

Because this is a static MVP, you can run it with any local server.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
