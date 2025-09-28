# Audio Files for Shadow Government Game

This directory should contain the following audio files:

## Background Music
- `background-music.mp3` - Main theme (atmospheric/conspiracy themed)

## Sound Effects
- `card-play.mp3` - When playing a card
- `card-draw.mp3` - When drawing cards
- `state-capture.mp3` - When capturing a state
- `turn-end.mp3` - End turn sound
- `newspaper.mp3` - Newspaper opening/closing
- `victory.mp3` - Victory sound
- `defeat.mp3` - Defeat sound
- `hover.mp3` - UI hover sound
- `click.mp3` - UI click sound
- `typewriter.mp3` - Typewriter effect for text

### Procedural Paranormal Effects
- `paranormal-sfx.json` – Manifest describing the bundled procedural stingers.
- The UFO, cryptid, and radio static clips are embedded as base64-encoded WAV data URLs in
  [`src/assets/audio/paranormalSfx.ts`](../../src/assets/audio/paranormalSfx.ts).
- Regenerate them with `python tools/generate_paranormal_sfx.py` if you want to tweak the synthesis
  parameters.

### Licensing Notes
- The procedural paranormal clips are generated in-house via the Python script above and are released
  under the Creative Commons Zero v1.0 Universal (CC0) license for unrestricted reuse.

## Audio Sources
You can find royalty-free audio at:
- Freesound.org
- Zapsplat.com
- YouTube Audio Library
- Pixabay Audio

## Format Requirements
- MP3 format recommended for web compatibility
- Keep file sizes reasonable (< 1MB for SFX, < 5MB for music)
- Consider looping background music
- Normalize volume levels across all files
