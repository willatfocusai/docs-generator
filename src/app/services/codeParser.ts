// src/app/services/codeParser.ts
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import type { Node, FunctionDeclaration, VariableDeclaration } from '@babel/types';

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

export async function parseCode(sourceCode: string): Promise<ParseResult> {
  const result: ParseResult = {
    imports: [],
    exports: [],
    functions: [],
    dependencies: [],
    patterns: {
      authentication: false,
      validation: false,
      database: false,
      caching: false,
      rateLimit: false,
      errorHandling: false,
    },
  };

  try {
    // Parse the code into an AST
    const ast = parser.parse(sourceCode, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    // Traverse the AST to analyze the code
    traverse(ast, {
      // Track imports
      ImportDeclaration(path) {
        result.imports.push(path.node.source.value);
        result.dependencies.push(path.node.source.value);
      },

      // Track exports
      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          if (path.node.declaration.type === 'FunctionDeclaration' && path.node.declaration.id) {
            result.exports.push(path.node.declaration.id.name);
          }
        }
      },

      // Analyze functions
      FunctionDeclaration(path) {
        const node = path.node as FunctionDeclaration;
        if (node.id) {
          result.functions.push({
            name: node.id.name,
            params: node.params.map(param => {
              if ('name' in param) {
                return param.name;
              }
              return 'unknown';
            }),
            async: node.async,
          });
        }
      },

      // Detect patterns through code analysis
      CallExpression(path) {
        const callee = path.node.callee;
        if ('name' in callee) {
          // Authentication pattern detection
          if (['authenticate', 'requireAuth', 'isAuthenticated'].includes(callee.name)) {
            result.patterns.authentication = true;
          }
          // Validation pattern detection
          if (['validate', 'validateInput', 'schema'].includes(callee.name)) {
            result.patterns.validation = true;
          }
          // Database pattern detection
          if (['query', 'findOne', 'findMany', 'create', 'update', 'delete'].includes(callee.name)) {
            result.patterns.database = true;
          }
          // Caching pattern detection
          if (['cache', 'getCache', 'setCache'].includes(callee.name)) {
            result.patterns.caching = true;
          }
          // Rate limiting pattern detection
          if (['rateLimit', 'throttle'].includes(callee.name)) {
            result.patterns.rateLimit = true;
          }
        }
      },

      // Error handling pattern detection
      TryStatement() {
        result.patterns.errorHandling = true;
      },
    });

    return result;
  } catch (error) {
    console.error('Error parsing code:', error);
    throw error;
  }
}