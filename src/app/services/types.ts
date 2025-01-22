// src/app/services/types.ts

// API Example interfaces
export interface CodeExample {
  language: string;
  code: string;
  description?: string;
}

export interface EndpointExample {
  method: string;
  examples: {
    curl: string;
    js: string;
    python: string;
    [key: string]: string;
  };
  description?: string;
}

// AI Analysis interfaces
export interface AIAnalysisResult {
  description: string;
  functionality: string;
  security: string;
  bestPractices: string;
  useCases: string;
  integration: string;
}

export interface EndpointAnalysis {
  functionality?: string;
  security?: string;
  bestPractices?: string;
  useCases?: string;
  integration?: string;
  patterns?: {
    authentication: boolean;
    validation: boolean;
    database: boolean;
    caching: boolean;
    rateLimit: boolean;
    errorHandling: boolean;
  };
  dependencies?: string[];
}

// Parameter and Schema interfaces
export interface ParameterDefinition {
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
  enum?: any[];
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, ParameterDefinition>;
  required?: string[];
  description?: string;
}

// Main interfaces
export interface Endpoint {
  path?: string;
  type?: string;
  description?: string;
  methods?: string[];
  sourceCode?: string;
  documentation?: string;
  examples?: EndpointExample[];
  analysis?: EndpointAnalysis;
  parameters?: Record<string, ParameterDefinition>;
  requestSchema?: SchemaDefinition;
  responseSchema?: SchemaDefinition;
  authentication?: {
    required: boolean;
    type?: string;
    description?: string;
  };
  [key: string]: any; // Maintain backward compatibility
}

export interface File {
  path: string;
  fileType: string;
  endpoints?: Endpoint[];
  sourceCode?: string;
  analysis?: {
    imports?: string[];
    exports?: string[];
    dependencies?: string[];
  };
}

export interface Documentation {
  repository: string;
  files: File[];
  metadata?: {
    generatedAt: string;
    version: string;
    aiPowered: boolean;
  };
}

export interface DocsResponse {
  documentation: Documentation;
}

// Utility type for parsing results
export interface ParseResult {
  imports: string[];
  exports: string[];
  functions: {
    name: string;
    params: string[];
    async: boolean;
  }[];
  dependencies: string[];
  patterns: {
    authentication: boolean;
    validation: boolean;
    database: boolean;
    caching: boolean;
    rateLimit: boolean;
    errorHandling: boolean;
  };
}