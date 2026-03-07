import { Link } from 'react-router-dom';
import { Sparkles, Music } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center min-h-full">
      <div className="max-w-3xl text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <Music className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Gemini Music Studio
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-medium">
          Compose deterministic loops with AI orchestration.
        </p>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Experience the next generation of AI music synthesis. Our platform uses Gemini's advanced reasoning to orchestrate seamless, continuous audio tracks. Generate professional-grade music in fixed segments, progressively stitched into a single, cohesive master file.
        </p>
        <div className="pt-8">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95 text-lg"
          >
            <Sparkles size={24} />
            Create Music
          </Link>
        </div>
      </div>
    </div>
  );
}
