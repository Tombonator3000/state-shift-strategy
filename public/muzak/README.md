# Music Files for Shadow Government Game

This directory contains the dynamic background music system for the game.

## File Structure

### Theme Music (Menu/Neutral)
- `Theme-1.mp3` - Main theme track 1
- `Theme-2.mp3` - Main theme track 2

### Government Faction Music
- `Government-1.mp3` - Deep State track 1
- `Government-2.mp3` - Deep State track 2
- `Government-3.mp3` - Deep State track 3
- `Government-4.mp3` - Deep State track 4
- `Government-5.mp3` - Deep State track 5

### Truth Seekers Faction Music
- `Truth-1.mp3` - Truth Seekers track 1
- `Truth-2.mp3` - Truth Seekers track 2
- `Truth-3.mp3` - Truth Seekers track 3
- `Truth-4.mp3` - Truth Seekers track 4
- `Truth-5.mp3` - Truth Seekers track 5

## How It Works

1. **Start Screen**: Plays theme music (Theme-*.mp3) on loop
2. **Faction Selection**: When hovering/selecting a faction, fades to that faction's music
3. **Gameplay**: Alternates between faction music and theme music for variety
4. **Transitions**: All music changes use smooth fade-in/fade-out (2 second crossfade)

## Audio Format Requirements

- MP3 format for web compatibility
- 44.1kHz sample rate recommended
- Stereo or mono acceptable
- Keep file sizes reasonable (< 5MB each)
- Normalize volume levels across all tracks
- No silence at beginning/end for smooth looping

## Thematic Guidelines

### Theme Music
- Atmospheric, conspiracy-themed
- Neutral mood - works for both factions
- Mysterious, government intrigue feeling

### Government Music  
- Authoritative, powerful
- Corporate/establishment feel
- Orchestral or electronic elements

### Truth Seekers Music
- Alternative, underground vibe
- Rebellious, investigative mood
- Rock, electronic, or folk elements

