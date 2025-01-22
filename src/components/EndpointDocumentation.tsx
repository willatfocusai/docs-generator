// src/components/EndpointDocumentation.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface EndpointDocumentationProps {
  endpoint: any;
  theme: 'light' | 'dark';
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">{title}</h3>
    <div>{children}</div>
  </div>
);

export function EndpointDocumentation({ endpoint, theme }: EndpointDocumentationProps) {
  return (
    <Tabs defaultValue="docs" className="space-y-4">
      <TabsList>
        <TabsTrigger value="docs">Documentation</TabsTrigger>
        <TabsTrigger value="examples">Examples</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
      </TabsList>

      {/* Documentation Tab */}
      <TabsContent value="docs" className="prose prose-sm dark:prose-invert max-w-none">
        <div className="space-y-6">
          {/* Endpoint Title and Info */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold mb-2">{endpoint.title}</h2>
            <div className="text-sm text-muted-foreground">
              {endpoint.type} • {endpoint.methods ? endpoint.methods.join(', ') : endpoint.method}
            </div>
          </div>

          <Section title="Overview">
            {endpoint.documentation?.overview || 'No overview available.'}
          </Section>

          <Section title="Technical Details">
            {endpoint.documentation?.technicalDetails || 'No technical details available.'}
          </Section>

          <Section title="Parameters">
            {endpoint.documentation?.parameters || 'No parameters documented.'}
          </Section>

          <Section title="Response Format">
            {endpoint.documentation?.responseFormat || 'No response format documented.'}
          </Section>

          <Section title="Error Handling">
            {endpoint.documentation?.errorHandling || 'No error handling documented.'}
          </Section>
        </div>
      </TabsContent>

      {/* Examples Tab */}
      <TabsContent value="examples" className="mt-4">
        <div className="space-y-6">
          {endpoint.examples?.map((example: any) => (
            <div key={example.label}>
              <h3 className="text-lg font-semibold mb-4">{example.label}</h3>
              <div className="space-y-6">
                {Object.entries(example.examples).map(([lang, code]) => (
                  <div key={lang}>
                    <h4 className="text-base font-semibold mb-2">
                      {lang === 'bash' ? 'cURL' : 
                       lang === 'js' ? 'JavaScript' : 
                       'Python'}
                    </h4>
                    <SyntaxHighlighter
                      language={lang}
                      style={theme === 'light' ? oneLight : oneDark}
                      className="rounded-lg !mt-0"
                    >
                      {String(code)}
                    </SyntaxHighlighter>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Schema Tab */}
      <TabsContent value="schema" className="mt-4">
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold mb-2">Request Schema</h4>
            <SyntaxHighlighter
              language="json"
              style={theme === 'light' ? oneLight : oneDark}
              className="rounded-lg !mt-0"
            >
              {endpoint.requestSchema || '// No request schema available'}
            </SyntaxHighlighter>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-2">Response Schema</h4>
            <SyntaxHighlighter
              language="json"
              style={theme === 'light' ? oneLight : oneDark}
              className="rounded-lg !mt-0"
            >
              {endpoint.responseSchema || '// No response schema available'}
            </SyntaxHighlighter>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}