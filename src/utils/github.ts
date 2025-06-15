import { GitHubRepo, GitHubFile, GitHubPullRequest, GitHubRepoInfo } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  private static getLanguageFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
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
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'bash',
      'yml': 'yaml',
      'yaml': 'yaml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'sql': 'sql',
      'md': 'markdown',
      'dockerfile': 'dockerfile',
    };
    
    return languageMap[extension || ''] || 'text';
  }

  static parseGitHubUrl(url: string): GitHubRepo | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname !== 'github.com') {
        return null;
      }

      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      if (pathParts.length < 2) {
        return null;
      }

      const owner = pathParts[0];
      const name = pathParts[1];
      
      // Handle different URL formats
      if (pathParts.length === 2) {
        // Basic repo URL: https://github.com/owner/repo
        return { owner, name };
      }
      
      if (pathParts[2] === 'blob' && pathParts.length >= 5) {
        // File URL: https://github.com/owner/repo/blob/branch/path/to/file
        const branch = pathParts[3];
        const path = pathParts.slice(4).join('/');
        return { owner, name, branch, path };
      }
      
      if (pathParts[2] === 'tree' && pathParts.length >= 4) {
        // Branch/directory URL: https://github.com/owner/repo/tree/branch/path
        const branch = pathParts[3];
        const path = pathParts.length > 4 ? pathParts.slice(4).join('/') : '';
        return { owner, name, branch, path };
      }

      return { owner, name };
    } catch {
      return null;
    }
  }

  static async fetchRepoInfo(owner: string, name: string): Promise<GitHubRepoInfo> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found. Please check the URL and ensure the repository is public.');
      }
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch repository info: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description || '',
      language: data.language || 'Unknown',
      stars: data.stargazers_count,
      forks: data.forks_count,
      url: data.html_url,
      defaultBranch: data.default_branch,
    };
  }

  static async fetchFileContent(owner: string, name: string, path: string, branch = 'main'): Promise<GitHubFile> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/contents/${path}?ref=${branch}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.type !== 'file') {
      throw new Error('The specified path is not a file');
    }
    
    if (data.size > 1000000) { // 1MB limit
      throw new Error('File is too large to analyze (max 1MB)');
    }
    
    const content = atob(data.content.replace(/\s/g, ''));
    
    return {
      name: data.name,
      path: data.path,
      content,
      language: this.getLanguageFromExtension(data.name),
      size: data.size,
      url: data.html_url,
    };
  }

  static async fetchDirectoryContents(owner: string, name: string, path = '', branch = 'main'): Promise<GitHubFile[]> {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/contents/${path}?ref=${branch}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch directory contents: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('The specified path is not a directory');
    }
    
    const files: GitHubFile[] = [];
    
    // Limit to first 20 files to avoid rate limiting
    const limitedData = data.slice(0, 20);
    
    for (const item of limitedData) {
      if (item.type === 'file' && this.isCodeFile(item.name) && item.size <= 100000) { // 100KB limit per file
        try {
          const fileContent = await this.fetchFileContent(owner, name, item.path, branch);
          files.push(fileContent);
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to fetch file ${item.path}:`, error);
        }
      }
    }
    
    return files;
  }

  static async fetchPullRequest(owner: string, name: string, prNumber: number): Promise<GitHubPullRequest> {
    const [prResponse, filesResponse] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/pulls/${prNumber}`),
      fetch(`${GITHUB_API_BASE}/repos/${owner}/${name}/pulls/${prNumber}/files`)
    ]);
    
    if (!prResponse.ok || !filesResponse.ok) {
      if (prResponse.status === 404) {
        throw new Error('Pull request not found');
      }
      throw new Error('Failed to fetch pull request data');
    }
    
    const prData = await prResponse.json();
    const filesData = await filesResponse.json();
    
    const files: GitHubFile[] = [];
    
    // Limit to first 10 files to avoid overwhelming the analysis
    const limitedFiles = filesData.slice(0, 10);
    
    for (const file of limitedFiles) {
      if (file.status !== 'removed' && this.isCodeFile(file.filename) && file.changes <= 500) {
        try {
          // For PR files, we'll use the patch content if available, otherwise fetch the full file
          let content = '';
          
          if (file.patch) {
            // Extract the new content from the patch
            content = this.extractContentFromPatch(file.patch);
          } else {
            // Fallback to fetching the full file
            const fileContent = await this.fetchFileContent(owner, name, file.filename, prData.head.sha);
            content = fileContent.content;
          }
          
          files.push({
            name: file.filename.split('/').pop() || file.filename,
            path: file.filename,
            content,
            language: this.getLanguageFromExtension(file.filename),
            size: file.changes || 0,
            url: file.blob_url,
          });
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to fetch PR file ${file.filename}:`, error);
        }
      }
    }
    
    return {
      number: prData.number,
      title: prData.title,
      description: prData.body || '',
      author: prData.user.login,
      files,
      additions: prData.additions,
      deletions: prData.deletions,
      changedFiles: prData.changed_files,
    };
  }

  private static extractContentFromPatch(patch: string): string {
    // Extract added lines from the patch (lines starting with +)
    const lines = patch.split('\n');
    const addedLines: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines.push(line.substring(1)); // Remove the + prefix
      } else if (!line.startsWith('-') && !line.startsWith('@@') && !line.startsWith('+++') && !line.startsWith('---')) {
        addedLines.push(line); // Include context lines
      }
    }
    
    return addedLines.join('\n');
  }

  private static isCodeFile(filename: string): boolean {
    const codeExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cs', 'cpp', 'cc', 'cxx', 'c',
      'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'yml', 'yaml',
      'json', 'xml', 'html', 'css', 'scss', 'sass', 'less', 'sql', 'dockerfile'
    ];
    
    const extension = filename.split('.').pop()?.toLowerCase();
    return codeExtensions.includes(extension || '') || filename.toLowerCase() === 'dockerfile';
  }
}