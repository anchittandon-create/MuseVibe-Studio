import React, { useState } from 'react';
import { Sparkles, Plus, X, ChevronDown, Check } from 'lucide-react';
import { suggestField } from '../services/geminiService';

interface FieldProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'range' | 'toggle';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  context?: any;
  placeholder?: string;
}

export function FormField({ label, value, onChange, type, options = [], min, max, unit, context, placeholder }: FieldProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const localOptions = Array.from(new Set([...options, ...customOptions]));

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setShowSuggestions(true);
    setSuggestError(null);
    try {
      const sugs = await suggestField(label, typeof value === 'string' ? value : JSON.stringify(value), context);
      if (sugs && sugs.length > 0) {
        setSuggestions(sugs);
      } else {
        setSuggestError("No suggestions available or rate limit exceeded.");
        setSuggestions([]);
      }
    } catch (e: any) {
      console.error(e);
      setSuggestError(e.message || "Failed to fetch suggestions.");
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (sug: string) => {
    if (type === 'multiselect') {
      if (!value.includes(sug)) {
        onChange([...value, sug]);
      }
    } else {
      onChange(sug);
    }
    setShowSuggestions(false);
  };

  const handleAddCustom = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customInput.trim()) {
      e.preventDefault();
      const val = customInput.trim();
      
      if (!localOptions.includes(val)) {
        setCustomOptions([...customOptions, val]);
      }
      
      if (type === 'multiselect') {
        if (!value.includes(val)) {
          onChange([...value, val]);
        }
      } else if (type === 'select') {
        onChange(val);
        setIsOpen(false);
      }
      setCustomInput('');
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-300">{label}</label>
        {type !== 'toggle' && (
          <button
            type="button"
            onClick={handleSuggest}
            disabled={isSuggesting}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
          >
            <Sparkles size={12} />
            {isSuggesting ? 'Thinking...' : 'AI Suggest'}
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="mb-3 p-3 bg-surface-dark border border-primary/30 rounded-lg shadow-lg relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-primary">AI Suggestions</span>
            <button type="button" onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          
          {suggestError ? (
            <p className="text-xs text-red-400">{suggestError}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className="text-xs bg-surface-darker hover:bg-primary/20 border border-border-dark hover:border-primary/50 text-slate-200 px-3 py-1.5 rounded-full transition-colors text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
        />
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none"
        />
      )}

      {type === 'select' && (
        <div className="relative">
          <div 
            className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-white flex justify-between items-center cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{value || placeholder || 'Select an option'}</span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-darker border border-border-dark rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-border-dark sticky top-0 bg-surface-darker">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={handleAddCustom}
                  placeholder="Type custom value and press Enter"
                  className="w-full bg-surface-dark border border-border-dark rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {localOptions.map((opt) => (
                <div
                  key={opt}
                  className="px-4 py-2 hover:bg-surface-dark cursor-pointer text-sm text-slate-200 flex items-center justify-between"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                  {value === opt && <Check size={14} className="text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {type === 'multiselect' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {value.map((v: string) => (
              <span key={v} className="bg-surface-dark border border-border-dark text-slate-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                {v}
                <button type="button" onClick={() => onChange(value.filter((item: string) => item !== v))} className="text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <div 
              className="w-full bg-surface-darker border border-border-dark rounded-lg px-4 py-2.5 text-slate-400 flex justify-between items-center cursor-pointer text-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>Add options...</span>
              <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-darker border border-border-dark rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-border-dark sticky top-0 bg-surface-darker">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleAddCustom}
                    placeholder="Type custom value and press Enter"
                    className="w-full bg-surface-dark border border-border-dark rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {localOptions.filter(opt => !value.includes(opt)).map((opt) => (
                  <div
                    key={opt}
                    className="px-4 py-2 hover:bg-surface-dark cursor-pointer text-sm text-slate-200"
                    onClick={() => {
                      onChange([...value, opt]);
                      setIsOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {type === 'range' && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{min} {unit}</span>
            <span className="font-bold text-white">{value} {unit}</span>
            <span>{max} {unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      )}

      {type === 'toggle' && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-surface-darker border border-border-dark'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${value ? 'left-7' : 'left-1'}`} />
          </button>
          <span className="ml-3 text-sm text-slate-300">{value ? 'On' : 'Off'}</span>
        </div>
      )}
    </div>
  );
}
