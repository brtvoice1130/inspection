"use client"

import { AppSidebar } from "./app-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 pl-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
