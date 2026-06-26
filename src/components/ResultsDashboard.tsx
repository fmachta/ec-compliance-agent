import type { AnalysisResult, ClauseDecision, Severity } from '../types';
import ClauseCard from './ClauseCard';

interface Props {
  analysis: AnalysisResult;
  decisions: Record<string, ClauseDecision>;
  onDecision: (clauseId: string, decision: 'accept' | 'reject') => void;
  onExport: () => void;
  onChat: () => void;
  onNewUpload: () => void;
}

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

export default function ResultsDashboard({
  analysis,
  decisions,
  onDecision,
  onExport,
  onChat,
  onNewUpload,
}: Props) {
  const sortedClauses = [...analysis.clauses].sort((a, b) => {
    if (a.violation && !b.violation) return -1;
    if (!a.violation && b.violation) return 1;
    if (a.severity && b.severity) {
      return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    }
    return 0;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
          <p className="mt-1 text-sm text-gray-500">
            {analysis.total_clauses} clauses analyzed · {analysis.flagged_count}{' '}
            flagged
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onNewUpload}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            New Upload
          </button>
          <button
            onClick={onChat}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Chat
          </button>
          <button
            onClick={onExport}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      {/* Severity summary */}
      <div className="flex gap-3">
        {SEVERITY_ORDER.map((sev) => (
          <div
            key={sev}
            className="flex-1 rounded-lg border border-gray-200 bg-white p-3 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">
              {analysis.severity_counts[sev] || 0}
            </div>
            <div className="text-xs font-medium uppercase text-gray-500">
              {sev}
            </div>
          </div>
        ))}
        <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-700">
            {analysis.total_clauses - analysis.flagged_count}
          </div>
          <div className="text-xs font-medium uppercase text-green-600">
            Clean
          </div>
        </div>
      </div>

      {/* Clause cards */}
      <div className="space-y-4">
        {sortedClauses.map((clause) => (
          <ClauseCard
            key={clause.clause_id}
            clause={clause}
            decision={decisions[clause.clause_id] || null}
            onDecision={onDecision}
          />
        ))}
      </div>
    </div>
  );
}
