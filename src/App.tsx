import React, { useState } from 'react';
import { FileCode, Upload, Download, CheckCircle, AlertTriangle, AlertCircle, Zap, Shield, Target } from 'lucide-react';
import CodeInput from './components/CodeInput';
import ReviewResults from './components/ReviewResults';
import { ReviewData } from './types/review';

function App() {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCodeSubmit = async (code: string, language: string, metadata?: any) => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock review data with enhanced suggestions based on content type
    const baseSuggestions = [
      {
        id: '1',
        type: 'performance' as const,
        severity: 'high' as const,
        title: 'Optimize Loop Performance',
        description: 'Consider using array methods like map() or filter() instead of traditional for loops for better readability and performance.',
        line: 15,
        suggestion: 'Replace the for loop with items.filter(item => item.active).map(item => item.name)',
      },
      {
        id: '2',
        type: 'security' as const,
        severity: 'critical' as const,
        title: 'Potential SQL Injection',
        description: 'Direct string concatenation in SQL queries can lead to SQL injection vulnerabilities.',
        line: 28,
        suggestion: 'Use parameterized queries or prepared statements to prevent SQL injection attacks.',
      },
      {
        id: '3',
        type: 'quality' as const,
        severity: 'medium' as const,
        title: 'Missing Error Handling',
        description: 'Add proper error handling to prevent application crashes and improve user experience.',
        line: 42,
        suggestion: 'Wrap the function call in a try-catch block and handle potential errors gracefully.',
      },
      {
        id: '4',
        type: 'maintainability' as const,
        severity: 'low' as const,
        title: 'Long Function',
        description: 'This function is quite long and handles multiple responsibilities.',
        line: 8,
        suggestion: 'Consider breaking this function into smaller, more focused functions.',
      },
    ];

    // Add PR-specific suggestions if it's a pull request
    const prSuggestions = metadata?.pullRequest ? [
      {
        id: '5',
        type: 'quality' as const,
        severity: 'medium' as const,
        title: 'Pull Request Best Practices',
        description: 'Consider adding unit tests for the new functionality introduced in this PR.',
        line: 1,
        suggestion: 'Add comprehensive test coverage for the new features and edge cases.',
      },
      {
        id: '6',
        type: 'maintainability' as const,
        severity: 'low' as const,
        title: 'Documentation Update',
        description: 'Update documentation to reflect the changes made in this pull request.',
        line: 1,
        suggestion: 'Add or update README.md and inline comments to document new features.',
      },
    ] : [];

    const mockReview: ReviewData = {
      code,
      language,
      analysis: {
        qualityScore: Math.floor(Math.random() * 30) + 70,
        securityScore: Math.floor(Math.random() * 25) + 75,
        performanceScore: Math.floor(Math.random() * 35) + 65,
        maintainabilityScore: Math.floor(Math.random() * 20) + 80,
      },
      suggestions: [...baseSuggestions, ...prSuggestions],
      metrics: {
        linesOfCode: metadata?.fileCount ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 200) + 50,
        complexity: Math.floor(Math.random() * 10) + 5,
        duplicateLines: Math.floor(Math.random() * 20),
        testCoverage: Math.floor(Math.random() * 40) + 60,
      },
      metadata,
    };
    
    setReviewData(mockReview);
    setIsAnalyzing(false);
    setCurrentView('results');
  };

  const handleNewReview = () => {
    setCurrentView('input');
    setReviewData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">CodeReview Pro</h1>
            </div>
            
            {currentView === 'results' && (
              <button
                onClick={handleNewReview}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>New Review</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'input' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Intelligent Code Review
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Get instant feedback on your code quality, security, performance, and maintainability. 
                Upload your code, import from GitHub, or review pull requests with our AI-powered analysis engine.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Performance Analysis</h3>
                <p className="text-gray-300">Identify bottlenecks and optimization opportunities</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Security Scanning</h3>
                <p className="text-gray-300">Detect vulnerabilities and security risks</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Quality Metrics</h3>
                <p className="text-gray-300">Comprehensive code quality assessment</p>
              </div>
            </div>

            <CodeInput onSubmit={handleCodeSubmit} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {currentView === 'results' && reviewData && (
          <ReviewResults data={reviewData} />
        )}
      </main>
    </div>
  );
}

export default App;