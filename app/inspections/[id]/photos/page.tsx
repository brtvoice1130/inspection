import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { notFound } from "next/navigation"
import Image from "next/image"

interface InspectionPhotosPageProps {
  params: Promise<{ id: string }>
}

export default async function InspectionPhotosPage({ params }: InspectionPhotosPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspection } = await supabase
    .from("inspection_requests")
    .select(`
      id,
      title,
      request_number,
      photos:photo_records(*)
    `)
    .eq("id", id)
    .single()

  if (!inspection) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              사진대지
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {inspection.request_number} - {inspection.title}
            </p>
          </div>
        </div>

        {inspection.photos && inspection.photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {inspection.photos.map((photo: any) => (
              <div key={photo.id} className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || "사진"}
                    fill
                    className="object-cover"
                  />
                </div>
                {photo.caption && (
                  <p className="text-sm text-muted-foreground">{photo.caption}</p>
                )}
                {photo.photo_date && (
                  <p className="text-xs text-muted-foreground">
                    촬영일: {new Date(photo.photo_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">등록된 사진이 없습니다</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}