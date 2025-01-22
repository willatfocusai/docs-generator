// src/app/utils/analysis.ts
import type { Endpoint } from '../services/types'

export const analyzeEndpoint = async (endpoint: Endpoint) => {
  const {
    path = '',
    methods = [],
    sourceCode = '',
    description = '',
  } = endpoint;

  // Parse endpoint structure
  const segments = path.split('/').filter(Boolean);
  const pathParams = path.match(/\[(.*?)\]/g)?.map(p => p.replace(/[\[\]]/g, '')) || [];
  const domain = segments.find(s => !['api', 'admin', 'v1', 'index.ts'].includes(s));
  const isAdmin = path.includes('/admin/');
  const version = segments.find(s => s.startsWith('v')) || 'v1';
  const resourceType = segments[segments.length - 1]?.replace('.ts', '') || 'resource';

  // Deep code analysis
  const codePatterns = await analyzeCodePatterns(sourceCode);
  const functionalAnalysis = await analyzeFunctionality(sourceCode, methods);
  const securityProfile = await analyzeSecurityMeasures(sourceCode, isAdmin);
  const dataFlowAnalysis = await analyzeDataFlow(sourceCode, methods);
  
  return {
    context: { domain, isAdmin, version, resourceType, pathParams },
    analysis: {
      patterns: codePatterns,
      functionality: functionalAnalysis,
      security: securityProfile,
      dataFlow: dataFlowAnalysis,
      complexity: assessComplexity(codePatterns, functionalAnalysis)
    }
  };
};

