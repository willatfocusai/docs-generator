'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Mobile Navigation Trigger */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <DocsSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r h-screen sticky top-0">
        <DocsSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function DocsSidebar() {
  return (
    <ScrollArea className="h-full py-6 px-4">
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Getting Started</h4>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/introduction">Introduction</a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/docs/quickstart">Quick Start</a>
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}