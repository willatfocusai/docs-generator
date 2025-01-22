'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Documentation</h1>
      <p className="text-muted-foreground mb-8">
        Learn how to integrate and use our documentation generator.
      </p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn the basics and get started with our documentation platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Setting up your repository</li>
              <li>Basic configuration</li>
              <li>Writing your first document</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to document your APIs effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>API endpoints documentation</li>
              <li>Authentication methods</li>
              <li>Request/Response examples</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}