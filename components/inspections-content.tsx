"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Eye, Search } from "lucide-react"
import type { InspectionRequest } from "@/lib/types"

interface InspectionsContentProps {
  inspections: InspectionRequest[]
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

export function InspectionsContent({ inspections }: InspectionsContentProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInspections = inspections.filter((inspection) =>
    inspection.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.work_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.location_detail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspection_date?.includes(searchTerm) ||
    statusLabels[inspection.status].toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            검측 요청서
          </h1>
          <p className="text-muted-foreground mt-1">
            시공검측 요청서를 조회하고 관리합니다
          </p>
        </div>
        <Button asChild>
          <Link href="/inspections/new">
            <Plus className="mr-2 size-4" />
            새 검측 요청서
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="검축요청 번호, 공종, 상세 위치, 요청자, 검측 예정일, 진행상태로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredInspections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {searchTerm ? "검색 결과가 없습니다" : "작성된 검측 요청서가 없습니다"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              {searchTerm
                ? "다른 검색어로 시도해보세요"
                : "새 검측 요청서를 작성하여 시공 검측을 요청하세요"
              }
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/inspections/new">
                  <Plus className="mr-2 size-4" />
                  첫 요청서 작성하기
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {inspection.request_number}
                  </CardTitle>
                  <Badge className={statusColors[inspection.status]}>
                    {statusLabels[inspection.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">공종</p>
                  <p className="text-sm">{inspection.work_type?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">상세 위치</p>
                  <p className="text-sm">{inspection.location_detail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">요청자</p>
                  <p className="text-sm">{inspection.requested_by || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">검측 예정일</p>
                  <p className="text-sm">{inspection.inspection_date || "-"}</p>
                </div>
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/inspections/${inspection.id}`}>
                      <Eye className="mr-2 size-4" />
                      상세보기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
