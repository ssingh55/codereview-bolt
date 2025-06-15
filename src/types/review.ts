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
  metadata?: {
    source?: 'github' | 'manual';
    contentType?: 'repo' | 'file' | 'pr';
    fileName?: string;
    filePath?: string;
    fileUrl?: string;
    repository?: string;
    fileCount?: number;
    files?: Array<{
      name: string;
      path: string;
      url: string;
    }>;
    pullRequest?: {
      number: number;
      title: string;
      author: string;
      additions?: number;
      deletions?: number;
      changedFiles?: number;
    };
  };
}