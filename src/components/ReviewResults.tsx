import React, { useState } from 'react';
import { Download, AlertTriangle, AlertCircle, CheckCircle, Info, FileText, BarChart3, Shield, Zap, Target, Code } from 'lucide-react';
import { ReviewData } from '../types/review';
import ScoreCircle from './ScoreCircle';
import SuggestionCard from './SuggestionCard';

interface ReviewResultsProps {
  data: ReviewData;
}

export default function ReviewResults({ data }: ReviewResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'metrics'>('overview');

  const handleExport = () => {
    const report = `
CODE REVIEW REPORT
==================

Language: ${data.language}
Date: ${new Date().toLocaleDateString()}

ANALYSIS SCORES:
- Quality: ${data.analysis.qualityScore}/100
- Security: ${data.analysis.securityScore}/100
- Performance: ${data.analysis.performanceScore}/100
- Maintainability: ${data.analysis.maintainabilityScore}/100

METRICS:
- Lines of Code: ${data.metrics.linesOfCode}
- Complexity: ${data.metrics.complexity}
- Duplicate Lines: ${data.metrics.duplicateLines}
- Test Coverage: ${data.metrics.testCoverage}%

SUGGESTIONS:
${data.suggestions.map((s, i) => `
${i + 1}. ${s.title} (${s.severity.toUpperCase()})
   Line: ${s.line}
   ${s.description}
   Suggestion: ${s.suggestion}
`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOverallScore = () => {
    const { qualityScore, securityScore, performanceScore, maintainabilityScore } = data.analysis;
    return Math.round((qualityScore + securityScore + performanceScore + maintainabilityScore) / 4);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const criticalIssues = data.suggestions.filter(s => s.severity === 'critical').length;
  const highIssues = data.suggestions.filter(s => s.severity === 'high').length;
  const mediumIssues = data.suggestions.filter(s => s.severity === 'medium').length;
  const lowIssues = data.suggestions.filter(s => s.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Code Review Complete</h2>
            <p className="text-gray-300">
              Analysis for {data.language} code • {data.metrics.linesOfCode} lines • {data.suggestions.length} suggestions
            </p>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="text-center">
            <ScoreCircle score={getOverallScore()} size="large" />
            <p className="text-white font-semibold mt-2">Overall Score</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            <div className="text-center">
              <ScoreCircle score={data.analysis.qualityScore} size="small" />
              <p className="text-sm text-gray-300 mt-1">Quality</p>
            </div>
            <div className="text-center">
              <ScoreCircle score={data.analysis.securityScore} size="small" />
              <p className="text-sm text-gray-300 mt-1">Security</p>
            </div>
            <div className="text-center">
              <ScoreCircle score={data.analysis.performanceScore} size="small" />
              <p className="text-sm text-gray-300 mt-1">Performance</p>
            </div>
            <div className="text-center">
              <ScoreCircle score={data.analysis.maintainabilityScore} size="small" />
              <p className="text-sm text-gray-300 mt-1">Maintainability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
        <div className="border-b border-white/20">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'suggestions'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Suggestions ({data.suggestions.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'metrics'
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Metrics</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Issue Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{criticalIssues}</div>
                  <div className="text-sm text-red-300">Critical</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{highIssues}</div>
                  <div className="text-sm text-orange-300">High</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{mediumIssues}</div>
                  <div className="text-sm text-yellow-300">Medium</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{lowIssues}</div>
                  <div className="text-sm text-blue-300">Low</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h3 className="font-medium text-white">Security Issues</h3>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {data.suggestions.filter(s => s.type === 'security').length}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <h3 className="font-medium text-white">Performance Issues</h3>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    {data.suggestions.filter(s => s.type === 'performance').length}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="font-medium text-white">Quality Issues</h3>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {data.suggestions.filter(s => s.type === 'quality').length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {data.suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Code Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Lines of Code</span>
                    <span className="text-white font-medium">{data.metrics.linesOfCode}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Cyclomatic Complexity</span>
                    <span className="text-white font-medium">{data.metrics.complexity}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Duplicate Lines</span>
                    <span className="text-white font-medium">{data.metrics.duplicateLines}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Test Coverage</span>
                    <span className="text-white font-medium">{data.metrics.testCoverage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Analysis Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Quality Score</span>
                    <span className="text-white font-medium">{data.analysis.qualityScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Security Score</span>
                    <span className="text-white font-medium">{data.analysis.securityScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Performance Score</span>
                    <span className="text-white font-medium">{data.analysis.performanceScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Maintainability Score</span>
                    <span className="text-white font-medium">{data.analysis.maintainabilityScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}