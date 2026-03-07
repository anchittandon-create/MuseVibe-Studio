import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, MoreVertical, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/tracks');
      const data = await res.json();
      setTracks(data);
    } catch (error) {
      console.error('Failed to fetch tracks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    const interval = setInterval(fetchTracks, 5000); // Poll every 5s for progress
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Your Creations</h2>
            <p className="text-slate-400">Manage your generated tracks and pipelines.</p>
          </div>
          <button onClick={fetchTracks} className="text-slate-400 hover:text-white flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
          {tracks.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No tracks found. Go to Create Music to start generating.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackCard({ track }: { track: any; key?: any }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // If it's generating, we might want to reload the audio source to get the latest bytes
        if (track.status === 'generating') {
          const currentTime = audioRef.current.currentTime;
          audioRef.current.load();
          audioRef.current.currentTime = currentTime;
        }
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isGenerating = track.status === 'generating';
  const isError = track.status === 'error';

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-white text-lg font-semibold truncate max-w-[300px]">{track.trackName}</h4>
          <div className="flex items-center gap-2 mt-1">
            {track.genres?.slice(0, 2).map((g: string) => (
              <span key={g} className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
            <span className="text-slate-500 text-xs">
              {track.durationRequested}s • {track.tempo} BPM
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {track.status === 'completed' && (
            <a
              href={track.audioMasterUrl}
              download
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Download"
            >
              <Download size={18} />
            </a>
          )}
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-primary animate-pulse flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Generating Segment {track.segmentsGenerated + 1}...
            </span>
            <span className="text-slate-400">{track.progressPercentage}%</span>
          </div>
          <div className="w-full bg-background-dark rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${track.progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          <AlertCircle size={16} />
          Generation failed. Please try again.
        </div>
      )}

      {track.status === 'completed' && (
        <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
          <CheckCircle2 size={14} /> Completed
        </div>
      )}

      {/* Audio Player */}
      <div className="relative h-16 w-full bg-background-dark rounded-lg flex items-center px-4 gap-4 overflow-hidden border border-border-dark">
        {(track.durationGenerated > 0 || track.status === 'completed') && track.audioMasterUrl && (
          <audio ref={audioRef} src={track.audioMasterUrl} preload="auto" />
        )}
        
        <button
          onClick={togglePlay}
          disabled={track.durationGenerated === 0 && track.status !== 'completed'}
          className="w-10 h-10 shrink-0 rounded-full bg-white text-black flex items-center justify-center transform hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
        </button>

        <div className="flex-1 flex flex-col justify-center h-full">
          {/* Fake Waveform */}
          <div className="flex items-center gap-0.5 h-8 opacity-60 w-full overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  (i / 40) * (audioRef.current?.duration || track.durationRequested) <= currentTime
                    ? 'bg-primary'
                    : 'bg-slate-600'
                }`}
                style={{
                  height: `${Math.max(20, Math.random() * 100)}%`,
                }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioRef.current?.duration || track.durationRequested || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
