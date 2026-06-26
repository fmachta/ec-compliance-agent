import { useState } from 'react';
import type { ClauseResult, ClauseDecision, Severity } from '../types';

interface Props {
  clause: ClauseResult;
  decision: ClauseDecision;
  onDecision: (clauseId: string, decision: 'accept' | 'reject') => void;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: 'border-red-200 bg-red-50',
  high: 'border-orange-200 bg-orange-50',
  medium: 'border-yellow-200 bg-yellow-50',
  low: 'border-blue-200 bg-blue-50',
};

export default function ClauseCard({ clause, decision, onDecision }: Props) {
  const [showDiff, setShowDiff] = useState(false);
  const hasViolation = clause.violation !== null;

  return (
    <div
      className={`rounded-xl border p-5 space-y-3 ${
        hasViolation && clause.severity
          ? SEVERITY_BG[clause.severity]
          : 'border-green-200 bg-green-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-gray-500">
            {clause.clause_id}
          </span>
          {hasViolation && clause.severity && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                SEVERITY_COLORS[clause.severity]
              }`}
            >
              {clause.severity.toUpperCase()}
            </span>
          )}
          {!hasViolation && (
            <span className="inline-flex items-center rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              COMPLIANT
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Confidence: {(clause.confidence * 100).toFixed(0)}%</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gray-600 transition-all"
              style={{ width: `${clause.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Original text */}
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
        {clause.original_text}
      </div>

      {/* Violation details */}
      {hasViolation && (
        <div className="space-y-3 pt-2 border-t border-gray-200/50">
          <div>
            <span className="text-xs font-semibold uppercase text-gray-500">
              Violation
            </span>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {clause.violation}
            </p>
          </div>

          {clause.explanation && (
            <div>
              <span className="text-xs font-semibold uppercase text-gray-500">
                Explanation
              </span>
              <p className="mt-1 text-sm text-gray-700">{clause.explanation}</p>
            </div>
          )}

          {clause.suggested_rewrite && (
            <div>
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showDiff ? '▼ Hide' : '▶ Show'} suggested rewrite
              </button>

              {showDiff && (
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                    <span className="text-xs font-semibold text-red-600">
                      — Original
                    </span>
                    <p className="mt-1 text-sm text-red-800 whitespace-pre-wrap line-through decoration-red-400">
                      {clause.original_text.slice(0, 300)}
                      {clause.original_text.length > 300 ? '...' : ''}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                    <span className="text-xs font-semibold text-green-600">
                      + Suggested
                    </span>
                    <p className="mt-1 text-sm text-green-800 whitespace-pre-wrap">
                      {clause.suggested_rewrite}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accept/Reject buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                onDecision(
                  clause.clause_id,
                  decision === 'accept' ? 'accept' : 'accept',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                decision === 'accept'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
              }`}
            >
              {decision === 'accept' ? '✓ Accepted' : 'Accept'}
            </button>
            <button
              onClick={() =>
                onDecision(
                  clause.clause_id,
                  decision === 'reject' ? 'reject' : 'reject',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                decision === 'reject'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
              }`}
            >
              {decision === 'reject' ? '✗ Rejected' : 'Reject'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
