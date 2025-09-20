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

### Procedural Assets
- `ufo-elvis` sting is bundled as an in-code base64 WAV data URL (`src/assets/audio/ufoElvisDataUrl.ts`). Override this file if you
  want to ship a different broadcast clip.

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