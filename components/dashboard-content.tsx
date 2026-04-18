"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ClipboardList, 
  FileText, 
  FolderOpen, 
  ListChecks, 
  Plus,
  ArrowRight,
  CheckSquare,
  Camera,
  Users
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { InspectionRequest } from "@/lib/types"

interface DashboardContentProps {
  recentInspections: InspectionRequest[]
  workTypesCount: number
  templatesCount: number
  projectsCount: number
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-destructive/20 text-destructive",
}

const statusLabels: Record<string, string> = {
  draft: "작성중",
  pending: "검토중",
  approved: "승인",
  rejected: "반려",
}

export function DashboardContent({
  recentInspections,
  workTypesCount,
  templatesCount,
  projectsCount,
}: DashboardContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              검측 요청서
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              시공검측 요청서를 관리합니다
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/inspections/new">
              <Plus className="mr-2 size-4" />
              검측요청
            </Link>
          </Button>
        </div>

        {recentInspections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="size-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                작성된 검측 요청서가 없습니다
              </h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                새 검측 요청서를 작성하여 시공 검측을 요청하세요
              </p>
              <Button asChild className="mt-4">
                <Link href="/inspections/new">
                  <Plus className="mr-2 size-4" />
                  첫 요청서 작성하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentInspections.map((inspection) => (
              <Card key={inspection.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">
                            {inspection.request_number}
                          </p>
                          <Badge className={`${statusColors[inspection.status]} text-xs`}>
                            {statusLabels[inspection.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {inspection.work_type?.name || "공종 미지정"} | {inspection.location_detail || "위치 미지정"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          요청자: {inspection.requested_by || "미지정"} | 예정일: {inspection.inspection_date || "미지정"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button asChild variant="ghost" size="sm" className="flex-1 h-8">
                        <Link href={`/inspections/${inspection.id}/checklists`}>
                          <CheckSquare className="mr-1 size-3" />
                          체크리스트
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="flex-1 h-8">
                        <Link href={`/inspections/${inspection.id}/photos`}>
                          <Camera className="mr-1 size-3" />
                          사진대지
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="flex-1 h-8">
                        <Link href={`/inspections/${inspection.id}/personnel`}>
                          <Users className="mr-1 size-3" />
                          실명부
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/inspections">
                전체 목록 보기
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            대시보드
          </h1>
          <p className="text-muted-foreground mt-1">
            시공검측 요청서 관리 시스템에 오신 것을 환영합니다
          </p>
        </div>
        <Button asChild>
          <Link href="/inspections/new">
            <Plus className="mr-2 size-4" />
            새 검측 요청서
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">프로젝트</CardTitle>
            <FolderOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsCount}</div>
            <p className="text-xs text-muted-foreground">등록된 프로젝트</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">공종</CardTitle>
            <ClipboardList className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workTypesCount}</div>
            <p className="text-xs text-muted-foreground">등록된 공종 분류</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">체크리스트 템플릿</CardTitle>
            <ListChecks className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templatesCount}</div>
            <p className="text-xs text-muted-foreground">활성화된 템플릿</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">검측 요청서</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentInspections.length}</div>
            <p className="text-xs text-muted-foreground">최근 요청서</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 검측 요청서</CardTitle>
            <CardDescription>최근 작성된 시공검측 요청서 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="size-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  아직 작성된 검측 요청서가 없습니다
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/inspections/new">
                    <Plus className="mr-2 size-4" />
                    첫 요청서 작성하기
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInspections.map((inspection) => (
                  <Link
                    key={inspection.id}
                    href={`/inspections/${inspection.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{inspection.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {inspection.request_number} | {inspection.work_type?.name || "공종 미지정"}
                      </p>
                    </div>
                    <Badge className={statusColors[inspection.status]}>
                      {statusLabels[inspection.status]}
                    </Badge>
                  </Link>
                ))}
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/inspections">
                    전체 보기
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 시작</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/inspections/new">
                <FileText className="mr-3 size-4" />
                새 검측 요청서 작성
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/checklists">
                <ListChecks className="mr-3 size-4" />
                체크리스트 템플릿 관리
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/work-types">
                <ClipboardList className="mr-3 size-4" />
                공종 분류 관리
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/projects">
                <FolderOpen className="mr-3 size-4" />
                프로젝트 설정
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
