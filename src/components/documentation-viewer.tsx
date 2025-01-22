'use client'

import * as React from 'react'
import type { ElementRef, ComponentPropsWithoutRef } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Endpoint {
  method: string;
  path: string;
}

interface DocumentationFile {
  path: string;
  endpoints: Endpoint[];
  types: string[];
  comments: string[];
}

interface Documentation {
  repository: string;
  timestamp: string | number;
  files: DocumentationFile[];
}

interface DocumentationViewerProps {
  documentation: Documentation;
}

export function DocumentationViewer({ documentation }: DocumentationViewerProps) {
  const [activeFile, setActiveFile] = React.useState<DocumentationFile | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Documentation: {documentation.repository}</CardTitle>
          <CardDescription>
            Generated at {new Date(documentation.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {documentation.files.map((file, index) => (
              <AccordionItem
                key={`file-${index}`}
                value={`file-${index}`}
              >
                <AccordionTrigger>
                  <span className="font-mono text-sm">{file.path}</span>
                </AccordionTrigger>
                <AccordionContent>
                  {/* Endpoints Section */}
                  {file.endpoints.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
                      {file.endpoints.map((endpoint, i) => (
                        <div key={`endpoint-${i}`} className="p-2 border rounded-md mb-2">
                          <div className="flex items-center gap-2">
                            <Badge>{endpoint.method}</Badge>
                            <code className="text-sm">{endpoint.path}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Types Section */}
                  {file.types.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Types</h3>
                      {file.types.map((type, i) => (
                        <pre key={`type-${i}`} className="p-2 bg-muted rounded-md mb-2 text-sm overflow-x-auto">
                          {type}
                        </pre>
                      ))}
                    </div>
                  )}

                  {/* Comments Section */}
                  {file.comments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                      {file.comments.map((comment, i) => (
                        <div key={`comment-${i}`} className="p-2 bg-muted rounded-md mb-2 text-sm whitespace-pre-wrap">
                          {comment}
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}