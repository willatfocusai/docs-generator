'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, Moon, Sun, Download, Code2, ArrowUpRight, Loader2, Github, BookOpen, ArrowRight } from 'lucide-react'
import { EndpointDocumentation } from '@/components/EndpointDocumentation'
import type { DocsResponse, File } from '@/app/services/types'

const methodColors = {
  GET: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  POST: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  PUT: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  DELETE: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  PATCH: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
} as const

// --- Components -----------------------------------------------------------
const FileList = ({ files, theme }: { files: File[], theme: 'light' | 'dark' }) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {files.map((file, index) => (
        <Card key={index} className="overflow-hidden rounded-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50" 
            onClick={() => setExpandedFile(expandedFile === file.path ? null : file.path)}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{file.fileType}</Badge>
                <code className="text-sm font-mono">{file.path}</code>
              </div>
              <div className="text-sm text-muted-foreground">
                Found {file.endpoints?.length || 0} endpoints
              </div>
            </div>
          </CardHeader>

          {expandedFile === file.path && file.endpoints?.map((endpoint, i) => (
            <Card key={i} className="m-4 border border-muted rounded-xl">
              <CardHeader 
                className="cursor-pointer bg-muted/20 hover:bg-muted/30" 
                onClick={() => setExpandedEndpoint(expandedEndpoint === `${file.path}-${i}` ? null : `${file.path}-${i}`)}
              >
                <div className="flex flex-col gap-2">
                  <div className="font-medium">{endpoint.title}</div>
                  <div className="flex items-center gap-2">
                    {endpoint.methods?.map(method => (
                      <Badge 
                        key={method} 
                        className={methodColors[method as keyof typeof methodColors]}
                      >
                        {method}
                      </Badge>
                    ))}
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                </div>
              </CardHeader>

              {expandedEndpoint === `${file.path}-${i}` && (
                <CardContent className="border-t">
                  <EndpointDocumentation endpoint={endpoint} theme={theme} />
                </CardContent>
              )}
            </Card>
          ))}
        </Card>
      ))}
    </div>
  );
};

const WelcomeBanner = () => {
  return (
    <Card className="mb-8 border-none rounded-xl">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h2 className="text-xl font-bold">Welcome to the API Documentation Generator!</h2>
          </div>
          
          <p className="text-muted-foreground">
            Imagine you're an explorer in a vast digital jungle of APIs, endpoints, and confusing documentation. 
            Sounds scary, right? Fear not! This magical tool is your trusty compass and machete combined. 🧭⚔️
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-semibold">Our Mission</h3>
            </div>
            <p className="text-muted-foreground pl-8">
              We turn intimidating API documentation into beautiful, clear, and actually helpful guides. 
              No more crying over cryptic endpoints or pulling your hair out over parameter lists!
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h3 className="font-semibold">Cool Features</h3>
            </div>
            <ul className="text-muted-foreground pl-8 space-y-1">
              <li>• Dynamic analysis of API endpoints (it's like having a super-smart API whisperer)</li>
              <li>• Real-world examples in multiple languages (because who doesn't love options?)</li>
              <li>• Beautiful UI that won't make your eyes bleed</li>
              <li>• Dark mode for the night owls among us 🦉</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <h3 className="font-semibold">The Secret Sauce</h3>
            </div>
            <p className="text-muted-foreground pl-8">
              This isn't just a dusty old documentation generator. It actively analyzes your endpoints, 
              understands their purpose, and generates documentation that actually makes sense. 
              It's like having an AI assistant who's really into APIs and good documentation!
            </p>
          </div>

          <div className="pt-4 text-center text-muted-foreground">
            <p className="text-lg mt-2">Now, let's make some beautiful docs! 🚀</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function QuickStartPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocsResponse | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [progress, setProgress] = useState<string>('')

  const handleSubmit = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }
  
    setLoading(true);
    setError(null);
    setProgress('Analyzing repository...');
  
    try {
      const urlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
      if (!urlPattern.test(repoUrl)) {
        throw new Error('Invalid repository URL format. Please use https://github.com/username/repository');
      }
  
      const response = await fetch('/api/generate-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate documentation: ${response.statusText}`);
      }
  
      const result = await response.json();
      setDocs(result);
      setProgress('');
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filters = docs?.documentation?.files
    ? ['all', ...new Set(docs.documentation.files.map(f => f.fileType))]
    : ['all']

  const filteredFiles = docs?.documentation?.files.filter(file => {
    const matchesFilter = activeFilter === 'all' || file.fileType === activeFilter
    const matchesSearch = !searchQuery.trim() || 
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  }) || []

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        <aside className="w-64 border-r bg-muted/30 flex flex-col">
          <header className="p-4 border-b">
            <h1 className="font-bold text-xl">API Documentation</h1>
          </header>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {filteredFiles.map((file, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start mb-1 text-sm"
              >
                <Code2 className="mr-2 h-4 w-4" />
                {file.path.split('/').pop()}
              </Button>
            ))}
          </nav>

          <footer className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </footer>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <div className="ml-auto flex items-center gap-2">
                {filters.map(filter => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className="capitalize"
                  >
                    {filter === 'all' ? 'All Endpoints' : filter}
                  </Button>
                ))}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-5xl py-6 space-y-8">
              <WelcomeBanner />

              <Card className="rounded-xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-2xl font-bold">API Documentation Generator</CardTitle>
                  </div>
                  <CardDescription className="text-gray-500">
                    Generate comprehensive documentation for your API endpoints with just one click
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Github className="w-5 h-5 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="https://github.com/username/repo"
                          className="pl-10 w-full rounded-md"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-black hover:bg-gray-800 text-white px-6 rounded-lg"
                        >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <span>Generate</span>
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p className="flex items-center">
                        <span className="mr-2">💡</span>
                        Tip: Make sure your repository contains OpenAPI/Swagger specifications for best results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(loading || progress) && (
                <Alert className="mt-4 rounded-lg">
                  <AlertDescription>
                    {progress || 'Analyzing repository... This may take several minutes for larger repositories.'}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4 rounded-lg">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {docs?.documentation && (
                <Card className="rounded-xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Generated Documentation</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                          Open in Postman
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Repository: {docs.documentation.repository}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileList files={filteredFiles} theme={theme} />
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}