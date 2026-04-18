"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { InspectionRequest } from "@/lib/types"

interface MobileMainContentProps {
  recentInspections: InspectionRequest[]
  workTypesCount: number
  templatesCount: number
  projectsCount: number
}

export function MobileMainContent({ recentInspections }: MobileMainContentProps) {
  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            모바일 메인
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            검측 요청서 목록을 확인하고 필요한 항목을 추가하세요.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/inspections/new">
            + 작성
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {recentInspections.map((inspection) => (
          <Card key={inspection.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {inspection.title || inspection.request_number}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {inspection.request_number} | {inspection.work_type?.name || "공종 미지정"}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {inspection.status}
                </span>
              </div>
            </CardContent>
            <CardContent className="grid grid-cols-3 gap-2 border-t p-3">
              <Button asChild variant="ghost" className="h-12 rounded-lg">
                <Link href={`/inspections/${inspection.id}/checklists`}>
                  <span className="text-2xl">📋</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 rounded-lg">
                <Link href={`/inspections/${inspection.id}/photos`}>
                  <span className="text-2xl">📷</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 rounded-lg">
                <Link href={`/inspections/${inspection.id}/personnel`}>
                  <span className="text-2xl">👥</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
