import React, { useState } from 'react';
import { Github, Link, FileCode, GitPullRequest, Folder, Loader, AlertCircle, ExternalLink, Users, Calendar, GitBranch } from 'lucide-react';
import { GitHubService } from '../utils/github';
import { GitHubRepo, GitHubFile, GitHubRepoInfo, GitHubPullRequest } from '../types/github';

interface GitHubInputProps {
  onCodeFetched: (code: string, language: string, metadata?: any) => void;
  isLoading: boolean;
}

export default function GitHubInput({ onCodeFetched, isLoading }: GitHubInputProps) {
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GitHubFile | null>(null);
  const [pullRequest, setPullRequest] = useState<GitHubPullRequest | null>(null);
  const [contentType, setContentType] = useState<'repo' | 'file' | 'pr'>('repo');

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    
    setIsFetching(true);
    setError('');
    setRepoInfo(null);
    setFiles([]);
    setSelectedFile(null);
    setPullRequest(null);

    try {
      // Check if it's a pull request URL
      const prMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
      
      if (prMatch) {
        const [, owner, name, prNumber] = prMatch;
        setContentType('pr');
        
        // Fetch repository info and pull request data
        const [repoData, prData] = await Promise.all([
          GitHubService.fetchRepoInfo(owner, name),
          GitHubService.fetchPullRequest(owner, name, parseInt(prNumber))
        ]);
        
        setRepoInfo(repoData);
        setPullRequest(prData);
        setFiles(prData.files);
        
        return;
      }

      const parsedRepo = GitHubService.parseGitHubUrl(url);
      
      if (!parsedRepo) {
        throw new Error('Invalid GitHub URL. Please provide a valid GitHub repository, file, or pull request URL.');
      }

      // Fetch repository info
      const repoData = await GitHubService.fetchRepoInfo(parsedRepo.owner, parsedRepo.name);
      setRepoInfo(repoData);

      if (parsedRepo.path) {
        setContentType('file');
        // Single file URL
        try {
          const file = await GitHubService.fetchFileContent(
            parsedRepo.owner, 
            parsedRepo.name, 
            parsedRepo.path, 
            parsedRepo.branch || repoData.defaultBranch
          );
          setSelectedFile(file);
          setFiles([file]);
        } catch (fileError) {
          // If single file fetch fails, try to fetch as directory
          const dirFiles = await GitHubService.fetchDirectoryContents(
            parsedRepo.owner, 
            parsedRepo.name, 
            parsedRepo.path, 
            parsedRepo.branch || repoData.defaultBranch
          );
          setFiles(dirFiles);
          setContentType('repo');
        }
      } else {
        setContentType('repo');
        // Repository root - fetch main code files
        const rootFiles = await GitHubService.fetchDirectoryContents(
          parsedRepo.owner, 
          parsedRepo.name, 
          '', 
          parsedRepo.branch || repoData.defaultBranch
        );
        setFiles(rootFiles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch from GitHub');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileSelect = (file: GitHubFile) => {
    setSelectedFile(file);
  };

  const handleAnalyzeFile = () => {
    if (selectedFile) {
      onCodeFetched(selectedFile.content, selectedFile.language, {
        source: 'github',
        contentType,
        fileName: selectedFile.name,
        filePath: selectedFile.path,
        fileUrl: selectedFile.url,
        repository: repoInfo?.fullName,
        pullRequest: pullRequest ? {
          number: pullRequest.number,
          title: pullRequest.title,
          author: pullRequest.author,
        } : undefined,
      });
    }
  };

  const handleAnalyzeAll = () => {
    if (files.length > 0) {
      const combinedCode = files.map(file => 
        `// File: ${file.path}\n${file.content}`
      ).join('\n\n');
      
      const primaryLanguage = files[0]?.language || 'javascript';
      
      onCodeFetched(combinedCode, primaryLanguage, {
        source: 'github',
        contentType,
        fileCount: files.length,
        repository: repoInfo?.fullName,
        files: files.map(f => ({ name: f.name, path: f.path, url: f.url })),
        pullRequest: pullRequest ? {
          number: pullRequest.number,
          title: pullRequest.title,
          author: pullRequest.author,
          additions: pullRequest.additions,
          deletions: pullRequest.deletions,
          changedFiles: pullRequest.changedFiles,
        } : undefined,
      });
    }
  };

  const handleAnalyzePR = () => {
    if (pullRequest && files.length > 0) {
      handleAnalyzeAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-white" />
          <label className="text-white font-medium">GitHub Repository, File, or Pull Request URL:</label>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or https://github.com/owner/repo/pull/123"
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isFetching || isLoading}
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isFetching || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !url.trim() || isFetching || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isFetching ? (
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>Fetch</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Repository Info */}
      {repoInfo && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Github className="w-6 h-6 text-white" />
                <h3 className="text-xl font-semibold text-white">{repoInfo.fullName}</h3>
                <a
                  href={repoInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {repoInfo.description && (
                <p className="text-gray-300">{repoInfo.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Language: {repoInfo.language}</span>
                <span>⭐ {repoInfo.stars}</span>
                <span>🍴 {repoInfo.forks}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pull Request Info */}
      {pullRequest && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <GitPullRequest className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Pull Request #{pullRequest.number}
                  </h3>
                </div>
                <h4 className="text-lg text-gray-200">{pullRequest.title}</h4>
                {pullRequest.description && (
                  <p className="text-gray-300 text-sm max-w-2xl">
                    {pullRequest.description.slice(0, 200)}
                    {pullRequest.description.length > 200 && '...'}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleAnalyzePR}
                disabled={isLoading || files.length === 0}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Review Pull Request
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-300">Author</div>
                <div className="text-white font-medium">{pullRequest.author}</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-300">Files Changed</div>
                <div className="text-white font-medium">{pullRequest.changedFiles}</div>
              </div>
              
              <div className="bg-green-500/10 rounded-lg p-3 text-center">
                <div className="text-sm text-green-300">Additions</div>
                <div className="text-green-400 font-medium">+{pullRequest.additions}</div>
              </div>
              
              <div className="bg-red-500/10 rounded-lg p-3 text-center">
                <div className="text-sm text-red-300">Deletions</div>
                <div className="text-red-400 font-medium">-{pullRequest.deletions}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              {contentType === 'pr' ? (
                <>
                  <GitPullRequest className="w-5 h-5" />
                  <span>Changed Files ({files.length})</span>
                </>
              ) : (
                <>
                  <Folder className="w-5 h-5" />
                  <span>Code Files ({files.length})</span>
                </>
              )}
            </h3>
            
            {files.length > 1 && !pullRequest && (
              <button
                onClick={handleAnalyzeAll}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze All Files
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedFile?.path === file.path
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  <FileCode className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{file.path}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                    {file.language}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)}KB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FileCode className="w-5 h-5" />
              <span>{selectedFile.name}</span>
            </h3>
            
            <button
              onClick={handleAnalyzeFile}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze This File
            </button>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {selectedFile.content.slice(0, 1000)}
              {selectedFile.content.length > 1000 && '...'}
            </pre>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
            <span>Language: {selectedFile.language}</span>
            <span>{selectedFile.content.split('\n').length} lines</span>
          </div>
        </div>
      )}

      {/* Usage Examples */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Supported URL Formats:</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Github className="w-4 h-4" />
            <span>Repository: https://github.com/owner/repo</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4" />
            <span>Single file: https://github.com/owner/repo/blob/main/src/App.js</span>
          </div>
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4" />
            <span>Directory: https://github.com/owner/repo/tree/main/src</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-4 h-4 text-purple-400" />
            <span>Pull request: https://github.com/owner/repo/pull/123</span>
          </div>
        </div>
      </div>
    </div>
  );
}