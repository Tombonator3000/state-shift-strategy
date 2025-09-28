# Audio System - Sound Effects Integration Guide

## Current Status

The game's audio system is fully functional with the following sound effects:

### ✅ Working Sound Effects
- **UI Sounds**: click, hover, lightClick, error
- **Gameplay**: cardPlay, cardDraw, turnEnd, newspaper, stateCapture
- **Music**: victory, defeat, typewriter
- **Paranormal**: `ufo-elvis`, `cryptid-rumble`, `radio-static` (procedural WAV data URLs)
- **Background Music**: Theme, Government, Truth, End Credits tracks

## Adding Proper Paranormal Sound Effects

To replace the fallback sounds with proper paranormal audio:

### 1. Find Free Sound Effects

**Recommended Sources:**
- **Pixabay**: https://pixabay.com/sound-effects/ (CC0 License)
- **Freesound**: https://freesound.org (Various Creative Commons)
- **SoundBible**: https://soundbible.com (Attribution 3.0)
- **OpenGameArt**: https://opengameart.org (Various licenses)

### 2. Search Terms
- **UFO Sound**: "alien sound", "UFO", "sci-fi effect", "electronic beep"
- **Radio Static**: "radio static", "white noise", "interference", "TV static"
- **Cryptid Rumble**: "rumble", "earthquake", "low frequency", "monster growl"

### 3. File Requirements
- **Format**: MP3 (preferred) or WAV
- **Duration**: 1-4 seconds for effects
- **Quality**: 44.1kHz, 16-bit minimum
- **Volume**: Moderate level (will be controlled by game volume)

### 4. Installation
- **Bundled clips**: The repo ships synthesized paranormal effects encoded as base64 WAV data URLs in
  `src/assets/audio/paranormalSfx.ts`. No extra binaries are required.
- **Regenerating**: Run `python tools/generate_paranormal_sfx.py` to tweak or regenerate the procedural
  stingers. The script updates both the TypeScript constants and a manifest file at
  `public/audio/paranormal-sfx.json`.
- **Custom replacements**: If you design new sounds, drop MP3 files into `public/audio/` with these exact
  names and update the mapping in `src/hooks/useAudio.ts` to point at the new assets:
  ```
  public/audio/ufo-elvis.mp3      # Shortwave-style UFO bulletin sting
  public/audio/cryptid-rumble.mp3 # Deep rumble/monster sound
  public/audio/radio-static.mp3   # Radio interference/static
  ```

### 5. Testing
Use the in-game audio controls (settings gear icon) to:
- Test each sound effect individually
- Verify volume levels
- Check that paranormal sounds trigger properly

## Current Mapping Snapshot

```javascript
import {
  UFO_ELVIS_SFX,
  CRYPTID_RUMBLE_SFX,
  RADIO_STATIC_SFX,
} from '../assets/audio/paranormalSfx';

'ufo-elvis': UFO_ELVIS_SFX,
'cryptid-rumble': CRYPTID_RUMBLE_SFX,
'radio-static': RADIO_STATIC_SFX,
```

## When Sounds Are Replaced

If you swap in new paranormal clips, the audio system will automatically:
1. Detect the files on next page load
2. Load them alongside the other effects
3. Show "✅ Loaded" status in audio controls
4. Play your custom paranormal sounds during gameplay

## License Compliance

When using Creative Commons or Attribution licensed sounds:
1. Note the license requirements
2. Add attribution to credits if required
3. Ensure commercial use is allowed (if applicable)

## Troubleshooting

**If sounds don't play:**
- Check browser console for 🎵 audio log messages
- Verify file names exactly match requirements
- Ensure files are not corrupted
- Try refreshing the page to reload audio system

**If sounds are too loud/quiet:**
- Use the master volume control in audio settings
- Consider editing the audio file volume before adding to game