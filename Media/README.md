# Adding your media

Drop files into the matching folder, then list them in [`js/projects.js`](../js/projects.js) — nothing else needs to change.

```
Media/
  logo/         static-frames-silver.png (original), -cropped.png, -favicon.png
  about/        headshot-01.jpg (used on Contact)
  narrative/    drop clips/photos for Narrative projects here
  commercial/   drop clips/photos for Commercial & Corporate projects here
  personal/     drop clips/photos for Personal Projects here
  stills/       drop photos for the Stills page here
```

## Local video or photo

Open `js/projects.js` and edit an entry:

```js
{ id: 'narrative-01', category: 'narrative', featured: true,
  title: 'Your Project Title', client: 'Director / Production Co.',
  type: 'video', thumb: 'Media/narrative/poster.jpg', src: 'Media/narrative/clip.mp4' }
```

- `type: 'video'` — plays muted and looped right in the grid tile. Needs `src` (and ideally a `thumb` poster).
- `type: 'image'` — a still poster frame. Needs `thumb`.
- `type: 'placeholder'` — leave as-is until you have media; shows a styled "media pending" tile.

## Hosted video (Vimeo / YouTube)

```js
{ id: 'commercial-02', category: 'commercial', featured: false,
  title: 'Your Project Title', client: 'Brand / Agency',
  type: 'embed', thumb: 'Media/commercial/poster.jpg', embedUrl: 'https://vimeo.com/xxxxxxx' }
```

The tile links out to the hosted video in a new tab, using `thumb` as the cover image.

## Stills page

Edit the `STILLS` array at the bottom of the same file — same idea, just `image` and an optional `ratio` (e.g. `'4/5'`, `'1/1'`, `'16/9'`) for placeholder sizing.

## Homepage

Set `featured: true` on any project to also show it on the Selected Work landing page.
