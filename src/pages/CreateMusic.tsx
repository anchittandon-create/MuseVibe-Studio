import React, { useState } from 'react';
import { Play, Loader2, Music, Disc, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { FormField } from '../components/FormField';

type Mode = 'Song' | 'Album';

const GENRE_OPTIONS = ['Techno', 'Hard Techno', 'Industrial Techno', 'Warehouse Techno', 'Minimal Techno', 'Peak Time Techno', 'House', 'Deep House', 'Progressive House', 'Dubstep', 'Drum & Bass', 'Hardstyle', 'Ambient', 'Synthwave', 'Hip Hop', 'Rock', 'Jazz', 'Classical'];
const MOOD_OPTIONS = ['Dark', 'Epic', 'Energetic', 'Melancholic', 'Hypnotic', 'Dreamy', 'Atmospheric', 'Aggressive', 'Industrial', 'Futuristic'];
const DURATION_OPTIONS = ['30 sec', '1 min', '2 min', '3 min', '4 min', '5 min', '10 min'];
const ARTIST_OPTIONS = ['Hans Zimmer', 'Daft Punk', 'Charlotte de Witte', 'Eric Prydz', 'Deadmau5', 'Amelie Lens', 'Tale of Us'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Instrumental'];
const VOCAL_STYLE_OPTIONS = ['Male Vocal', 'Female Vocal', 'Robotic Vocal', 'Choir', 'Rap', 'Instrumental'];
const STRUCTURE_OPTIONS = ['Standard', 'Verse Chorus', 'Build Drop', 'Ambient Flow', 'Cinematic'];
const VIDEO_STYLE_OPTIONS = ['Cinematic', 'Cyberpunk', 'Anime', 'Abstract', 'Retro', 'AI Art'];
const NUM_SONGS_OPTIONS = ['2', '3', '4', '5', '10', '20'];

interface TrackData {
  id: string;
  trackName: string;
  musicPrompt: string;
  genres: string[];
  moods: string[];
  tempo: number;
  duration: string;
  lyrics: string;
  artistInspiration: string[];
  vocalLanguage: string;
  vocalStyle: string;
  structure: string;
  energy: number;
  creativity: number;
  generateVideo: boolean;
  videoStyle: string;
  videoDescription: string;
}

const defaultTrackData = (): TrackData => ({
  id: Math.random().toString(36).substr(2, 9),
  trackName: '',
  musicPrompt: '',
  genres: [],
  moods: [],
  tempo: 120,
  duration: '3 min',
  lyrics: '',
  artistInspiration: [],
  vocalLanguage: 'Instrumental',
  vocalStyle: 'Instrumental',
  structure: 'Standard',
  energy: 7,
  creativity: 7,
  generateVideo: false,
  videoStyle: 'Cinematic',
  videoDescription: ''
});

export default function CreateMusic() {
  const [mode, setMode] = useState<Mode>('Song');
  const [isGenerating, setIsGenerating] = useState(false);

  // Album Mode State
  const [albumName, setAlbumName] = useState('');
  const [albumVibePrompt, setAlbumVibePrompt] = useState('');
  const [numSongs, setNumSongs] = useState('2');
  
  // Tracks State (Used for both Song and Album)
  const [tracks, setTracks] = useState<TrackData[]>([defaultTrackData()]);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(tracks[0].id);

  const handleNumSongsChange = (val: string) => {
    setNumSongs(val);
    const num = parseInt(val);
    if (num > tracks.length) {
      const newTracks = [...tracks];
      for (let i = tracks.length; i < num; i++) {
        newTracks.push(defaultTrackData());
      }
      setTracks(newTracks);
    } else if (num < tracks.length) {
      setTracks(tracks.slice(0, num));
    }
  };

  const updateTrack = (id: string, field: keyof TrackData, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      for (const track of tracks) {
        let durationRequested = 180; // default 3 min
        if (track.duration.includes('sec')) {
          durationRequested = parseInt(track.duration);
        } else if (track.duration.includes('min')) {
          durationRequested = parseInt(track.duration) * 60;
        }

        const payload = {
          trackName: track.trackName || 'Untitled Track',
          prompt: mode === 'Album' ? `${albumVibePrompt} ${track.musicPrompt}` : track.musicPrompt,
          genres: track.genres,
          moods: track.moods,
          tempo: track.tempo,
          durationRequested,
          lyrics: track.lyrics,
          artistInspiration: track.artistInspiration,
          vocalLanguage: track.vocalLanguage,
          vocalStyle: track.vocalStyle,
          structure: track.structure,
          energy: track.energy,
          creativity: track.creativity,
          generateVideo: track.generateVideo,
          videoStyle: track.videoStyle,
          videoDescription: track.videoDescription,
          albumName: mode === 'Album' ? albumName : undefined
        };

        const response = await fetch('/api/tracks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to start generation');
        }
      }
      
      // Redirect to dashboard after starting generation
      window.location.href = '/dashboard';
    } catch (e) {
      console.error('Generation error:', e);
      alert('Failed to start generation. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTrackForm = (track: TrackData, index: number, isAlbum: boolean) => {
    const isExpanded = expandedTrack === track.id || !isAlbum;
    const currentContext = { mode, albumVibePrompt, ...track };

    return (
      <div key={track.id} className={`bg-surface-darker border border-border-dark rounded-xl overflow-hidden ${isAlbum ? 'mb-4' : ''}`}>
        {isAlbum && (
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-surface-dark transition-colors"
            onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-white">{track.trackName || `Track ${index + 1}`}</h3>
            </div>
            {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </div>
        )}

        {isExpanded && (
          <div className={`p-6 ${isAlbum ? 'border-t border-border-dark' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="md:col-span-2">
                <FormField label="Track Name" value={track.trackName} onChange={(v) => updateTrack(track.id, 'trackName', v)} type="text" placeholder="e.g. Dark Frequency" context={currentContext} />
                <FormField label="Music Prompt" value={track.musicPrompt} onChange={(v) => updateTrack(track.id, 'musicPrompt', v)} type="textarea" placeholder="Industrial warehouse techno with hypnotic basslines..." context={currentContext} />
              </div>

              <FormField label="Genres" value={track.genres} onChange={(v) => updateTrack(track.id, 'genres', v)} type="multiselect" options={GENRE_OPTIONS} context={currentContext} />
              <FormField label="Moods" value={track.moods} onChange={(v) => updateTrack(track.id, 'moods', v)} type="multiselect" options={MOOD_OPTIONS} context={currentContext} />
              
              <FormField label="Tempo Range" value={track.tempo} onChange={(v) => updateTrack(track.id, 'tempo', v)} type="range" min={60} max={200} unit="BPM" context={currentContext} />
              <FormField label="Duration" value={track.duration} onChange={(v) => updateTrack(track.id, 'duration', v)} type="select" options={DURATION_OPTIONS} context={currentContext} />
              
              <div className="md:col-span-2">
                <FormField label="Lyrics (Optional)" value={track.lyrics} onChange={(v) => updateTrack(track.id, 'lyrics', v)} type="textarea" placeholder="Enter custom lyrics or generate them..." context={currentContext} />
              </div>

              <FormField label="Artist Inspiration" value={track.artistInspiration} onChange={(v) => updateTrack(track.id, 'artistInspiration', v)} type="multiselect" options={ARTIST_OPTIONS} context={currentContext} />
              <FormField label="Structure Preference" value={track.structure} onChange={(v) => updateTrack(track.id, 'structure', v)} type="select" options={STRUCTURE_OPTIONS} context={currentContext} />

              <FormField label="Vocal Language" value={track.vocalLanguage} onChange={(v) => updateTrack(track.id, 'vocalLanguage', v)} type="select" options={LANGUAGE_OPTIONS} context={currentContext} />
              <FormField label="Vocal Style" value={track.vocalStyle} onChange={(v) => updateTrack(track.id, 'vocalStyle', v)} type="select" options={VOCAL_STYLE_OPTIONS} context={currentContext} />

              <FormField label="Energy Level" value={track.energy} onChange={(v) => updateTrack(track.id, 'energy', v)} type="range" min={1} max={10} context={currentContext} />
              <FormField label="Creativity Level" value={track.creativity} onChange={(v) => updateTrack(track.id, 'creativity', v)} type="range" min={1} max={10} context={currentContext} />
            </div>

            <div className="mt-8 pt-6 border-t border-border-dark">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Play className="text-primary" size={18} /> Video Generation
              </h4>
              
              <FormField label="Generate Music Video" value={track.generateVideo} onChange={(v) => updateTrack(track.id, 'generateVideo', v)} type="toggle" context={currentContext} />
              
              {track.generateVideo && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <FormField label="Video Style" value={track.videoStyle} onChange={(v) => updateTrack(track.id, 'videoStyle', v)} type="select" options={VIDEO_STYLE_OPTIONS} context={currentContext} />
                  <div className="md:col-span-2">
                    <FormField label="Video Description Prompt" value={track.videoDescription} onChange={(v) => updateTrack(track.id, 'videoDescription', v)} type="textarea" placeholder="A cyberpunk warehouse rave with neon lights..." context={currentContext} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Music</h1>
        <p className="text-slate-400">Define your sonic identity and let Gemini synthesize it.</p>
      </div>

      <div className="bg-surface-dark border border-border-dark rounded-xl p-6 mb-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setMode('Song');
              setTracks([tracks[0]]);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'Song' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface-darker text-slate-400 hover:text-white hover:bg-surface-darker/80 border border-border-dark'
            }`}
          >
            <Music size={20} />
            Single Track
          </button>
          <button
            onClick={() => {
              setMode('Album');
              handleNumSongsChange(numSongs);
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              mode === 'Album' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface-darker text-slate-400 hover:text-white hover:bg-surface-darker/80 border border-border-dark'
            }`}
          >
            <Disc size={20} />
            Full Album
          </button>
        </div>

        {mode === 'Album' && (
          <div className="mb-10 p-6 bg-surface-darker border border-primary/20 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Disc className="text-primary" /> Album Details
            </h2>
            <FormField label="Album Name" value={albumName} onChange={setAlbumName} type="text" placeholder="e.g. Neon Nights" context={{ mode }} />
            <FormField label="Album Vibe Prompt" value={albumVibePrompt} onChange={setAlbumVibePrompt} type="textarea" placeholder="Describe the overall sonic identity of the album..." context={{ mode }} />
            <FormField label="Number of Songs" value={numSongs} onChange={handleNumSongsChange} type="select" options={NUM_SONGS_OPTIONS} context={{ mode }} />
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-border-dark pb-4">
            <Music className="text-primary" /> {mode === 'Album' ? 'Album Tracks' : 'Track Details'}
          </h2>
          
          <div className="space-y-4">
            {tracks.map((track, index) => renderTrackForm(track, index, mode === 'Album'))}
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Initializing Synthesis...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate {mode === 'Album' ? 'Album' : 'Track'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
