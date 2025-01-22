'use client'

import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"

export default function DocPage() {
  const params = useParams()
  // params.slug will be an array of the URL segments
  // e.g., for /docs/api/auth it would be ['api', 'auth']

  return (
    <div className="flex min-h-screen">
      {/* Mobile Navigation Trigger */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <DocsSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r h-screen sticky top-0">
        <DocsSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
          
          {/* Example API Documentation Section */}
          <section className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Authentication</h2>
              <p>Learn how to authenticate with our API.</p>
              
              <h3>Base URL</h3>
              <code className="block bg-muted p-4 rounded-md">
                https://api.example.com/v1
              </code>

              <h3>Authentication Methods</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>API Key</TableCell>
                    <TableCell>Send your API key in the Authorization header</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>OAuth 2.0</TableCell>
                    <TableCell>Use OAuth 2.0 for secure user authentication</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

// Sidebar Component
function DocsSidebar() {
  return (
    <ScrollArea className="h-full py-6 px-4">
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Getting Started</h4>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Introduction
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Quick Start
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="mb-2 text-sm font-semibold">API Reference</h4>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Authentication
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Endpoints
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Error Handling
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}