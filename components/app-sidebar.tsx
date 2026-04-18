"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  FileText,
  FolderOpen,
  ImageIcon,
  ListChecks,
  Settings,
  Smartphone,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "대시보드",
    href: "/",
    icon: FolderOpen,
  },
  {
    name: "검측 요청서",
    href: "/inspections",
    icon: FileText,
  },
  {
    name: "체크리스트 관리",
    href: "/checklists",
    icon: ListChecks,
  },
  {
    name: "공종 관리",
    href: "/work-types",
    icon: ClipboardList,
  },
  {
    name: "사진대지",
    href: "/photos",
    icon: ImageIcon,
  },
  {
    name: "실명부",
    href: "/personnel",
    icon: Users,
  },
  {
    name: "프로젝트 설정",
    href: "/projects",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <ClipboardList className="size-6 text-primary" />
        <span className="text-lg font-semibold text-sidebar-foreground">
          시공검측 시스템
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Smartphone className="size-4" />
          모바일 메인
        </Link>
        <p className="text-xs text-sidebar-foreground/50">
          v1.0.0
        </p>
      </div>
    </aside>
  )
}
