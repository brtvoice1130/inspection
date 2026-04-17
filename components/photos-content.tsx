"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon } from "lucide-react"
import type { PhotoRecord, InspectionRequest } from "@/lib/types"

interface PhotosContentProps {
  photos: (PhotoRecord & { inspection?: Pick<InspectionRequest, 'id' | 'title' | 'request_number'> })[]
}

export function PhotosContent({ photos }: PhotosContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          사진대지
        </h1>
        <p className="text-muted-foreground mt-1">
          모든 검측 요청서의 사진을 조회합니다
        </p>
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              등록된 사진이 없습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              검측 요청서 작성 시 사진을 첨부하면 여기에 표시됩니다
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <img 
                src={photo.photo_url} 
                alt={photo.caption || "검측 사진"}
                className="w-full h-48 object-cover bg-muted"
              />
              <CardContent className="p-4 space-y-2">
                <p className="font-medium text-foreground line-clamp-1">
                  {photo.caption || "제목 없음"}
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
                {photo.inspection && (
                  <Link 
                    href={`/inspections/${photo.inspection.id}`}
                    className="inline-block"
                  >
                    <Badge variant="outline" className="text-xs hover:bg-accent">
                      {photo.inspection.request_number}
                    </Badge>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
