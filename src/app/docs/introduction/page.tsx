'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GitBranch, Search, Code2, BookOpen } from 'lucide-react';

function MermaidChart({ chart }: { chart: string }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'dark'
      });
      
      if (elementRef.current) {
        elementRef.current.innerHTML = '';
        m.default.render('mermaid', chart).then((result) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = result.svg;
          }
        });
      }
    });
  }, [chart]);

  return <div ref={elementRef} className="mermaid bg-background rounded-lg" />;
}

export default function Page() {
  const diagram = `
    flowchart TD
      A[GitHub Repository URL] --> B[Fetch Repository Contents]
      B --> C[Filter API-Related Files]
      C --> D[Extract Endpoints]
      D --> E[Analyze Each Endpoint]
      
      subgraph FD[File Detection]
        F[.ts files]
        G[Contains /api/]
        H[Contains /routes/]
        I[Contains /controllers/]
        
        C --> F
        F --> G
        F --> H
        F --> I
      end
      
      subgraph EA[Endpoint Analysis]
        J[Generate Title]
        K[Generate Documentation]
        L[Create Code Examples]
        
        E --> J
        E --> K
        E --> L
      end
      
      K --> M[Overview]
      K --> N[Technical Details]
      K --> O[Parameters]
      K --> P[Response Format]
      K --> Q[Error Handling]
  `;

  return (
    <section className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">How It Works</h1>
      <p className="text-muted-foreground mb-8">
        Our intelligent documentation generator analyzes your codebase to create comprehensive, beautiful API documentation.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Documentation Generation Process</CardTitle>
          <CardDescription>
            See how we transform your repository into beautiful documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <MermaidChart chart={diagram} />
        </CardContent>
      </Card>

      <div className="grid gap-6 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-500" />
              <CardTitle>Repository Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We scan your repository for API-related files, focusing on routes, controllers, and API definitions to ensure comprehensive coverage of your API endpoints.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-500" />
              <CardTitle>Intelligent Parsing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our system intelligently extracts API endpoints, analyzing patterns in your code to identify routes, methods, and their associated logic.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-yellow-500" />
              <CardTitle>Code Example Generation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For each endpoint, we automatically generate code examples in multiple languages including cURL, JavaScript, and Python to help developers get started quickly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <CardTitle>Documentation Creation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The final step transforms all the analyzed information into clear, structured documentation including overviews, technical details, parameters, and error handling.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}