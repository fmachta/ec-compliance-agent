export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface ClauseResult {
  clause_id: string;
  original_text: string;
  violation: string | null;
  severity: Severity | null;
  confidence: number;
  explanation: string | null;
  suggested_rewrite: string | null;
}

export interface AnalysisResult {
  session_id: string;
  clauses: ClauseResult[];
  total_clauses: number;
  flagged_count: number;
  severity_counts: Record<Severity, number>;
  contract_text: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ClauseDecision = 'accept' | 'reject' | null;

export type AppPhase = 'input-key' | 'upload' | 'analyzing' | 'results';
