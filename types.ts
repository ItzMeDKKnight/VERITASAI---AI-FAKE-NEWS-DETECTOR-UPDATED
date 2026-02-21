
export enum Verdict {
  REAL = 'REAL',
  FAKE = 'FAKE',
  MISLEADING = 'MISLEADING',
  UNVERIFIED = 'UNVERIFIED'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  detectedLanguage: string;
  verdict: Verdict;
  confidenceScore: number; // 0 to 100
  summary: string;
  reasoning: string[];
  biasAnalysis: string;
  factualChecks: Array<{
    claim: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  sources: GroundingSource[];
  isSensitive: boolean;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
  currentStep: string;
}
