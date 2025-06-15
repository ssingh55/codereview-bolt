import React, { useState, useRef } from 'react';
import { Upload, FileCode, Loader, Play, Github } from 'lucide-react';
import GitHubInput from './GitHubInput';

interface CodeInputProps {
  onSubmit: (code: string, language: string, metadata?: any) => void;
  isAnalyzing: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

export default function CodeInput({ onSubmit, isAnalyzing }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'github'>('manual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      
      // Auto-detect language from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      const languageMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
      };
      
      if (extension && languageMap[extension]) {
        setLanguage(languageMap[extension]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code, language);
    }
  };

  const handleGitHubCodeFetched = (fetchedCode: string, fetchedLanguage: string, metadata?: any) => {
    onSubmit(fetchedCode, fetchedLanguage, metadata);
  };

  return (
    <div className="space-y-6">
      {/* Input Method Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setInputMethod('manual')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            inputMethod === 'manual'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <FileCode className="w-5 h-5" />
          <span>Manual Input</span>
        </button>
        
        <button
          onClick={() => setInputMethod('github')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            inputMethod === 'github'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Github className="w-5 h-5" />
          <span>GitHub Import</span>
        </button>
      </div>

      {inputMethod === 'github' ? (
        <GitHubInput onCodeFetched={handleGitHubCodeFetched} isLoading={isAnalyzing} />
      ) : (
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <label className="text-white font-medium">Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value} className="bg-gray-800">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/20'
                : 'border-white/30 bg-white/5 hover:bg-white/10'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".js,.jsx,.ts,.tsx,.py,.java,.cs,.cpp,.cc,.cxx,.php,.rb,.go,.rs"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Drop your code file here or click to browse
                </p>
                <p className="text-gray-300 text-sm">
                  Supports .js, .ts, .py, .java, .cs, .cpp, .php, .rb, .go, .rs files
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-white" />
              <label className="text-white font-medium">Or paste your code:</label>
            </div>
            
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-96 bg-slate-800/50 backdrop-blur-md border border-white/20 rounded-xl p-4 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
              />
              
              {code && (
                <div className="absolute top-4 right-4 bg-slate-700/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-xs text-gray-300">
                    {code.split('\n').length} lines
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || isAnalyzing}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                !code.trim() || isAnalyzing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>Start Code Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}