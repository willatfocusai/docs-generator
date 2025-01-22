// src/app/services/githubService.ts
import type { File, Endpoint } from './types';

export class GitHubService {
  private static async validateGithubUrl(repoUrl: string): Promise<{ owner: string; repo: string; }> {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL format. Please use https://github.com/username/repository');
    }
    return {
      owner: match[1],
      repo: match[2]
    };
  }

  public static async fetchRepositoryFiles(repoUrl: string): Promise<File[]> {
    try {
      console.log('Fetching repository files...');
      
      // Validate repository URL
      const { owner, repo } = await this.validateGithubUrl(repoUrl);

      // Make API call to our unified endpoint
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          repoUrl,
          owner,
          repo
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch repository: ${response.statusText}`);
      }

      const { documentation } = await response.json();

      // Log the results
      console.log(`Found ${documentation.files.length} API files`);
      
      return documentation.files;
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw error;
    }
  }

  // Keep these utility functions for potential client-side use
  public static determineFileType(path: string): string {
    if (path.includes('/api/')) {
      if (path.includes('.spec.ts')) return 'API Specification';
      if (path.includes('/v1/')) return 'V1 API Route';
      return 'API Route';
    }
    if (path.includes('controller')) return 'Controller';
    if (path.includes('service')) return 'Service';
    return 'API Definition';
  }

  public static detectAuthRequirement(code: string): string {
    if (code.includes('@requiresAuth') || 
        code.includes('authenticate') || 
        code.includes('isAuthenticated') ||
        code.includes('useAuth') ||
        code.includes('withAuth') ||
        code.includes('authorization') ||
        code.includes('Bearer') ||
        code.includes('@Security')) {
      return 'Required';
    }
    return 'None';
  }

  public static looksLikeApiFile(path: string, content: string): boolean {
    return (
      path.includes('/api/') ||
      content.includes('export default') ||
      content.includes('router.') ||
      content.includes('@Controller') ||
      /function\s+handler/.test(content)
    );
  }
}