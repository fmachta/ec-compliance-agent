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
    content: [],
  },
  {
    title: 'What It Does',
    subtitle: 'Automating Export Compliance Review',
    icon: '🎯',
    content: [
      'Upload an export control contract as a PDF and the app analyzes every clause against a full compliance policy using Google Gemini Flash Lite',
      'Each clause gets flagged (or cleared) with a severity rating, a plain-English explanation of the violation, and a suggested rewrite you can accept or reject',
      'A built-in chat lets you ask follow-up questions like "Why did clause §03 fail?" with full context from the analysis',
      'Export a cleaned contract with all accepted rewrites applied — no manual redlining needed',
      'The problem it solves: small and medium exporters have no dedicated compliance staff and can\'t afford $10K/year enterprise tools. This gives them a free, instant first-pass review.',
    ],
  },
  {
    title: 'Tech Stack',
    subtitle: 'What We Built With',
    icon: '⚙️',
    content: [
      'React 19 — component-based UI with hooks for state management (useState, useCallback, useEffect)',
      'TypeScript — full type safety across all components, API calls, and data models',
      'Tailwind CSS 4 + shadcn/ui — utility-first styling with dark mode, using @base-ui/react headless components (Card, Button, Badge, ScrollArea, Progress, etc.)',
      'Vite 8 — build tool with HMR dev server, TypeScript compilation, and static asset bundling',
      'pdf.js v5 — client-side PDF text extraction with locally bundled worker (no CDN dependency)',
      'Google Gemini Flash Lite (gemini-3.1-flash-lite) — free-tier LLM for clause analysis and chat, called directly from the browser via REST API',
      'GitHub Pages — free static hosting with automated deploy via GitHub Actions on every push to main',
    ],
  },
  {
    title: 'Problems We Hit',
    subtitle: 'Real Issues, Real Fixes',
    icon: '🔧',
    content: [
      'ScrollArea not scrolling — the @base-ui/react ScrollArea is headless; it needs overflow-auto on the Viewport, overflow-hidden + min-h-0 on the Root, and padding moved inside the scroll viewport. Three separate fixes for one component.',
      'Gemini model naming — Google released gemini-3.1-flash-lite mid-build, replacing gemini-2.5-flash-lite. The new model ID had to be updated in api.ts and retested.',
      'pdf.js v5 CDN incompatibility — cdnjs doesn\'t host v5. Had to bundle the worker locally using Vite\'s `?url` import syntax and configure GlobalWorkerOptions.workerSrc.',
      'Sample contract drag-and-drop — react-dropzone only handles OS file drops. Had to intercept onDrop manually to detect custom dataTransfer types for the pre-loaded sample contracts.',
      'GitHub Pages SPA routing — no server-side redirects on static hosting. Solved with a 404.html script that copies the URL path to sessionStorage and redirects to the root, where React picks it up.',
      'Flexbox min-height — flex children default to min-height: auto, so flex-1 containers grow past their parent. Added min-h-0 globally to ScrollArea and other flex children.',
    ],
  },
  {
    title: 'Live Demo',
    subtitle: 'Try It Now',
    icon: '🚀',
    content: [
      'Get a free Gemini API key at aistudio.google.com — no credit card needed for the Flash Lite tier',
      'Open fmachta.github.io/ec-compliance-agent and paste your key in the landing screen',
      'Drag a sample contract from the homepage into the upload zone, or click one to auto-analyze',
      'Watch each clause get sent to Gemini with live progress — severity badges appear as results come in',
      'Click Accept on any flagged clause to preview the AI-suggested rewrite, then Export to download a cleaned contract',
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

      {/* Left arrow */}
      <button
        onClick={prev}
        disabled={current === 0}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/80 border text-3xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-default transition-colors"
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        disabled={current === SLIDES.length - 1}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background/80 border text-3xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-default transition-colors"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Slide */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-3xl space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{slide.icon}</div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{slide.title}</h1>
              {slide.subtitle && (
                <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
              )}
            </div>

            {slide.content.length > 0 && (
              <Card className="p-6">
                <ul className="space-y-4">
                  {slide.content.map((item, i) => (
                    <li key={i} className="flex gap-3 text-base leading-relaxed">
                      <span className="text-primary mt-1 shrink-0">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
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