const analyzeCodePatterns = async (sourceCode: string) => {
  const patterns = {
    async: /async|await|Promise/,
    eventDriven: /emit|on\(|addEventListener/,
    streamProcessing: /pipe|stream|transform/,
    errorBoundary: /try|catch|finally/,
    validation: /validate|schema|assert/,
    caching: /cache|memoize|store/,
    monitoring: /metrics|monitor|track/,
    optimization: /optimize|index|aggregate/
  };

  return Object.entries(patterns).reduce((acc, [key, pattern]) => ({
    ...acc,
    [key]: {
      present: pattern.test(sourceCode),
      matches: sourceCode.match(pattern)?.length || 0
    }
  }), {});
};

const analyzeFunctionality = async (sourceCode: string, methods: string[]) => {
  const functionalPatterns = {
    dataValidation: /validate|sanitize|check/,
    stateManagement: /state|store|context/,
    businessLogic: /calculate|process|transform/,
    integration: /connect|sync|integrate/
  };

  return {
    patterns: Object.entries(functionalPatterns).reduce((acc, [key, pattern]) => ({
      ...acc,
      [key]: pattern.test(sourceCode)
    }), {}),
    methodAnalysis: methods.map(method => ({
      method,
      complexity: assessMethodComplexity(sourceCode, method)
    }))
  };
};

const analyzeSecurityMeasures = async (sourceCode: string, isAdmin: boolean) => {
  const securityPatterns = {
    authentication: /authenticate|login|session/,
    authorization: /authorize|permission|role/,
    encryption: /encrypt|cipher|hash/,
    sanitization: /sanitize|escape|clean/,
    rateLimit: /rate|throttle|limit/
  };

  return {
    measures: Object.entries(securityPatterns).reduce((acc, [key, pattern]) => ({
      ...acc,
      [key]: pattern.test(sourceCode)
    }), {}),
    requiresAuth: isAdmin || /auth|login|session/.test(sourceCode),
    securityLevel: assessSecurityLevel(sourceCode, isAdmin)
  };
};

const analyzeDataFlow = async (sourceCode: string, methods: string[]) => {
  return {
    hasInputStream: /readStream|createReadStream/.test(sourceCode),
    hasOutputStream: /writeStream|createWriteStream/.test(sourceCode),
    dataTransformations: extractTransformations(sourceCode),
    asyncOperations: extractAsyncOperations(sourceCode)
  };
};

const assessMethodComplexity = (sourceCode: string, method: string): 'simple' | 'moderate' | 'complex' => {
  const methodSection = extractMethodSection(sourceCode, method);
  const metrics = {
    lines: methodSection.split('\n').length,
    conditionals: (methodSection.match(/if|switch|\\?:/g) || []).length,
    loops: (methodSection.match(/for|while|do/g) || []).length,
    asyncOps: (methodSection.match(/await/g) || []).length
  };

  const complexityScore = 
    metrics.lines * 0.1 +
    metrics.conditionals * 2 +
    metrics.loops * 3 +
    metrics.asyncOps * 1.5;

  if (complexityScore < 5) return 'simple';
  if (complexityScore < 15) return 'moderate';
  return 'complex';
};

const extractMethodSection = (sourceCode: string, method: string): string => {
  const methodPattern = new RegExp(`${method.toLowerCase()}.*?\\{([\\s\\S]*?)\\}`, 'i');
  const match = sourceCode.match(methodPattern);
  return match ? match[1] : '';
};

const extractTransformations = (sourceCode: string): string[] => {
  const transformations = [];
  if (/map\(/.test(sourceCode)) transformations.push('mapping');
  if (/filter\(/.test(sourceCode)) transformations.push('filtering');
  if (/reduce\(/.test(sourceCode)) transformations.push('reduction');
  if (/sort\(/.test(sourceCode)) transformations.push('sorting');
  return transformations;
};

const extractAsyncOperations = (sourceCode: string): string[] => {
  const asyncOps = [];
  if (/fetch\(/.test(sourceCode)) asyncOps.push('external API calls');
  if (/query|findBy/.test(sourceCode)) asyncOps.push('database operations');
  if (/cache/.test(sourceCode)) asyncOps.push('cache operations');
  return asyncOps;
};

const assessComplexity = (patterns: any, functionality: any) => {
  const complexityFactors = [
    patterns.async.present,
    patterns.eventDriven.present,
    patterns.streamProcessing.present,
    functionality.patterns.stateManagement,
    functionality.patterns.integration
  ].filter(Boolean).length;

  return {
    level: complexityFactors <= 2 ? 'simple' : complexityFactors <= 4 ? 'moderate' : 'complex',
    factors: complexityFactors
  };
};

const assessSecurityLevel = (sourceCode: string, isAdmin: boolean): string => {
  const securityScore = 
    (isAdmin ? 2 : 0) +
    (/authenticate|login|session/.test(sourceCode) ? 2 : 0) +
    (/authorize|permission|role/.test(sourceCode) ? 2 : 0) +
    (/encrypt|cipher|hash/.test(sourceCode) ? 1 : 0) +
    (/sanitize|escape|clean/.test(sourceCode) ? 1 : 0);

  if (securityScore >= 6) return 'high';
  if (securityScore >= 3) return 'medium';
  return 'basic';
};

export const generateEndpointDocs = async (endpoint: Endpoint) => {
  const analysis = await analyzeEndpoint(endpoint);
  return formatEndpointDocumentation(analysis);
};

const formatEndpointDocumentation = (analysis: any) => {
  const { context, analysis: endpointAnalysis } = analysis;
  
  return `# ${context.resourceType} API

## Overview
${generateOverview(context, endpointAnalysis)}

## Implementation Details
${generateImplementationDetails(endpointAnalysis)}

## Security Profile
${generateSecurityProfile(endpointAnalysis.security)}

## Usage Considerations
${generateUsageConsiderations(analysis)}
`;
};

const generateOverview = (context: any, analysis: any) => {
  const { domain, resourceType, version } = context;
  const { complexity, functionality } = analysis;

  return `This ${version} API endpoint manages ${resourceType} resources within the ${domain || 'main'} domain. 
It implements a ${complexity.level} architecture with ${functionality.methodAnalysis.length} core operations.

${complexity.level === 'complex' ? 
  'Due to its sophisticated implementation, careful attention to error handling and input validation is recommended.' :
  'The straightforward implementation allows for easy integration and usage.'}`;
};

const generateImplementationDetails = (analysis: any) => {
  const { patterns, functionality, dataFlow } = analysis;
  
  let details = [];
  
  if (patterns.async.present) {
    details.push(`Implements asynchronous processing with ${dataFlow.asyncOperations.join(', ')}`);
  }
  
  if (patterns.streamProcessing.present) {
    details.push(`Utilizes stream-based data handling for ${
      [
        dataFlow.hasInputStream && 'input',
        dataFlow.hasOutputStream && 'output'
      ].filter(Boolean).join(' and ')
    }`);
  }
  
  if (dataFlow.dataTransformations.length) {
    details.push(`Performs data transformations: ${dataFlow.dataTransformations.join(', ')}`);
  }
  
  return details.join('\n\n');
};

const generateSecurityProfile = (security: any) => {
  const { measures, securityLevel } = security;
  
  const implementedMeasures = Object.entries(measures)
    .filter(([_, implemented]) => implemented)
    .map(([measure]) => measure);
  
  return `Security Level: ${securityLevel}\n${
    implementedMeasures.length ? 
    `Implemented measures:\n${implementedMeasures.map(m => `- ${m}`).join('\n')}` :
    'Basic security implementation with standard measures'
  }`;
};

const generateUsageConsiderations = (analysis: any) => {
  const { patterns, dataFlow } = analysis.analysis;
  
  const considerations = [];
  
  if (patterns.caching.present) {
    considerations.push('Response caching available for performance optimization');
  }
  
  if (dataFlow.asyncOperations.length > 0) {
    considerations.push(
      `Asynchronous operations: ${dataFlow.asyncOperations.join(', ')}`
    );
  }
  
  if (patterns.monitoring.present) {
    considerations.push('Performance metrics and monitoring enabled');
  }
  
  return considerations.join('\n\n');
};

export const generateExamples = (endpoint: Endpoint, analysis: any) => {
  const { context, analysis: endpointAnalysis } = analysis;
  
  return endpoint.methods?.map(method => ({
    method,
    examples: {
      curl: generateCurlExample(method, endpoint.path, endpointAnalysis),
      js: generateJavaScriptExample(method, endpoint.path, endpointAnalysis),
      python: generatePythonExample(method, endpoint.path, endpointAnalysis)
    }
  }));
};

const generateCurlExample = (method: string, path: string, analysis: any): string => {
  const { security } = analysis;
  const headers = [
    '-H "Content-Type: application/json"',
    security.requiresAuth ? '-H "Authorization: Bearer your-api-key"' : null,
    security.measures.rateLimit ? '-H "X-Rate-Limit-Strategy: adaptive"' : null
  ].filter(Boolean);

  return `curl -X ${method} \\
  "https://api.example.com${path}" \\
  ${headers.join(' \\\n  ')}`;
};

const generateJavaScriptExample = (method: string, path: string, analysis: any): string => {
  const { security, dataFlow } = analysis;
  const hasStreaming = dataFlow.hasInputStream || dataFlow.hasOutputStream;
  
  return `// Example with error handling and ${hasStreaming ? 'streaming ' : ''}data
const ${method.toLowerCase()}${path.split('/').pop()?.replace(/[^a-zA-Z]/g, '') || 'Resource'} = async () => {
  try {
    ${hasStreaming ? generateStreamingExample(method, path) : generateStandardExample(method, path, security)}
  } catch (error) {
    console.error('Error:', error.message);
    // Implement appropriate error handling
  }
};`;
};

const generateStreamingExample = (method: string, path: string): string => {
  return `const response = await fetch('https://api.example.com${path}');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Received:', decoder.decode(value));
    }`;
};

const generateStandardExample = (method: string, path: string, security: any): string => {
  const headers = {
    'Content-Type': 'application/json',
    ...(security.requiresAuth && { 'Authorization': 'Bearer your-api-key' }),
    ...(security.measures.rateLimit && { 'X-Rate-Limit-Strategy': 'adaptive' })
  };

  return `const response = await fetch('https://api.example.com${path}', {
      method: '${method}',
      headers: ${JSON.stringify(headers, null, 6)},
      // Add request body for POST/PUT/PATCH methods
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    console.log('Success:', data);`;
};

const generatePythonExample = (method: string, path: string, analysis: any): string => {
  const { security, dataFlow } = analysis;
  const hasStreaming = dataFlow.hasInputStream || dataFlow.hasOutputStream;

  const headers = {
    'Content-Type': 'application/json',
    ...(security.requiresAuth && { 'Authorization': 'Bearer your-api-key' }),
    ...(security.measures.rateLimit && { 'X-Rate-Limit-Strategy': 'adaptive' })
  };

  return `import requests
${hasStreaming ? 'from requests.exceptions import ChunkedEncodingError' : ''}

def ${method.toLowerCase()}_${path.split('/').pop()?.replace(/[^a-zA-Z]/g, '') || 'resource'}():
    try:
        ${hasStreaming ? 
          generatePythonStreamingExample(method, path, headers) : 
          generatePythonStandardExample(method, path, headers)}
    except requests.exceptions.RequestException as error:
        print('Error:', error)
        # Implement appropriate error handling`;
};

const generatePythonStreamingExample = (method: string, path: string, headers: any): string => {
  return `with requests.get('https://api.example.com${path}', 
            headers=${JSON.stringify(headers, null, 16)},
            stream=True) as response:
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    print('Received chunk:', len(chunk), 'bytes')`;
};

const generatePythonStandardExample = (method: string, path: string, headers: any): string => {
  return `response = requests.${method.toLowerCase()}(
            'https://api.example.com${path}',
            headers=${JSON.stringify(headers, null, 16)}
            # Add json parameter for POST/PUT/PATCH methods
        )
        response.raise_for_status()
        data = response.json()
        print('Success:', data)`;
};