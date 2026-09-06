# Paranoid Times recordings

The game uses the original recordings, loaded on demand by `src/audio/NewsroomRadio.ts`.
Paths are resolved relative to Vite's deployment base (Lovable `/`, GitHub Pages `/state-shift-strategy/`).

- Menu: `Theme-2.mp3`.
- Government: `Government-1.mp3` through `Government-5.mp3`.
- Truth: `Truth-1.mp3` through `Truth-5.mp3`.
- Credits: `endcredits-theme.mp3`.

`Theme-1.mp3` contains only two CR/LF bytes, including in the available Git history.
It is preserved but excluded from the playlist. Do not claim it has been recovered.
Twelve other tracks pass the media probe recorded in `docs/qa/tabloid-2026-09-06/audio-audit.json`.

Start/resume requires a player gesture when the browser blocks autoplay. Pause remains paused across scenes.
Unavailable recordings are skipped within a bounded playlist; errors remain visible with a retry action.
Music streams without Cache Storage. The browser may still use its ordinary HTTP cache.
The old crossfade preference is retained for save compatibility; transitions currently switch tracks directly.
