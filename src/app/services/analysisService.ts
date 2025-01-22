// src/app/services/analysisService.ts
import type { Endpoint, File } from './types';

export class AnalysisService {
  private static generateCurlExample(endpoint: Endpoint): string {
    const method = endpoint.methods?.[0] || 'GET';
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    
    let example = `curl -X ${method} 'https://api.example.com${endpoint.path}'`;
    
    if (hasBody && endpoint.requestSchema) {
      example += ` \\\n-H 'Content-Type: application/json' \\\n-d '${JSON.stringify(endpoint.requestSchema, null, 2)}'`;
    }
    
    return example;
  }

  private static generateJSExample(endpoint: Endpoint): string {
    const method = endpoint.methods?.[0] || 'GET';
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    
    let options = `{
  method: '${method}',
  headers: {
    'Content-Type': 'application/json'
  }`;
    
    if (hasBody && endpoint.requestSchema) {
      options += `,\n  body: JSON.stringify(${JSON.stringify(endpoint.requestSchema, null, 2)})`;
    }
    
    options += '\n}';
    
    return `fetch('https://api.example.com${endpoint.path}', ${options})`;
  }

  private static generatePythonExample(endpoint: Endpoint): string {
    const method = endpoint.methods?.[0] || 'GET';
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    
    let example = `import requests\n\n`;
    
    if (hasBody && endpoint.requestSchema) {
      example += `data = ${JSON.stringify(endpoint.requestSchema, null, 2)}\n\n`;
      example += `response = requests.${method.toLowerCase()}('https://api.example.com${endpoint.path}', json=data)`;
    } else {
      example += `response = requests.${method.toLowerCase()}('https://api.example.com${endpoint.path}')`;
    }
    
    return example;
  }

  public static async analyzeFiles(files: File[], repository?: string): Promise<File[]> {
    try {
      console.log('Starting analysis...');
      
      // Make API call to generate docs
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          repoUrl: repository,
          files: files.map(file => ({
            ...file,
            endpoints: file.endpoints?.map(endpoint => ({
              ...endpoint,
              examples: endpoint.methods?.map(method => ({
                method,
                examples: {
                  curl: this.generateCurlExample({ ...endpoint, methods: [method] }),
                  js: this.generateJSExample({ ...endpoint, methods: [method] }),
                  python: this.generatePythonExample({ ...endpoint, methods: [method] })
                }
              }))
            }))
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const { documentation } = await response.json();
      
      // Process and enhance the response
      const enhancedFiles = documentation.files.map((file: File) => ({
        ...file,
        endpoints: file.endpoints?.map(endpoint => ({
          ...endpoint,
          examples: endpoint.methods?.map(method => ({
            method,
            examples: {
              curl: this.generateCurlExample({ ...endpoint, methods: [method] }),
              js: this.generateJSExample({ ...endpoint, methods: [method] }),
              python: this.generatePythonExample({ ...endpoint, methods: [method] })
            }
          }))
        }))
      }));

      console.log('Analysis complete');
      return enhancedFiles;
      
    } catch (error) {
      console.error('Error in analyzeFiles:', error);
      throw error;
    }
  }
}