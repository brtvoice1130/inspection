"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { DashboardContent } from "@/components/dashboard-content"
import { MobileMainContent } from "@/components/mobile-main-content"
import type { InspectionRequest } from "@/lib/types"

interface RootMainPageProps {
  recentInspections: InspectionRequest[]
  workTypesCount: number
  templatesCount: number
  projectsCount: number
}

export function RootMainPage(props: RootMainPageProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileMainContent {...props} />
  }

  return <DashboardContent {...props} />
}
