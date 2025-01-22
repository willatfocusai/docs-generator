// src/app/api/generate-docs/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface DocumentationContent {
  overview: string;
  technicalDetails: string;
  parameters: string;
  responseFormat: string;
  errorHandling: string;
}

function extractEndpoints(content: string, path: string) {
  const endpoints = [];
  
  try {
    // Next.js API route detection
    if (content.includes('export default') || content.includes('export const')) {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].filter(method => 
        content.toLowerCase().includes(method.toLowerCase())
      );
      
      if (methods.length > 0) {
        endpoints.push({
          type: 'Next.js API Route',
          path: path,
          methods,
          sourceCode: content
        });
      }
    }

    // Express-style route detection
    const routeMatches = content.match(/\.(get|post|put|delete|patch)\s*\(\s*(['"`][^'"`]+['"`])/gi);
    if (routeMatches) {
      routeMatches.forEach(match => {
        const [method, routePath] = match.split('(').map(part => part.trim());
        const methodName = method.replace('.', '').toUpperCase();
        endpoints.push({
          type: 'Express Route',
          path: routePath.replace(/['"`,]/g, '').trim(),
          method: methodName,
          sourceCode: content
        });
      });
    }
  } catch (error) {
    console.error('Error extracting endpoints:', error);
  }

  return endpoints;
}

