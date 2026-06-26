import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ClauseResult, ChatMessage } from './types';

// Use the locally bundled worker (Vite resolves and bundles it at build time)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** Extract all text from a PDF file using pdf.js */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n\n');
}

/** Split contract text into individual clauses */
export function chunkIntoClauses(text: string): { clause_id: string; text: string }[] {
  const cleaned = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split on common clause/section boundaries
  const separatorPattern =
    /\n(?=(?:\d+\.\d*\s)|(?:§\d+)|(?:Article\s+\d+)|(?:SECTION\s+\d+)|(?:\={20,}))/i;

  const rawChunks = cleaned.split(separatorPattern).filter((c) => c.trim().length > 20);

  // Group small chunks together to avoid too many tiny API calls
  const merged: string[] = [];
  let buffer = '';

  for (const chunk of rawChunks) {
    if ((buffer + chunk).length < 800) {
      buffer += (buffer ? '\n' : '') + chunk;
    } else {
      if (buffer) merged.push(buffer);
      buffer = chunk;
    }
  }
  if (buffer) merged.push(buffer);

  return merged.map((text, i) => ({
    clause_id: `§${String(i + 1).padStart(2, '0')}`,
    text: text.trim(),
  }));
}

/** Call Gemini REST API */
async function callGemini(
  apiKey: string,
  prompt: string,
  responseJson = false,
): Promise<string> {
  const model = 'gemini-3.1-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  if (responseJson) {
    (body.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errMsg =
      (errData as { error?: { message?: string } }).error?.message ||
      `HTTP ${res.status}`;

    if (res.status === 401 || res.status === 403) {
      throw new Error(`Invalid API key — please check your Gemini key and try again.`);
    }
    if (res.status === 429) {
      throw new Error(`Rate limit reached. Wait a moment and try again.`);
    }
    throw new Error(`Gemini API error: ${errMsg}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/** Analyze a single clause against the policy */
const ANALYSIS_PROMPT = `You are an Export Control Compliance expert. Analyze the contract clause below against the provided compliance policy.

Return ONLY a JSON object (no markdown, no backticks, no extra text):
{
  "violation": "Brief description of violation with policy section reference, or null if compliant",
  "severity": "low" | "medium" | "high" | "critical" (null if compliant),
  "confidence": number between 0.0 and 1.0,
  "explanation": "Detailed explanation of why this violates the policy, or null",
  "suggested_rewrite": "Full rewritten clause text that would be compliant, or null"
}`;

export async function analyzeClause(
  apiKey: string,
  policyText: string,
  clause: { clause_id: string; text: string },
): Promise<ClauseResult> {
  const prompt = `${ANALYSIS_PROMPT}

POLICY:
${policyText}

CONTRACT CLAUSE (id: ${clause.clause_id}):
${clause.text}`;

  const response = await callGemini(apiKey, prompt, true);

  try {
    const parsed = JSON.parse(response);
    return {
      clause_id: clause.clause_id,
      original_text: clause.text,
      violation: parsed.violation || null,
      severity: parsed.severity || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      explanation: parsed.explanation || null,
      suggested_rewrite: parsed.suggested_rewrite || null,
    };
  } catch {
    // If JSON parsing fails, return a fallback
    return {
      clause_id: clause.clause_id,
      original_text: clause.text,
      violation: null,
      severity: null,
      confidence: 0,
      explanation: `Failed to parse analysis response: ${response.slice(0, 200)}`,
      suggested_rewrite: null,
    };
  }
}

/** Analyze an entire contract */
export async function analyzeContract(
  apiKey: string,
  policyText: string,
  contractText: string,
  onProgress?: (current: number, total: number, clauseId: string) => void,
): Promise<{
  clauses: ClauseResult[];
  total_clauses: number;
  flagged_count: number;
  severity_counts: Record<string, number>;
}> {
  const chunks = chunkIntoClauses(contractText);

  const results: ClauseResult[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(i + 1, chunks.length, chunks[i].clause_id);
    const result = await analyzeClause(apiKey, policyText, chunks[i]);
    results.push(result);
    // Small delay to respect rate limits (free tier: 15 RPM)
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const flagged = results.filter((r) => r.violation !== null);
  const severity_counts = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const f of flagged) {
    if (f.severity && f.severity in severity_counts) {
      severity_counts[f.severity]++;
    }
  }

  return {
    clauses: results,
    total_clauses: results.length,
    flagged_count: flagged.length,
    severity_counts,
  };
}

const CHAT_SYSTEM_PROMPT = `You are an Export Control Compliance assistant. Answer the user's questions about their export control contract analysis. Be precise about policy section references. Keep answers concise. If you don't have enough context, say so.

CRITICAL: Respond in plain text only. Do NOT use markdown, bold, italics, bullet points, numbered lists, backticks, headings, or any other formatting. Just plain paragraphs.`;

/** Chat with Gemini about the analysis results */
export async function chatQuery(
  apiKey: string,
  messages: ChatMessage[],
  context: string,
): Promise<string> {
  const fullPrompt = `${CHAT_SYSTEM_PROMPT}

--- CONTEXT: Export Control Analysis ---
${context}
--- END CONTEXT ---

User question: ${messages[messages.length - 1].content}`;

  return callGemini(apiKey, fullPrompt, false);
}
