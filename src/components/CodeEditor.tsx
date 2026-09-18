import React, { useState, useRef, useEffect } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Trash2, 
  Maximize2, 
  FileCode, 
  Sparkles, 
  AlertCircle,
  Vibrate,
  Volume2,
  Database,
  Smartphone
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear editor content?')) {
      onChange('<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>');
    }
  };

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Handle Tab key inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newText = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newText);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertSnippet = (snippet: string) => {
    onChange(code + '\n\n' + snippet);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Editor Top Bar */}
      <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-semibold text-emerald-400">
            <FileCode className="w-3.5 h-3.5" />
            <span>index.html</span>
          </div>
          <span className="text-xs text-slate-400">
            {lineCount} lines • {(code.length / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Snippets Dropdown */}
          <div className="relative group">
            <button 
              id="insert-snippet-button"
              className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Snippets</span>
            </button>
            <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-1.5 hidden group-hover:block z-20 backdrop-blur-md">
              <button
                onClick={() => insertSnippet(`<script>
// Haptic vibration feedback
function vibrateDevice() {
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
}
</script>`)}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Vibrate className="w-3.5 h-3.5 text-pink-400" />
                <span>Vibration API</span>
              </button>

              <button
                onClick={() => insertSnippet(`<script>
// Persistent LocalStorage
function saveAppState(key, data) {
  localStorage.setItem('myapp_' + key, JSON.stringify(data));
}
function loadAppState(key) {
  const d = localStorage.getItem('myapp_' + key);
  return d ? JSON.parse(d) : null;
}
</script>`)}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Storage Helper</span>
              </button>

              <button
                onClick={() => insertSnippet(`<script>
// Web Audio Synth Click
function playBeep(freq = 440) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
</script>`)}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Audio Synth Effect</span>
              </button>
            </div>
          </div>

          {/* Copy Button */}
          <button
            id="copy-code-button"
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Button */}
          <button
            id="clear-code-button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Reset code"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Textarea with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-sm bg-slate-950">
        
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="w-12 py-3 bg-slate-900/50 border-r border-slate-800/80 text-slate-600 select-none text-right pr-3 overflow-hidden text-xs leading-6"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          id="html-code-input"
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 w-full h-full p-3 bg-transparent text-slate-100 resize-none outline-none leading-6 font-mono text-xs sm:text-sm selection:bg-emerald-500/30 selection:text-white whitespace-pre overflow-auto"
          placeholder="Paste or write your HTML, inline CSS, and JavaScript here..."
        />
      </div>

      {/* Editor Status Bar */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>HTML5 Ready • WebSettings Enabled</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tab Size: 2 spaces</span>
          <span>UTF-8</span>
        </div>
      </div>

    </div>
  );
};
