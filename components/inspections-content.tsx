"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Plus, FileText, Eye } from "lucide-react"
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

      {inspections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-16 text-muted-foreground/50" />
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
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">요청번호</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>공종</TableHead>
                <TableHead>프로젝트</TableHead>
                <TableHead>검측일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[80px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-mono text-sm">
                    {inspection.request_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {inspection.title}
                  </TableCell>
                  <TableCell>
                    {inspection.work_type?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {inspection.project?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {inspection.inspection_date || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[inspection.status]}>
                      {statusLabels[inspection.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link href={`/inspections/${inspection.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
