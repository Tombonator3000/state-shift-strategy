# Audio System - Sound Effects Integration Guide

## Current Status

The game's audio system is fully functional with the following sound effects:

### ✅ Working Sound Effects
- **UI Sounds**: click, hover, lightClick, error
- **Gameplay**: cardPlay, cardDraw, turnEnd, newspaper, stateCapture
- **Music**: victory, defeat, typewriter
- **Background Music**: Theme, Government, Truth, End Credits tracks

### 🔄 Paranormal Effects (Using Fallbacks)
The following paranormal sound effects are currently using existing sounds as placeholders:

- **`ufo-elvis`** → Using background music (for UFO/Elvis broadcasts)
- **`cryptid-rumble`** → Using defeat sound (for cryptid encounters) 
- **`radio-static`** → Using typewriter sound (for radio interference)

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
Place the downloaded files in `public/audio/` with these exact names:
```
public/audio/ufo-elvis.mp3      # UFO/alien broadcast sound
public/audio/radio-static.mp3   # Radio interference/static
public/audio/cryptid-rumble.mp3 # Deep rumble/monster sound
```

### 5. Testing
Use the in-game audio controls (settings gear icon) to:
- Test each sound effect individually
- Verify volume levels
- Check that paranormal sounds trigger properly

## Current Fallback Mapping

Until proper sounds are added, the system uses:

```javascript
'ufo-elvis': '/audio/Background-music.mp3',      // → Proper alien/UFO sound needed
'cryptid-rumble': '/audio/defeat.mp3',          // → Deep rumble/earthquake needed  
'radio-static': '/audio/typewriter.mp3'         // → Radio static/interference needed
```

## When Sounds Are Added

The audio system will automatically:
1. Detect the new files on next page load
2. Replace fallback sounds with proper effects
3. Show "✅ Loaded" status in audio controls
4. Play authentic paranormal sounds during gameplay

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