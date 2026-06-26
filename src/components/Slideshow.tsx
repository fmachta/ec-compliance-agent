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
      'A single-page web application that validates export control contracts against regulatory compliance policies using Google Gemini Flash Lite',
      'Accepts PDF uploads or pre-loaded sample contracts, flags violations by severity, and generates corrected contract language',
      '100% client-side architecture: React frontend, no backend server, deployed on GitHub Pages',
      'Source: github.com/fmachta/ec-compliance-agent',
    ],
  },
  {
    title: 'The Problem',
    subtitle: 'Export Compliance Is Hard',
    icon: '⚠️',
    content: [
      'Companies shipping controlled goods (FPGAs, encryption software, defense articles) must comply with EAR and ITAR regulations',
      'Manual contract review requires specialized legal expertise; missed violations carry penalties up to $300K civil or 20 years criminal',
      'Small and medium exporters often have no dedicated compliance staff and cannot afford expensive legal consultants',
      'Existing tools are enterprise-grade platforms costing thousands per year; no lightweight, free alternative exists',
    ],
  },
  {
    title: 'Architecture',
    subtitle: 'How the Pieces Fit Together',
    icon: '🏗️',
    content: [
      'App.tsx: central state machine managing four phases (upload, analyzing, results, chat) with React hooks for session state',
      'api.ts: Gemini integration layer with three exported functions: extractPdfText (pdf.js), analyzeContract (batch analysis with progress callback), chatQuery (context-aware Q&A)',
      'SampleContracts.tsx: 6 bundled contracts imported as raw strings via Vite\'s ?raw import syntax, converted to File objects on drag or click',
      'ClauseCard.tsx: renders each analyzed clause with severity-colored left border accent, expandable before/after diff view, and Accept/Reject toggle',
      'Slideshow.tsx: this presentation component, full-screen overlay with keyboard navigation (arrows, space, escape)',
    ],
  },
  {
    title: 'The Analysis Pipeline',
    subtitle: 'Step by Step',
    icon: '🔍',
    content: [
      'Step 1: PDF text extraction via pdf.js in the browser (api.ts: extractPdfText). Uses GlobalWorkerOptions with a Vite-bundled worker file to avoid CDN dependency.',
      'Step 2: Clause chunking via regex (api.ts: chunkIntoClauses). Splits on section headers, merges small fragments to keep API calls efficient. Each chunk gets a generated clause_id like §01.',
      'Step 3: Per-clause AI analysis (api.ts: analyzeClause). Sends the clause text plus the full 9-section compliance policy to gemini-3.1-flash-lite with a structured prompt requesting JSON output. The prompt explicitly forbids markdown and requires actionable rewrites.',
      'Step 4: Rate limiting with 500ms delay between clauses to respect Gemini\'s free tier limit of 15 RPM. A progress callback updates the UI with current/total clause count.',
      'Step 5: Results aggregation with severity counts and sorting (critical first). The dashboard maps each severity to Tailwind border and background classes for instant visual parsing.',
    ],
  },
  {
    title: 'The AI Prompt',
    subtitle: 'What We Send to Gemini',
    icon: '🤖',
    content: [
      'The analysis prompt (api.ts, ANALYSIS_PROMPT constant) is a carefully engineered template with four key constraints:',
      '1. Structured output: responseMimeType: "application/json" forces Gemini to return parseable JSON with violation, severity, confidence, explanation, and suggested_rewrite fields.',
      '2. Context injection: the full 9-section compliance policy is prepended to every call so Gemini has complete rule context without fine-tuning.',
      '3. Rewrite instructions: the prompt forbids "contract is void" responses and requires drop-in replacement text even for severe violations like sanctioned destinations.',
      '4. Temperature 0.1: low temperature ensures consistent, deterministic outputs across runs, critical for compliance use cases.',
    ],
  },
  {
    title: 'Key Code Patterns',
    subtitle: 'Technical Highlights',
    icon: '💻',
    content: [
      'Vite ?raw imports (SampleContracts.tsx): `import contract1 from \'../../mock-data/contract-1-dual-use.txt?raw\'` bundles contract text at build time into the JS bundle. No runtime fetching, no server needed.',
      'Custom drop interception (Upload.tsx): since react-dropzone only handles OS file drops, we intercept the onDrop event ourselves to detect sample contract data via dataTransfer.getData(\'application/x-sample-contract\').',
      'Inline diff view (ClauseCard.tsx): rather than pulling in a diff library, we render original text with Tailwind\'s line-through and decoration-red-400, and suggested text in green, inside a conditional toggle controlled by the Accept button.',
      'Dark mode enforcement (App.tsx): document.documentElement.classList.add(\'dark\') runs unconditionally at module load. shadcn/ui CSS variables switch the entire palette; no toggle, no preference check.',
      'SPA routing on GitHub Pages (public/404.html): a tiny script copies the URL path to sessionStorage and redirects to the root, where React reads it back. Zero configuration, works on any static host.',
    ],
  },
  {
    title: 'Mock Data Design',
    subtitle: '6 Contracts, 1 Policy',
    icon: '📋',
    content: [
      'compliance-policy.md: a 9-section internal policy document modeled on real AeroTech/defense contractor policies. Sections cover §1.1 License Requirements, §2.1 Restricted Party Screening, §3.2 Prohibited End-Uses, §4.1 Encryption Controls, §5.1 ITAR/USML, §6.2 Technology Control Plans, and §8.1 Civil/Criminal Penalties.',
      'Contract 1 (Dual-Use FPGA): Xilinx Kintex-7 boards to Tehran with no license, no end-use statement, radar signal processing end-use. Tests country-level sanctions detection.',
      'Contract 2 (Encryption): AES-256/RSA-4096 software licensed to Moscow with worldwide distribution rights. Tests ECCN classification and encryption registration requirements.',
      'Contract 3 (Defense Article): ITAR-controlled night vision re-export from Saudi Arabia to UAE military. Tests DSP-5 and ITAR §120 disclosure requirements.',
      'Contract 4 (Clean): office furniture to Canada with proper EAR99 classification and 5-list screening. Baseline test for false positives.',
      'Contract 5 (Deemed Export): Chinese national on F-1 OPT accessing ECCN 9E003 turbine data. Tests technology control plan requirements.',
    ],
  },
  {
    title: 'Live Demo',
    subtitle: 'Try It Yourself',
    icon: '🎯',
    content: [
      '1. Get a free Gemini API key at aistudio.google.com (no credit card required for Flash Lite tier)',
      '2. Click the gear icon in the top-right corner and paste your key',
      '3. Drag any sample contract from the homepage into the upload zone, or click it to auto-analyze',
      '4. Watch the progress bar as each clause is sent to Gemini for analysis against the full policy',
      '5. Click "Accept" on any flagged clause to see the original in strikethrough red and the AI-suggested rewrite in green',
      '6. Click "Chat" to ask contextual questions like "Why does §03 violate Section 5.2?"',
      '7. Click "Export Report" to download a cleaned contract with all accepted rewrites applied',
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
