// src/lib/docgen/index.ts
import { Octokit } from 'octokit'

interface RepoContent {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export class DocumentationGenerator {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async analyzeRepository(owner: string, repo: string) {
    // Get all repository contents recursively
    const contents = await this.getAllContents(owner, repo);
    
    // Analyze each file based on type
    const documentation = {
      apis: await this.generateApiDocs(contents),
      types: await this.generateTypeDocs(contents),
      readme: await this.parseReadme(contents),
      configuration: await this.parseConfig(contents)
    };

    return documentation;
  }

  private async getAllContents(owner: string, repo: string): Promise<RepoContent[]> {
    const contents: RepoContent[] = [];
    
    // Get the repository tree
    const { data: tree } = await this.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'main',
      recursive: 'true'
    });

    // Get content for each file
    for (const item of tree.tree) {
      if (item.type === 'blob') {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });

        if ('content' in data) {
          contents.push({
            path: item.path,
            content: Buffer.from(data.content, 'base64').toString(),
            type: 'file'
          });
        }
      }
    }

    return contents;
  }

  private async generateApiDocs(contents: RepoContent[]) {
    const apiFiles = contents.filter(file => 
      // Look for common API file patterns
      file.path.includes('/api/') ||
      file.path.includes('routes') ||
      file.path.match(/\.(controller|service|handler)\.(ts|js)$/)
    );

    return apiFiles.map(file => {
      // Parse the file content for API documentation
      const routes = this.findRoutes(file.content);
      const methods = this.findHttpMethods(file.content);
      const params = this.findParameters(file.content);

      return {
        path: file.path,
        routes,
        methods,
        params
      };
    });
  }

  private findRoutes(content: string) {
    // Look for route patterns in Express/Next.js/etc
    const routes: string[] = [];
    
    // Express-style routes
    const expressRoutes = content.match(/\.(get|post|put|delete)\(['"]([^'"]+)['"]/g);
    if (expressRoutes) {
      routes.push(...expressRoutes);
    }

    // Next.js API routes (based on file structure)
    // FastAPI/Python routes
    // etc.

    return routes;
  }

  private findHttpMethods(content: string) {
    // Extract HTTP methods and their handlers
    const methods = content.match(/\b(get|post|put|delete|patch)\b/gi) || [];
    return [...new Set(methods)];
  }

  private findParameters(content: string) {
    // Find API parameters, query strings, body schemas
    const params: any[] = [];
    
    // Look for TypeScript interfaces
    const interfaces = content.match(/interface\s+\w+\s*{[^}]+}/g);
    if (interfaces) {
      params.push(...interfaces);
    }

    // Look for JSDoc comments
    const jsdocs = content.match(/\/\*\*[\s\S]*?\*\//g);
    if (jsdocs) {
      params.push(...jsdocs);
    }

    return params;
  }

  private async parseReadme(contents: RepoContent[]) {
    const readme = contents.find(file => 
      file.path.toLowerCase() === 'readme.md'
    );
    return readme ? readme.content : null;
  }

  private async parseConfig(contents: RepoContent[]) {
    // Look for configuration files
    const configFiles = contents.filter(file => 
      file.path.match(/\.(json|yaml|toml)$/) &&
      (file.path.includes('config') || file.path.includes('settings'))
    );

    return configFiles.map(file => ({
      path: file.path,
      content: file.content
    }));
  }
}