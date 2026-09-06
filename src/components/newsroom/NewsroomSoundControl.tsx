import { useAudioContext } from '@/contexts/AudioContext';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import type { MusicType } from '@/audio/musicManifest';
export function NewsroomSoundControl() {
  const audio = useAudioContext();
  return <Popover><PopoverTrigger asChild><button type="button" className="press-radio-toggle" aria-label="Newsroom radio"><span aria-hidden="true">♫</span> Radio <i data-playing={audio.isPlaying && !audio.config.muted} /></button></PopoverTrigger>
    <PopoverContent className="press-dialog press-radio" align="end"><header className="press-kicker">PARANOID TIMES · RADIO DESK</header><h2>Stay on the air.</h2>
      <p role="status">{audio.audioStatus}</p>
      <div className="press-actions"><button type="button" className="press-primary" onClick={audio.isPlaying ? audio.pauseMusic : audio.resumeMusic}>{audio.isPlaying ? 'Pause music' : 'Play music'}</button><button type="button" onClick={audio.toggleMute}>{audio.config.muted ? 'Unmute' : 'Mute'}</button></div>
      <label>Master volume · {Math.round(audio.config.volume * 100)}%<input type="range" min="0" max="100" value={audio.config.volume * 100} onChange={e => audio.setVolume(Number(e.target.value) / 100)} /></label>
      <label>Music volume · {Math.round(audio.config.musicVolume * 100)}%<input type="range" min="0" max="100" value={audio.config.musicVolume * 100} onChange={e => audio.setMusicVolume(Number(e.target.value) / 100)} /></label>
      <label>Choose a recording<select value={Object.entries(audio.availableTracks).flatMap(([type, tracks]) => tracks.map(track => ({ key: `${type}:${track.index}`, label: track.label }))).find(track => track.label === audio.currentTrackName)?.key ?? 'theme:0'} onChange={e => { const [type, index] = e.target.value.split(':'); audio.selectTrack(type as MusicType, Number(index)); }}>{Object.entries(audio.availableTracks).map(([type, tracks]) => <optgroup key={type} label={type}>{tracks.map(track => <option key={track.index} value={`${type}:${track.index}`}>{track.label}</option>)}</optgroup>)}</select></label>
      <button type="button" onClick={audio.toggleSFX}>Sound effects: {audio.config.sfxEnabled ? 'on' : 'off'}</button>
    </PopoverContent></Popover>;
}
