import { useState, useCallback } from 'react';
import type {
  AnalysisResult,
  ChatMessage,
  ClauseDecision,
  AppPhase,
} from './types';
import { extractPdfText, analyzeContract, chatQuery } from './api';
import ApiKeyInput from './components/ApiKeyInput';
import Upload from './components/Upload';
import ResultsDashboard from './components/ResultsDashboard';
import ChatPanel from './components/ChatPanel';

// Compliance policy bundled as a string constant at build time
import policyText from '../mock-data/compliance-policy.md?raw';

function buildChatContext(analysis: AnalysisResult): string {
  const flagged = analysis.clauses.filter((c) => c.violation);
  const lines: string[] = [];

  lines.push(`Contract text (excerpts):`);
  for (const c of analysis.clauses) {
    lines.push(
      `[${c.clause_id}] ${c.original_text.slice(0, 200)}${c.original_text.length > 200 ? '...' : ''}`,
    );
  }

  lines.push(`\nFlagged violations:`);
  for (const c of flagged) {
    lines.push(`- ${c.clause_id}: ${c.violation} (${c.severity}, confidence: ${(c.confidence * 100).toFixed(0)}%)`);
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

export default function App() {
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem('gemini_api_key') || '',
  );
  const [phase, setPhase] = useState<AppPhase>(
    apiKey ? 'upload' : 'input-key',
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ClauseDecision>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, clauseId: '' });

  const handleApiKey = useCallback((key: string) => {
    setApiKey(key);
    setPhase('upload');
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setPhase('analyzing');
      setError(null);
      setProgress({ current: 0, total: 0, clauseId: '' });

      try {
        const text = await extractPdfText(file);

        const result = await analyzeContract(apiKey, policyText, text, (current, total, clauseId) => {
          setProgress({ current, total, clauseId });
        });

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
      } finally {
        setPhase('upload');
      }
    },
    [apiKey],
  );

  const handleDecision = useCallback(
    (clauseId: string, decision: 'accept' | 'reject') => {
      setDecisions((prev) => {
        const current = prev[clauseId];
        // Toggle: if clicking the same button, deselect
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

  // Key input screen
  if (phase === 'input-key') {
    return <ApiKeyInput onSubmit={handleApiKey} />;
  }

  // Upload screen
  if (phase === 'upload') {
    return (
      <div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <span className="text-sm text-gray-500">
            API key: {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
          </span>
          <button
            onClick={() => {
              sessionStorage.removeItem('gemini_api_key');
              setApiKey('');
              setPhase('input-key');
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear key
          </button>
        </div>
        {error && (
          <div className="mx-auto mt-4 max-w-lg rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
        <Upload onUpload={handleUpload} />
      </div>
    );
  }

  // Analyzing spinner with progress
  if (phase === 'analyzing') {
    const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-lg font-medium text-gray-700">
            Analyzing with Gemini...
          </p>
          {progress.total > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Clause {progress.current} of {progress.total}
                <span className="ml-2 font-mono text-xs text-gray-400">
                  [{progress.clauseId}]
                </span>
              </div>
              <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400">
            This takes 5–15 seconds per clause.
          </p>
        </div>
      </div>
    );
  }

  // Results view with optional chat
  if (phase === 'results' && analysis) {
    if (showChat) {
      return (
        <div className="flex h-screen flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <h2 className="font-semibold text-gray-900">Chat</h2>
            <button
              onClick={() => setShowChat(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back to Results
            </button>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <ChatPanel
              messages={chatMessages}
              onSend={handleChat}
              loading={chatLoading}
            />
          </div>
        </div>
      );
    }

    return (
      <ResultsDashboard
        analysis={analysis}
        decisions={decisions}
        onDecision={handleDecision}
        onExport={handleExport}
        onChat={() => setShowChat(true)}
        onNewUpload={handleNewUpload}
      />
    );
  }

  return null;
}
