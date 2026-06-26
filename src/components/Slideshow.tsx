import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Slide {
  title: string;
  subtitle?: string;
  content: string[];
  icon?: string;
}

const SLIDES: Slide[] = [
  {
    title: 'Export Control Compliance Agent',
    subtitle: 'AI-Powered Contract Validation',
    icon: '🛡️',
    content: [
      'Automated compliance checking for export control contracts',
      'Built with React, Tailwind CSS, shadcn/ui, and Google Gemini Flash Lite',
      '100% client-side, no backend, no server costs',
    ],
  },
  {
    title: 'The Problem',
    subtitle: 'Why This Exists',
    icon: '⚠️',
    content: [
      'Reviewing export control contracts for regulatory compliance is slow, manual, and requires specialized expertise',
      'Missed violations can result in legal penalties: up to $300K per violation or 20 years imprisonment',
      'Small and medium exporters often lack dedicated compliance staff',
      'Existing solutions are expensive, complex, or require legal consultants',
    ],
  },
  {
    title: 'The Solution',
    subtitle: 'What It Does',
    icon: '✅',
    content: [
      'Upload any export control contract (PDF) and get instant AI analysis',
      'AI compares every clause against a comprehensive compliance policy',
      'Non-compliant clauses are flagged with severity ratings, confidence scores, and explanations',
      'Get suggested rewrites for every violation with one click',
      'Chat interface for follow-up questions about specific clauses or policy sections',
    ],
  },
  {
    title: 'Tech Stack',
    subtitle: '100% Client-Side',
    icon: '⚛️',
    content: [
      'React 19 + TypeScript: modern, type-safe frontend',
      'Vite 8: instant dev server and optimized builds',
      'Tailwind CSS 4 + shadcn/ui: dark mode, polished components',
      'pdf.js: client-side PDF text extraction (no server needed)',
      'Google Gemini Flash Lite: free-tier AI via REST API',
      'GitHub Pages: free static hosting with auto-deploy',
    ],
  },
  {
    title: 'How It Works',
    subtitle: 'Analysis Pipeline',
    icon: '🔍',
    content: [
      '1. PDF Parsing: pdf.js extracts raw text from the uploaded contract',
      '2. Clause Chunking: regex splits text into individual clauses by section headers',
      '3. AI Analysis: each clause is sent to Gemini Flash Lite alongside the full compliance policy',
      '4. Structured Output: Gemini returns JSON with violation, severity, confidence, explanation, and suggested rewrite',
      '5. Results Dashboard: flagged clauses sorted by severity with color-coded highlights',
    ],
  },
  {
    title: 'Compliance Policy',
    subtitle: 'Mock Regulatory Framework',
    icon: '📋',
    content: [
      '9-section policy document covering: export licenses, restricted party screening, end-use statements, encryption controls, ITAR/defense articles, deemed exports, and penalties',
      'Modeled on real EAR (Export Administration Regulations) and ITAR (International Traffic in Arms Regulations)',
      '6 synthetic contracts with intentional violations across different scenarios: dual-use exports, encryption software, defense articles, clean baseline, and deemed exports',
      'Real BIS standard export compliance clause language used in contract 6',
    ],
  },
  {
    title: 'Key Features',
    subtitle: 'Beyond Basic Analysis',
    icon: '⭐',
    content: [
      'Severity-colored highlighting on clause text (red/orange/yellow/blue)',
      'Confidence scores for every finding',
      'Accept/Reject toggle with automatic red/green diff view',
      'Side-by-side diff: original crossed out in red, suggested rewrite in green',
      'Slide-in chat panel for context-aware Q&A about violations',
      'Export cleaned contract with accepted rewrites applied',
      'Settings panel: bring your own Gemini API key (free tier)',
    ],
  },
  {
    title: 'Live Demo',
    subtitle: 'Try It Yourself',
    icon: '🎯',
    content: [
      '1. Get a free Gemini API key at aistudio.google.com',
      '2. Click the gear icon and paste your key',
      '3. Upload a mock contract from the samples below the upload zone',
      '4. See violations flagged in real-time with explanations',
      '5. Accept suggestions to see red/green diffs',
      '6. Open the chat to ask questions about any clause',
      '7. Export a cleaned compliance report',
    ],
  },
];

export default function Slideshow({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((c) => Math.min(c + 1, SLIDES.length - 1)),
    [],
  );
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, onClose]);

  const slide = SLIDES[current];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-sm text-muted-foreground">
          {current + 1} / {SLIDES.length}
        </span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕ Exit Slideshow
        </Button>
      </div>

      {/* Left arrow — fixed to left edge */}
      <button
        onClick={prev}
        disabled={current === 0}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/80 border text-3xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-default transition-colors"
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Right arrow — fixed to right edge */}
      <button
        onClick={next}
        disabled={current === SLIDES.length - 1}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/80 border text-3xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-default transition-colors"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center px-24">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{slide.icon}</div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{slide.title}</h1>
            {slide.subtitle && (
              <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
            )}
          </div>

          <Card className="p-8">
            <ul className="space-y-4">
              {slide.content.map((item, i) => (
                <li key={i} className="flex gap-3 text-lg leading-relaxed">
                  <span className="text-primary mt-1 shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 py-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
