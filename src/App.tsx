import { useState, useCallback } from 'react';
import type {
  AnalysisResult,
  ChatMessage,
  ClauseDecision,
  AppPhase,
} from './types';
import { extractPdfText, analyzeContract, chatQuery } from './api';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import SettingsModal, { GearIcon } from './components/SettingsModal';
import { Button } from '@/components/ui/button';
import Upload from './components/Upload';
import ResultsDashboard from './components/ResultsDashboard';
import ChatPanel from './components/ChatPanel';

import policyText from '../mock-data/compliance-policy.md?raw';

function buildChatContext(analysis: AnalysisResult): string {
  const flagged = analysis.clauses.filter((c) => c.violation);
  const lines: string[] = [];

  lines.push('Contract text (excerpts):');
  for (const c of analysis.clauses) {
    lines.push(
      `[${c.clause_id}] ${c.original_text.slice(0, 200)}${c.original_text.length > 200 ? '...' : ''}`,
    );
  }

  lines.push('\nFlagged violations:');
  for (const c of flagged) {
    lines.push(
      `- ${c.clause_id}: ${c.violation} (${c.severity}, confidence: ${(c.confidence * 100).toFixed(0)}%)`,
    );
  }

  return lines.join('\n');
}

function generateExport(
  analysis: AnalysisResult,
  decisions: Record<string, ClauseDecision>,
): string {
  const lines: string[] = [
    '========================================',
    '  EXPORT CONTROL COMPLIANCE REPORT',
    '========================================',
    '',
    `Total Clauses: ${analysis.total_clauses}`,
    `Flagged: ${analysis.flagged_count}`,
    `Clean: ${analysis.total_clauses - analysis.flagged_count}`,
    `Critical: ${analysis.severity_counts.critical}`,
    `High: ${analysis.severity_counts.high}`,
    `Medium: ${analysis.severity_counts.medium}`,
    `Low: ${analysis.severity_counts.low}`,
    '',
    '--- CLEANED CONTRACT ---',
    '',
  ];

  for (const clause of analysis.clauses) {
    const decision = decisions[clause.clause_id];
    if (decision === 'accept' && clause.suggested_rewrite) {
      lines.push(`[${clause.clause_id}] (ACCEPTED REWRITE)`);
      lines.push(clause.suggested_rewrite);
    } else {
      lines.push(`[${clause.clause_id}]`);
      lines.push(clause.original_text);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Always enable dark mode
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem('gemini_api_key') || '',
  );
  const [phase, setPhase] = useState<AppPhase>('upload');
  const [showSettings, setShowSettings] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ClauseDecision>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, clauseId: '' });

  const handleUpload = useCallback(
    async (file: File) => {
      if (!apiKey) {
        setError('Please set your Gemini API key first. Click the ⚙ icon in the top-right corner.');
        setShowSettings(true);
        return;
      }
      setPhase('analyzing');
      setError(null);
      setProgress({ current: 0, total: 0, clauseId: '' });

      try {
        const text = await extractPdfText(file);

        const result = await analyzeContract(
          apiKey,
          policyText,
          text,
          (current, total, clauseId) => {
            setProgress({ current, total, clauseId });
          },
        );

        const analysisResult: AnalysisResult = {
          session_id: crypto.randomUUID(),
          ...result,
          contract_text: text,
        };

        setAnalysis(analysisResult);
        setDecisions({});
        setChatMessages([]);
        setPhase('results');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        setPhase('upload');
      }
    },
    [apiKey],
  );

  const handleDecision = useCallback(
    (clauseId: string, decision: 'accept' | 'reject') => {
      setDecisions((prev) => {
        const current = prev[clauseId];
        if (current === decision) {
          const next = { ...prev };
          delete next[clauseId];
          return next;
        }
        return { ...prev, [clauseId]: decision };
      });
    },
    [],
  );

  const handleChat = useCallback(
    async (message: string) => {
      if (!analysis) return;

      const userMsg: ChatMessage = { role: 'user', content: message };
      setChatMessages((prev) => [...prev, userMsg]);
      setChatLoading(true);

      try {
        const context = buildChatContext(analysis);
        const reply = await chatQuery(apiKey, [...chatMessages, userMsg], context);

        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply },
        ]);
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [apiKey, analysis, chatMessages],
  );

  const handleExport = useCallback(() => {
    if (!analysis) return;
    const text = generateExport(analysis, decisions);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ec-compliance-report-${analysis.session_id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis, decisions]);

  const handleNewUpload = useCallback(() => {
    setAnalysis(null);
    setDecisions({});
    setChatMessages([]);
    setShowChat(false);
    setPhase('upload');
  }, []);

  // Upload screen
  if (phase === 'upload') {
    return (
      <TooltipProvider>
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-4 right-4 z-50 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <GearIcon />
        </button>
        {error && (
          <div className="mx-auto mt-4 max-w-lg rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <strong>Error:</strong> {error}
          </div>
        )}
        <Upload onUpload={handleUpload} />
        {showSettings && (
          <SettingsModal
            apiKey={apiKey}
            onSave={(key) => { setApiKey(key); setShowSettings(false); }}
            onClear={() => { sessionStorage.removeItem('gemini_api_key'); setApiKey(''); setShowSettings(true); setPhase('upload'); }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </TooltipProvider>
    );
  }

  // Analyzing spinner with progress
  if (phase === 'analyzing') {
    const pct =
      progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0;
    return (
      <TooltipProvider>
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-4 right-4 z-50 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <GearIcon />
        </button>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <div>
              <p className="text-xl font-semibold">Analyzing with Gemini...</p>
              {progress.total > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Clause {progress.current} of {progress.total}
                    <span className="ml-2 font-mono text-xs">
                      [{progress.clauseId}]
                    </span>
                  </p>
                  <Progress value={pct} className="mx-auto w-64" />
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                This takes 5–15 seconds per clause.
              </p>
            </div>
          </div>
        </div>
        {showSettings && (
          <SettingsModal
            apiKey={apiKey}
            onSave={(key) => { setApiKey(key); setShowSettings(false); }}
            onClear={() => { sessionStorage.removeItem('gemini_api_key'); setApiKey(''); setShowSettings(true); setPhase('upload'); }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </TooltipProvider>
    );
  }

  // Results view with optional chat
  if (phase === 'results' && analysis) {
    if (showChat) {
      return (
        <TooltipProvider>
          <button
            onClick={() => setShowSettings(true)}
            className="fixed top-4 right-4 z-50 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Settings"
          >
            <GearIcon />
          </button>
          <div className="flex h-screen flex-col">
            <div className="flex items-center justify-between border-b bg-card px-4 py-3">
              <h2 className="font-semibold">Chat</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                ← Back to Results
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <ChatPanel
                messages={chatMessages}
                onSend={handleChat}
                loading={chatLoading}
              />
            </div>
          </div>
          {showSettings && (
            <SettingsModal
              apiKey={apiKey}
              onSave={(key) => { setApiKey(key); setShowSettings(false); }}
              onClear={() => { sessionStorage.removeItem('gemini_api_key'); setApiKey(''); setShowSettings(true); setPhase('upload'); }}
              onClose={() => setShowSettings(false)}
            />
          )}
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-4 right-4 z-50 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <GearIcon />
        </button>
        <ResultsDashboard
          analysis={analysis}
          decisions={decisions}
          onDecision={handleDecision}
          onExport={handleExport}
          onChat={() => setShowChat(true)}
          onNewUpload={handleNewUpload}
        />
        {showSettings && (
          <SettingsModal
            apiKey={apiKey}
            onSave={(key) => { setApiKey(key); setShowSettings(false); }}
            onClear={() => { sessionStorage.removeItem('gemini_api_key'); setApiKey(''); setShowSettings(true); setPhase('upload'); }}
            onClose={() => setShowSettings(false)}
          />
        )}
      </TooltipProvider>
    );
  }

  return null;
}
