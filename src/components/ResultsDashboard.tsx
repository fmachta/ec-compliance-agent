import type { AnalysisResult, ClauseDecision, Severity } from '../types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {analysis.total_clauses} clauses analyzed · {analysis.flagged_count} flagged
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onNewUpload}>
            New Upload
          </Button>
          <Button size="sm" onClick={onChat}>
            Chat
          </Button>
          <Button size="sm" variant="secondary" onClick={onExport}>
            Export Report
          </Button>
        </div>
      </div>

      <Separator />

      {/* Severity summary — text only, no colors */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-semibold">{analysis.severity_counts.critical} Critical</span>
        <span>·</span>
        <span className="font-semibold">{analysis.severity_counts.high} High</span>
        <span>·</span>
        <span className="font-semibold">{analysis.severity_counts.medium} Medium</span>
        <span>·</span>
        <span className="font-semibold">{analysis.severity_counts.low} Low</span>
        <span>·</span>
        <span className="font-semibold">{analysis.total_clauses - analysis.flagged_count} Clean</span>
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
