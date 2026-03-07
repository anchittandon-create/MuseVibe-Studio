import React, { useState, useRef, useEffect } from 'react';
import { Wand2, RefreshCw, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AISuggestButtonProps {
  fieldName: string;
  currentValue: any;
  context: any;
  onSuggest: (suggestion: any) => void;
  isUsed: boolean;
  onMarkUsed: () => void;
  type?: 'text' | 'number' | 'array';
  options?: string[];
  min?: number;
  max?: number;
}

export default function AISuggestButton({
  fieldName,
  currentValue,
  context,
  onSuggest,
  isUsed,
  onMarkUsed,
  type = 'text',
  options,
  min,
  max,
}: AISuggestButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateSuggestion = async (actionType: 'new' | 'enhance') => {
    setIsGenerating(true);
    setShowOptions(false);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key not found');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = `You are an AI music producer assistant. The user is filling out a music generation form.
Field: ${fieldName}
Context: ${JSON.stringify(context)}
`;
      if (options) {
        prompt += `Available options: ${options.join(', ')}\n`;
      }

      if (actionType === 'enhance') {
        prompt += `Current Value: ${JSON.stringify(currentValue)}\nEnhance this value to make it more creative and professional. `;
      } else {
        prompt += `Suggest a creative, professional value for this field. `;
      }

      if (type === 'number') {
        prompt += `Return ONLY a valid number.`;
        if (min !== undefined && max !== undefined) {
          prompt += ` The number MUST be between ${min} and ${max}.`;
        }
      } else if (type === 'array') {
        prompt += `Return a comma-separated list of values.`;
      } else {
        prompt += `Return ONLY the suggested text, no markdown, no quotes.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const suggestionText = response.text?.trim();
      if (suggestionText) {
        let finalValue: any = suggestionText;
        if (type === 'number') {
          finalValue = parseInt(suggestionText.replace(/[^0-9-]/g, ''), 10);
          if (isNaN(finalValue)) finalValue = currentValue;
          if (min !== undefined && finalValue < min) finalValue = min;
          if (max !== undefined && finalValue > max) finalValue = max;
        } else if (type === 'array') {
          finalValue = suggestionText.split(',').map(s => s.trim()).filter(Boolean);
          if (options) {
            finalValue = finalValue.filter((v: string) => options.includes(v));
          }
        } else if (options) {
          // If it's text but has options (like a select dropdown)
          const matchedOption = options.find(o => o.toLowerCase() === suggestionText.toLowerCase());
          if (matchedOption) finalValue = matchedOption;
          else finalValue = options[0]; // Fallback
        }
        
        onSuggest(finalValue);
        onMarkUsed();
      }
    } catch (error) {
      console.error('Suggest error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="text-xs text-primary flex items-center gap-1">
        <Wand2 size={12} className="animate-spin" />
        Generating...
      </div>
    );
  }

  if (isUsed) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
        >
          <Sparkles size={12} />
          AI Applied
        </button>
        {showOptions && (
          <div className="absolute right-0 mt-1 w-32 bg-surface-darker border border-border-dark rounded-lg shadow-xl z-10 overflow-hidden">
            <button
              type="button"
              onClick={() => generateSuggestion('enhance')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Sparkles size={12} /> Enhance
            </button>
            <button
              type="button"
              onClick={() => generateSuggestion('new')}
              className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2"
            >
              <RefreshCw size={12} /> Create New
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => generateSuggestion('new')}
      className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
    >
      <Wand2 size={12} />
      AI Suggest
    </button>
  );
}