async function analyzeEndpoint(endpoint: any) {
  try {
    // First, generate the descriptive title
    const titlePrompt = `Create a clear title (3-5 words) for this API endpoint that explains its main purpose. Do not use quotes in your response.

Endpoint Information:
Type: ${endpoint.type}
Path: ${endpoint.path}
Methods: ${endpoint.methods ? endpoint.methods.join(', ') : endpoint.method}

Source Code:
${endpoint.sourceCode}

Example style titles (return similar format without quotes):
Fetch Task Breakdown Data
Ticket Context Analysis
Text Analysis Processor`;

    const titleCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at creating clear API endpoint titles. Return only the title text, without quotes or extra formatting."
        },
        {
          role: "user",
          content: titlePrompt
        }
      ],
      model: "gpt-3.5-turbo-0125",
      temperature: 0.7,
      max_tokens: 50
    });

    const title = titleCompletion.choices[0]?.message?.content?.trim()
      .replace(/^["']|["']$/g, '') // Remove any quotes
      .replace(/^["`']|["`']$/g, '') // Remove any other quote-like characters
      || 'API Endpoint';

    // Generate the full documentation (unchanged)
    const documentationPrompt = `Analyze this API endpoint and provide detailed documentation in natural, flowing paragraphs.

Endpoint Information:
Type: ${endpoint.type}
Path: ${endpoint.path}
Methods: ${endpoint.methods ? endpoint.methods.join(', ') : endpoint.method}

Source Code:
${endpoint.sourceCode}

Please write detailed paragraphs for each section:

1. OVERVIEW SECTION:
Write 2-3 clear paragraphs explaining what this endpoint does, its main purpose, and how it fits into the overall API. Focus on the business value and use cases.

2. TECHNICAL DETAILS SECTION:
Write a comprehensive paragraph about the technical implementation, including HTTP methods, authentication requirements, and any special considerations.

3. PARAMETERS SECTION:
Write detailed paragraphs explaining each parameter, including data types and validation rules.

4. RESPONSE FORMAT SECTION:
Write a thorough explanation of the response structure as a paragraph.

5. ERROR HANDLING SECTION:
Write detailed paragraphs explaining possible error scenarios and how to handle them.`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert technical writer who specializes in clear, detailed API documentation. Write naturally and conversationally, avoiding bullet points or technical formatting."
        },
        {
          role: "user",
          content: documentationPrompt
        }
      ],
      model: "gpt-3.5-turbo-0125",
      temperature: 0.3,
      max_tokens: 2000
    });

    const analysis = completion.choices[0]?.message?.content;
    
    if (!analysis) {
      throw new Error('Failed to generate documentation content');
    }

    const sections = parseSectionsEnhanced(analysis);

    return {
      ...endpoint,
      title, // Use the cleaned title
      documentation: sections,
      examples: generateCustomExamples(endpoint)
    };
  } catch (error) {
    console.error('Error analyzing endpoint:', error);
    return {
      ...endpoint,
      title: 'API Endpoint',
      documentation: {
        overview: 'Documentation generation in progress.',
        technicalDetails: 'Technical details are being processed.',
        parameters: 'Parameter documentation is being generated.',
        responseFormat: 'Response format documentation is being prepared.',
        errorHandling: 'Error handling documentation is being created.'
      },
      examples: generateCustomExamples(endpoint)
    };
  }
}

function parseSectionsEnhanced(response: string): DocumentationContent {
  const sections: DocumentationContent = {
    overview: '',
    technicalDetails: '',
    parameters: '',
    responseFormat: '',
    errorHandling: ''
  };

  try {
    const patterns = {
      overview: /\*\*OVERVIEW(?:\s+SECTION)?:?\*\*(.*?)(?=\*\*|$)/is,
      technicalDetails: /\*\*TECHNICAL\s+DETAILS(?:\s+SECTION)?:?\*\*(.*?)(?=\*\*|$)/is,
      parameters: /\*\*PARAMETERS(?:\s+SECTION)?:?\*\*(.*?)(?=\*\*|$)/is,
      responseFormat: /\*\*RESPONSE\s+FORMAT(?:\s+SECTION)?:?\*\*(.*?)(?=\*\*|$)/is,
      errorHandling: /\*\*ERROR\s+HANDLING(?:\s+SECTION)?:?\*\*(.*?)(?=\*\*|$)/is
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = response.match(pattern);
      if (match && match[1]) {
        sections[key as keyof DocumentationContent] = match[1]
          .trim()
          .replace(/^\s*\n+/g, '')
          .replace(/\n+\s*$/g, '');
      }
    });

    const emptyFields = Object.entries(sections)
      .filter(([_, content]) => !content)
      .map(([field]) => field);

    if (emptyFields.length > 0) {
      console.warn('Empty sections after parsing:', emptyFields);
      console.log('Original response:', response);
    }

    return sections;
  } catch (error) {
    console.error('Error parsing sections:', error);
    return sections;
  }
}

function generateCustomExamples(endpoint: any) {
  const method = endpoint.methods?.[0] || endpoint.method || 'GET';
  const path = endpoint.path;
  
  return [{
    method: 'Example',
    examples: {
      bash: generateCurlExample(method, path),
      javascript: generateJavaScriptExample(method, path),
      python: generatePythonExample(method, path)
    },
    label: 'API Examples'
  }];
}

function generateCurlExample(method: string, path: string) {
  return `curl -X ${method} 'https://api.example.com${path}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer <token>'`;
}

function generateJavaScriptExample(method: string, path: string) {
  return `async function callApi() {
  try {
    const response = await fetch('https://api.example.com${path}', {
      method: '${method}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <token>'
      }
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`;
}

function generatePythonExample(method: string, path: string) {
  return `import requests

def call_api():
    try:
        response = requests.${method.toLowerCase()}(
            'https://api.example.com${path}',
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <token>'
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        raise`;
}

async function processRepository(repoUrl: string) {
  try {
    const { owner, repo } = (() => {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
      if (!match) throw new Error('Invalid GitHub URL format');
      return { owner: match[1], repo: match[2] };
    })();

    const octokit = new Octokit({ 
      auth: process.env.GITHUB_TOKEN
    });

    console.log(`Starting analysis for repository: ${owner}/${repo}`);

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'main',
      recursive: 'true'
    });

    const apiFiles = data.tree
      .filter(item => {
        const path = item.path.toLowerCase();
        return item.type === 'blob' && 
               path.endsWith('.ts') && 
               (path.includes('/api/') || 
                path.includes('/routes/') || 
                path.includes('/controllers/'));
      })
      .slice(0, 15);

    console.log(`Found ${apiFiles.length} API-related files`);

    const processedFiles = [];
    for (const file of apiFiles) {
      try {
        console.log(`Processing file: ${file.path}`);
        
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.path,
        });

        if ('content' in fileData) {
          const content = Buffer.from(fileData.content, 'base64').toString();
          const endpoints = extractEndpoints(content, file.path);
          
          console.log(`Found ${endpoints.length} endpoints in ${file.path}`);

          const analyzedEndpoints = await Promise.all(
            endpoints.map(async (endpoint) => {
              console.log(`Analyzing endpoint: ${endpoint.path}`);
              const analyzed = await analyzeEndpoint(endpoint);
              return analyzed;
            })
          );

          if (analyzedEndpoints.length > 0) {
            processedFiles.push({
              path: file.path,
              fileType: file.path.includes('api') ? 'API Route' : 'Controller',
              endpoints: analyzedEndpoints
            });
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error);
      }
    }

    return {
      repository: `${owner}/${repo}`,
      files: processedFiles,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in processRepository:', error);
    throw error;
  }
}

// Route handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    console.log('Received request to process repository:', body.repoUrl);

    const documentation = await processRepository(body.repoUrl);

    return NextResponse.json({ documentation });
  } catch (error: any) {
    console.error('Error processing request:', error);
    
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate documentation',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: error.status || 500 }
    );
  }
}