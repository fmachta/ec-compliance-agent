import { useState } from 'react';
import type { ClauseResult, ClauseDecision, Severity } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Props {
  clause: ClauseResult;
  decision: ClauseDecision;
  onDecision: (clauseId: string, decision: 'accept' | 'reject') => void;
}

const SEVERITY_VARIANTS: Record<Severity, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

const SEVERITY_BORDER: Record<Severity, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: 'bg-red-500/10 border-red-500/20',
  high: 'bg-orange-500/10 border-orange-500/20',
  medium: 'bg-yellow-500/10 border-yellow-500/20',
  low: 'bg-blue-500/10 border-blue-500/20',
};

export default function ClauseCard({ clause, decision, onDecision }: Props) {
  const [showDiff, setShowDiff] = useState(false);
  const hasViolation = clause.violation !== null;
  const confPct = Math.round(clause.confidence * 100);
  const borderClass = hasViolation && clause.severity
    ? SEVERITY_BORDER[clause.severity]
    : 'border-l-emerald-500';
  const highlightClass = hasViolation && clause.severity
    ? SEVERITY_BG[clause.severity]
    : 'bg-emerald-500/5 border-emerald-500/20';

  return (
    <Card className={'border-l-4 ' + borderClass}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-muted-foreground">
              {clause.clause_id}
            </span>
            {hasViolation && clause.severity ? (
              <Badge variant={SEVERITY_VARIANTS[clause.severity]} className="text-xs font-semibold">
                {clause.severity.toUpperCase()}
              </Badge>
            ) : (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold">
                COMPLIANT
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Confidence: {confPct}%</span>
          </div>
        </div>

        <Separator />

        {/* Original text — highlighted by severity */}
        <div className={'rounded-lg border p-3 ' + highlightClass}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {clause.original_text}
          </p>
        </div>

        {/* Violation details */}
        {hasViolation && (
          <div className="space-y-3">
            <Separator />

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Violation
              </span>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {clause.violation}
              </p>
            </div>

            {clause.explanation && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explanation
                </span>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {clause.explanation}
                </p>
              </div>
            )}

            {clause.suggested_rewrite && (
              <div>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs font-semibold"
                  onClick={() => setShowDiff(!showDiff)}
                >
                  {showDiff ? '▼ Hide' : '▶ Show'} suggested rewrite
                </Button>

                {showDiff && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <span className="text-xs font-semibold text-destructive">
                        — Original
                      </span>
                      <p className="mt-1 text-sm text-foreground/70 whitespace-pre-wrap line-through decoration-destructive/40">
                        {clause.original_text.slice(0, 300)}
                        {clause.original_text.length > 300 ? '...' : ''}
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <span className="text-xs font-semibold text-emerald-600">
                        + Suggested
                      </span>
                      <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">
                        {clause.suggested_rewrite}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accept/Reject */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant={decision === 'accept' ? 'default' : 'outline'}
                className={decision === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                onClick={() => {
                  onDecision(clause.clause_id, decision === 'accept' ? 'accept' : 'accept');
                  if (decision !== 'accept') setShowDiff(true);
                }}
              >
                {decision === 'accept' ? '✓ Accepted' : 'Accept'}
              </Button>
              <Button
                size="sm"
                variant={decision === 'reject' ? 'destructive' : 'outline'}
                onClick={() => {
                  onDecision(clause.clause_id, decision === 'reject' ? 'reject' : 'reject');
                  if (decision !== 'reject') setShowDiff(false);
                }}
              >
                {decision === 'reject' ? '✗ Rejected' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
