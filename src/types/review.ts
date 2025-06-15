export interface Suggestion {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'maintainability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line: number;
  suggestion: string;
}

export interface Analysis {
  qualityScore: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
}

export interface Metrics {
  linesOfCode: number;
  complexity: number;
  duplicateLines: number;
  testCoverage: number;
}

export interface ReviewData {
  code: string;
  language: string;
  analysis: Analysis;
  suggestions: Suggestion[];
  metrics: Metrics;
}