"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  FileText,
  ListChecks,
  ImageIcon,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Building,
  User
} from "lucide-react"
import type { InspectionRequest, InspectionChecklist, InspectionChecklistResult, PhotoRecord, PersonnelRecord } from "@/lib/types"

interface InspectionDetailProps {
  inspection: InspectionRequest & {
    checklists?: (InspectionChecklist & { results?: InspectionChecklistResult[] })[]
    photos?: PhotoRecord[]
    personnel?: PersonnelRecord[]
  }
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

export function InspectionDetail({ inspection }: InspectionDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/inspections">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {inspection.title}
              </h1>
              <Badge className={statusColors[inspection.status]}>
                {statusLabels[inspection.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              요청번호: {inspection.request_number}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {inspection.status === "draft" && (
            <Button asChild>
              <Link href={`/inspections/${inspection.id}/edit`}>
                수정
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="mr-2 size-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <ListChecks className="mr-2 size-4" />
            체크리스트
          </TabsTrigger>
          <TabsTrigger value="photos">
            <ImageIcon className="mr-2 size-4" />
            사진대지
          </TabsTrigger>
          <TabsTrigger value="personnel">
            <Users className="mr-2 size-4" />
            실명부
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">프로젝트</p>
                    <p className="font-medium">{inspection.project?.name || "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <ListChecks className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">공종</p>
                    <p className="font-medium">{inspection.work_type?.name || "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">상세 위치</p>
                    <p className="font-medium">{inspection.location_detail || "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">검측 예정일</p>
                    <p className="font-medium">{inspection.inspection_date || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>담당자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">요청자</p>
                    <p className="font-medium">{inspection.requested_by || "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">시공사 감독</p>
                    <p className="font-medium">{inspection.contractor_supervisor || "-"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">현장 소장</p>
                    <p className="font-medium">{inspection.site_manager || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {inspection.notes && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>비고</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{inspection.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>체크리스트 결과</CardTitle>
              <CardDescription>검측 체크리스트 확인 결과</CardDescription>
            </CardHeader>
            <CardContent>
              {!inspection.checklists || inspection.checklists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ListChecks className="size-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    등록된 체크리스트가 없습니다
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {inspection.checklists.map((checklist) => (
                    <div key={checklist.id} className="space-y-4">
                      <h4 className="font-semibold text-foreground border-b border-border pb-2">
                        {checklist.template?.name || "체크리스트"}
                      </h4>
                      <div className="space-y-2">
                        {checklist.results
                          ?.sort((a, b) => a.sort_order - b.sort_order)
                          .map((result, index) => (
                            <div 
                              key={result.id}
                              className="flex items-start gap-4 rounded-lg border border-border p-4"
                            >
                              {result.is_checked ? (
                                <CheckCircle2 className="size-5 text-success mt-0.5" />
                              ) : (
                                <XCircle className="size-5 text-muted-foreground mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-foreground">
                                  {index + 1}. {result.item_text}
                                </p>
                                {result.remarks && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    비고: {result.remarks}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사진대지</CardTitle>
              <CardDescription>검측 관련 사진 자료</CardDescription>
            </CardHeader>
            <CardContent>
              {!inspection.photos || inspection.photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="size-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    등록된 사진이 없습니다
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inspection.photos
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((photo, index) => (
                      <div key={photo.id} className="rounded-lg border border-border overflow-hidden">
                        <img 
                          src={photo.photo_url} 
                          alt={photo.caption || `사진 ${index + 1}`}
                          className="w-full h-48 object-cover bg-muted"
                        />
                        <div className="p-3 space-y-1">
                          <p className="font-medium text-foreground">
                            {photo.caption || `사진 ${index + 1}`}
                          </p>
                          {photo.location_info && (
                            <p className="text-sm text-muted-foreground">
                              위치: {photo.location_info}
                            </p>
                          )}
                          {photo.photo_date && (
                            <p className="text-sm text-muted-foreground">
                              촬영일: {photo.photo_date}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>실명부</CardTitle>
              <CardDescription>검측 참여 인원 명단</CardDescription>
            </CardHeader>
            <CardContent>
              {!inspection.personnel || inspection.personnel.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="size-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    등록된 참여 인원이 없습니다
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">이름</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">소속</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">직위</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">역할</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">연락처</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspection.personnel.map((person) => (
                        <tr key={person.id} className="border-b border-border">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {person.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {person.company || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {person.position || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {person.role && (
                              <Badge variant="outline">{person.role}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {person.phone || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
