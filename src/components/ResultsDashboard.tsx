import type { AnalysisResult, ClauseDecision, Severity } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

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

      {/* Severity summary cards */}
      <div className="grid grid-cols-5 gap-3">
        {SEVERITY_ORDER.map((sev) => (
          <Card key={sev} className="text-center">
            <CardContent className="p-3">
              <div className={`text-2xl font-bold ${SEVERITY_COLORS[sev]}`}>
                {analysis.severity_counts[sev] || 0}
              </div>
              <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider">
                {sev}
              </Badge>
            </CardContent>
          </Card>
        ))}
        <Card className="text-center border-emerald-500/30">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-emerald-400">
              {analysis.total_clauses - analysis.flagged_count}
            </div>
            <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider border-emerald-500/30 text-emerald-400">
              Clean
            </Badge>
          </CardContent>
        </Card>
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
