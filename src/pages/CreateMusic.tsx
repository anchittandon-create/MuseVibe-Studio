import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import AISuggestButton from '../components/AISuggestButton';

const GENRES = ['Cinematic', 'Lo-Fi', 'Synthwave', 'Ambient', 'Techno', 'Orchestral', 'Pop', 'Rock', 'Jazz'];
const MOODS = ['Epic', 'Chill', 'Dark', 'Uplifting', 'Melancholic', 'Energetic', 'Dreamy'];

const defaultTrack = {
  trackName: '',
  prompt: '',
  genres: [] as string[],
  moods: [] as string[],
  tempo: 120,
  durationRequested: 60,
  lyrics: '',
  vocalLanguage: 'English',
  vocalStyle: 'None',
  artistInspiration: '',
  structurePreference: 'Standard',
  generateVideo: false,
  videoStyle: 'Cinematic',
};

export default function CreateMusic() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState('Single Track');
  const [albumName, setAlbumName] = useState('');
  const [numSongs, setNumSongs] = useState(3);
  const [tracks, setTracks] = useState([{ ...defaultTrack }]);
  const [expandedTrack, setExpandedTrack] = useState<number>(0);
  const [suggestedFields, setSuggestedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mode === 'Album') {
      setTracks(prev => {
        const newTracks = [...prev];
        while (newTracks.length < numSongs) {
          newTracks.push({ ...defaultTrack });
        }
        return newTracks.slice(0, numSongs);
      });
    } else {
      setTracks(prev => [prev[0] || { ...defaultTrack }]);
    }
  }, [numSongs, mode]);

  const updateTrack = (index: number, field: string, value: any) => {
    setTracks(prev => {
      const newTracks = [...prev];
      newTracks[index] = { ...newTracks[index], [field]: value };
      return newTracks;
    });
  };

  const toggleArrayItem = (index: number, field: 'genres' | 'moods', item: string) => {
    setTracks(prev => {
      const newTracks = [...prev];
      const arr = newTracks[index][field];
      if (arr.includes(item)) {
        newTracks[index][field] = arr.filter((i: string) => i !== item);
      } else {
        newTracks[index][field] = [...arr, item];
      }
      return newTracks;
    });
  };

  const markSuggested = (key: string) => {
    setSuggestedFields(prev => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      for (let i = 0; i < tracks.length; i++) {
        const trackData = {
          ...tracks[i],
          mode,
          albumName: mode === 'Album' ? albumName : undefined,
          trackNumber: mode === 'Album' ? i + 1 : undefined
        };
        await fetch('/api/tracks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackData),
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create track(s)', error);
      setIsGenerating(false);
    }
  };

  const renderTrackFields = (track: any, index: number) => (
    <div className="space-y-6">
      {/* Track Name */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-slate-200 text-sm font-medium">Track Name <span className="text-red-400">*</span></label>
          <AISuggestButton
            fieldName="Track Name"
            currentValue={track.trackName}
            context={track}
            onSuggest={(val) => updateTrack(index, 'trackName', val)}
            isUsed={!!suggestedFields[`track_${index}_trackName`]}
            onMarkUsed={() => markSuggested(`track_${index}_trackName`)}
          />
        </div>
        <input
          type="text"
          value={track.trackName}
          onChange={(e) => updateTrack(index, 'trackName', e.target.value)}
          className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
          placeholder="e.g., Neon Night Drive"
          required
        />
      </div>

      {/* Prompt */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-slate-200 text-sm font-medium">Music Prompt <span className="text-red-400">*</span></label>
          <AISuggestButton
            fieldName="Music Prompt"
            currentValue={track.prompt}
            context={track}
            onSuggest={(val) => updateTrack(index, 'prompt', val)}
            isUsed={!!suggestedFields[`track_${index}_prompt`]}
            onMarkUsed={() => markSuggested(`track_${index}_prompt`)}
          />
        </div>
        <textarea
          value={track.prompt}
          onChange={(e) => updateTrack(index, 'prompt', e.target.value)}
          className="w-full bg-background-dark border border-border-dark rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[120px] resize-none"
          placeholder="Describe the mood, instruments, and style..."
          required
        />
      </div>

      {/* Genres & Moods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-200 text-sm font-medium block">Genres</span>
            <AISuggestButton
              fieldName="Genres"
              currentValue={track.genres}
              context={track}
              onSuggest={(val) => updateTrack(index, 'genres', val)}
              isUsed={!!suggestedFields[`track_${index}_genres`]}
              onMarkUsed={() => markSuggested(`track_${index}_genres`)}
              type="array"
              options={GENRES}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const isSelected = track.genres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleArrayItem(index, 'genres', genre)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-border-dark text-slate-300 border-transparent hover:border-primary/50 hover:bg-primary/10'
                  }`}
                >
                  {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-200 text-sm font-medium block">Moods</span>
            <AISuggestButton
              fieldName="Moods"
              currentValue={track.moods}
              context={track}
              onSuggest={(val) => updateTrack(index, 'moods', val)}
              isUsed={!!suggestedFields[`track_${index}_moods`]}
              onMarkUsed={() => markSuggested(`track_${index}_moods`)}
              type="array"
              options={MOODS}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => {
              const isSelected = track.moods.includes(mood);
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => toggleArrayItem(index, 'moods', mood)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-border-dark text-slate-300 border-transparent hover:border-primary/50 hover:bg-primary/10'
                  }`}
                >
                  {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  {mood}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-200 text-sm font-medium block">
              Tempo: <span className="text-primary font-bold">{track.tempo} BPM</span>
            </span>
            <AISuggestButton
              fieldName="Tempo (BPM)"
              currentValue={track.tempo}
              context={track}
              onSuggest={(val) => updateTrack(index, 'tempo', val)}
              isUsed={!!suggestedFields[`track_${index}_tempo`]}
              onMarkUsed={() => markSuggested(`track_${index}_tempo`)}
              type="number"
              min={60}
              max={200}
            />
          </div>
          <input
            type="range"
            min="60"
            max="200"
            value={track.tempo}
            onChange={(e) => updateTrack(index, 'tempo', parseInt(e.target.value))}
            className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-200 text-sm font-medium block">
              Duration: <span className="text-primary font-bold">{track.durationRequested}s</span>
            </span>
            <AISuggestButton
              fieldName="Duration (seconds)"
              currentValue={track.durationRequested}
              context={track}
              onSuggest={(val) => updateTrack(index, 'durationRequested', val)}
              isUsed={!!suggestedFields[`track_${index}_duration`]}
              onMarkUsed={() => markSuggested(`track_${index}_duration`)}
              type="number"
              min={30}
              max={300}
            />
          </div>
          <input
            type="range"
            min="30"
            max="300"
            step="30"
            value={track.durationRequested}
            onChange={(e) => updateTrack(index, 'durationRequested', parseInt(e.target.value))}
            className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Lyrics & Artist Inspiration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-200 text-sm font-medium">Lyrics <span className="text-slate-500 text-xs font-normal">(Optional)</span></label>
            <AISuggestButton
              fieldName="Lyrics"
              currentValue={track.lyrics}
              context={track}
              onSuggest={(val) => updateTrack(index, 'lyrics', val)}
              isUsed={!!suggestedFields[`track_${index}_lyrics`]}
              onMarkUsed={() => markSuggested(`track_${index}_lyrics`)}
            />
          </div>
          <textarea
            value={track.lyrics}
            onChange={(e) => updateTrack(index, 'lyrics', e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[100px] resize-none"
            placeholder="Write your lyrics here..."
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-200 text-sm font-medium">Artist Inspiration</label>
            <AISuggestButton
              fieldName="Artist Inspiration"
              currentValue={track.artistInspiration}
              context={track}
              onSuggest={(val) => updateTrack(index, 'artistInspiration', val)}
              isUsed={!!suggestedFields[`track_${index}_artistInspiration`]}
              onMarkUsed={() => markSuggested(`track_${index}_artistInspiration`)}
            />
          </div>
          <input
            type="text"
            value={track.artistInspiration}
            onChange={(e) => updateTrack(index, 'artistInspiration', e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
            placeholder="e.g., Hans Zimmer, Daft Punk"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="pt-4 border-t border-border-dark grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-200 text-sm font-medium block">Vocal Language</label>
            <AISuggestButton
              fieldName="Vocal Language"
              currentValue={track.vocalLanguage}
              context={track}
              onSuggest={(val) => updateTrack(index, 'vocalLanguage', val)}
              isUsed={!!suggestedFields[`track_${index}_vocalLanguage`]}
              onMarkUsed={() => markSuggested(`track_${index}_vocalLanguage`)}
              options={['English', 'Spanish', 'French', 'Japanese', 'Korean']}
            />
          </div>
          <select
            value={track.vocalLanguage}
            onChange={(e) => updateTrack(index, 'vocalLanguage', e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Japanese</option>
            <option>Korean</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-200 text-sm font-medium block">Vocal Style</label>
            <AISuggestButton
              fieldName="Vocal Style"
              currentValue={track.vocalStyle}
              context={track}
              onSuggest={(val) => updateTrack(index, 'vocalStyle', val)}
              isUsed={!!suggestedFields[`track_${index}_vocalStyle`]}
              onMarkUsed={() => markSuggested(`track_${index}_vocalStyle`)}
              options={['None', 'Male Pop', 'Female Pop', 'Choir', 'Rap']}
            />
          </div>
          <select
            value={track.vocalStyle}
            onChange={(e) => updateTrack(index, 'vocalStyle', e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
          >
            <option>None</option>
            <option>Male Pop</option>
            <option>Female Pop</option>
            <option>Choir</option>
            <option>Rap</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-slate-200 text-sm font-medium block">Structure Preference</label>
            <AISuggestButton
              fieldName="Structure Preference"
              currentValue={track.structurePreference}
              context={track}
              onSuggest={(val) => updateTrack(index, 'structurePreference', val)}
              isUsed={!!suggestedFields[`track_${index}_structurePreference`]}
              onMarkUsed={() => markSuggested(`track_${index}_structurePreference`)}
              options={['Standard', 'Progressive Build', 'Ambient Drone', 'Verse-Chorus']}
            />
          </div>
          <select
            value={track.structurePreference}
            onChange={(e) => updateTrack(index, 'structurePreference', e.target.value)}
            className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
          >
            <option>Standard</option>
            <option>Progressive Build</option>
            <option>Ambient Drone</option>
            <option>Verse-Chorus</option>
          </select>
        </div>
      </div>

      {/* Video Generation */}
      <div className="pt-4 border-t border-border-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-slate-200 text-sm font-medium block">Generate Music Video</label>
            <p className="text-slate-500 text-xs">Create a synchronized video using Veo 3.1</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={track.generateVideo}
              onChange={(e) => updateTrack(index, 'generateVideo', e.target.checked)}
            />
            <div className="w-11 h-6 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {track.generateVideo && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-200 text-sm font-medium block">Video Style</label>
              <AISuggestButton
                fieldName="Video Style"
                currentValue={track.videoStyle}
                context={track}
                onSuggest={(val) => updateTrack(index, 'videoStyle', val)}
                isUsed={!!suggestedFields[`track_${index}_videoStyle`]}
                onMarkUsed={() => markSuggested(`track_${index}_videoStyle`)}
                options={['Cinematic', 'Anime', 'Cyberpunk', 'Abstract', 'Retro 80s', 'Watercolor']}
              />
            </div>
            <select
              value={track.videoStyle}
              onChange={(e) => updateTrack(index, 'videoStyle', e.target.value)}
              className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
            >
              <option>Cinematic</option>
              <option>Anime</option>
              <option>Cyberpunk</option>
              <option>Abstract</option>
              <option>Retro 80s</option>
              <option>Watercolor</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Create New Track</h2>
            <p className="text-slate-400 text-sm md:text-base">Compose deterministic loops with AI orchestration.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark rounded-xl p-4 md:p-6 shadow-sm space-y-6">
            {/* Mode Selector */}
            <div>
              <span className="text-slate-200 text-sm font-medium mb-3 block">Mode</span>
              <div className="flex bg-background-dark rounded-lg p-1 border border-border-dark w-fit">
                {['Single Track', 'Album'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                      mode === m
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'Album' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-background-dark rounded-xl border border-border-dark">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-200 text-sm font-medium block">Album Name <span className="text-red-400">*</span></label>
                    <AISuggestButton
                      fieldName="Album Name"
                      currentValue={albumName}
                      context={{ mode, numSongs }}
                      onSuggest={setAlbumName}
                      isUsed={!!suggestedFields['album_name']}
                      onMarkUsed={() => markSuggested('album_name')}
                    />
                  </div>
                  <input
                    type="text"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    className="w-full bg-surface-dark border border-border-dark rounded-lg p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="e.g., Midnight Synth"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-200 text-sm font-medium block">Number of Songs</label>
                    <AISuggestButton
                      fieldName="Number of Songs"
                      currentValue={numSongs}
                      context={{ mode, albumName }}
                      onSuggest={setNumSongs}
                      isUsed={!!suggestedFields['album_numSongs']}
                      onMarkUsed={() => markSuggested('album_numSongs')}
                      type="number"
                      min={2}
                      max={12}
                    />
                  </div>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={numSongs}
                    onChange={(e) => setNumSongs(parseInt(e.target.value) || 2)}
                    className="w-full bg-surface-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              {tracks.map((track, index) => {
                if (mode === 'Single Track') {
                  return <div key={index}>{renderTrackFields(track, index)}</div>;
                }

                // Album Mode: Accordion
                const isExpanded = expandedTrack === index;
                return (
                  <div key={index} className="border border-border-dark rounded-xl overflow-hidden bg-background-dark">
                    <button
                      type="button"
                      onClick={() => setExpandedTrack(isExpanded ? -1 : index)}
                      className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-bold text-white">
                          {track.trackName || `Untitled Song ${index + 1}`}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>
                    {isExpanded && (
                      <div className="p-4 md:p-6 border-t border-border-dark bg-surface-dark">
                        {renderTrackFields(track, index)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isGenerating ? (
                <Wand2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {isGenerating ? 'Initializing Pipeline...' : mode === 'Album' ? `Generate Album (${numSongs} Tracks)` : 'Generate Track'}
            </button>
          </form>
        </div>

        {/* Right Column: Info / Pipeline Preview */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6 sticky top-8">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Pipeline Overview</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-border-dark text-slate-500 flex items-center justify-center border border-slate-700">
                    <span className="text-[10px] font-bold">1</span>
                  </div>
                  <div className="w-0.5 h-full bg-border-dark min-h-[24px] my-1"></div>
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-white text-sm font-medium">Intent Analysis</p>
                  <p className="text-slate-400 text-xs">Gemini extracts musical parameters</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-border-dark text-slate-500 flex items-center justify-center border border-slate-700">
                    <span className="text-[10px] font-bold">2</span>
                  </div>
                  <div className="w-0.5 h-full bg-border-dark min-h-[24px] my-1"></div>
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-white text-sm font-medium">Generation Loop</p>
                  <p className="text-slate-400 text-xs">30s segments generated iteratively</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-border-dark text-slate-500 flex items-center justify-center border border-slate-700">
                    <span className="text-[10px] font-bold">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Progressive Stitching</p>
                  <p className="text-slate-400 text-xs">DSP crossfade & master update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
