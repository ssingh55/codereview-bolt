import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, AlertCircle, Info, CheckCircle, Shield, Zap, Target, Wrench } from 'lucide-react';
import { Suggestion } from '../types/review';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-400" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'quality': return <Target className="w-4 h-4" />;
      case 'maintainability': return <Wrench className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20';
      case 'low': return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'text-red-400 bg-red-500/10';
      case 'performance': return 'text-orange-400 bg-orange-500/10';
      case 'quality': return 'text-blue-400 bg-blue-500/10';
      case 'maintainability': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className={`border rounded-lg transition-all duration-200 ${getSeverityColor(suggestion.severity)}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-0.5">
            {getSeverityIcon(suggestion.severity)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white truncate">
                {suggestion.title}
              </h3>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                  {getTypeIcon(suggestion.type)}
                  <span className="capitalize">{suggestion.type}</span>
                </span>
                <span className="text-sm text-gray-400">Line {suggestion.line}</span>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">
              {suggestion.description}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/10 p-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Suggested Fix:</h4>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <code className="text-sm text-gray-300 font-mono">
                  {suggestion.suggestion}
                </code>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Severity: <span className="capitalize">{suggestion.severity}</span></span>
              <span>Category: <span className="capitalize">{suggestion.type}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}