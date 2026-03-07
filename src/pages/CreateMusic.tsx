import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Plus, Check, Play } from 'lucide-react';

const GENRES = ['Cinematic', 'Lo-Fi', 'Synthwave', 'Ambient', 'Techno', 'Orchestral', 'Pop', 'Rock', 'Jazz'];
const MOODS = ['Epic', 'Chill', 'Dark', 'Uplifting', 'Melancholic', 'Energetic', 'Dreamy'];

export default function CreateMusic() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    mode: 'Single Track',
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
    videoStyle: 'Abstract',
  });

  const [suggestingField, setSuggestingField] = useState<string | null>(null);

  const handleSuggest = async (fieldName: string) => {
    setSuggestingField(fieldName);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName,
          currentValue: (formData as any)[fieldName],
          fullContext: formData,
        }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setFormData((prev) => ({ ...prev, [fieldName]: data.suggestion }));
      }
    } catch (error) {
      console.error('Failed to get suggestion', error);
    } finally {
      setSuggestingField(null);
    }
  };

  const toggleArrayItem = (field: 'genres' | 'moods', item: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const track = await res.json();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create track', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create New Track</h2>
            <p className="text-slate-400">Compose deterministic loops with AI orchestration.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark rounded-xl p-6 shadow-sm space-y-6">
            {/* Mode Selector */}
            <div>
              <span className="text-slate-200 text-sm font-medium mb-3 block">Mode</span>
              <div className="flex bg-background-dark rounded-lg p-1 border border-border-dark w-fit">
                {['Single Track', 'Album'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, mode })}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                      formData.mode === mode
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Track Name */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-200 text-sm font-medium">Track Name</label>
                <button
                  type="button"
                  onClick={() => handleSuggest('trackName')}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  <Wand2 size={12} className={suggestingField === 'trackName' ? 'animate-spin' : ''} />
                  AI Suggest
                </button>
              </div>
              <input
                type="text"
                value={formData.trackName}
                onChange={(e) => setFormData({ ...formData, trackName: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                placeholder="e.g., Neon Night Drive"
                required
              />
            </div>

            {/* Prompt */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-200 text-sm font-medium">Music Prompt</label>
                <button
                  type="button"
                  onClick={() => handleSuggest('prompt')}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  <Wand2 size={12} className={suggestingField === 'prompt' ? 'animate-spin' : ''} />
                  AI Suggest
                </button>
              </div>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full bg-background-dark border border-border-dark rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none min-h-[120px] resize-none"
                placeholder="Describe the mood, instruments, and style..."
                required
              />
            </div>

            {/* Genres & Moods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-slate-200 text-sm font-medium mb-3 block">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => {
                    const isSelected = formData.genres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleArrayItem('genres', genre)}
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
                <span className="text-slate-200 text-sm font-medium mb-3 block">Moods</span>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => {
                    const isSelected = formData.moods.includes(mood);
                    return (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => toggleArrayItem('moods', mood)}
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
                <span className="text-slate-200 text-sm font-medium mb-3 block">
                  Tempo: <span className="text-primary font-bold">{formData.tempo} BPM</span>
                </span>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={formData.tempo}
                  onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
                  className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <span className="text-slate-200 text-sm font-medium mb-3 block">
                  Duration: <span className="text-primary font-bold">{formData.durationRequested}s</span>
                </span>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="30"
                  value={formData.durationRequested}
                  onChange={(e) => setFormData({ ...formData, durationRequested: parseInt(e.target.value) })}
                  className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="pt-4 border-t border-border-dark grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-slate-200 text-sm font-medium mb-2 block">Vocal Style</label>
                <select
                  value={formData.vocalStyle}
                  onChange={(e) => setFormData({ ...formData, vocalStyle: e.target.value })}
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
                <label className="text-slate-200 text-sm font-medium mb-2 block">Structure Preference</label>
                <select
                  value={formData.structurePreference}
                  onChange={(e) => setFormData({ ...formData, structurePreference: e.target.value })}
                  className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                >
                  <option>Standard</option>
                  <option>Progressive Build</option>
                  <option>Ambient Drone</option>
                  <option>Verse-Chorus</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Wand2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {isGenerating ? 'Initializing Pipeline...' : 'Generate Track'}
            </button>
          </form>
        </div>

        {/* Right Column: Info / Pipeline Preview */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6">
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
