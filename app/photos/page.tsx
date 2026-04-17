import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { PhotosContent } from "@/components/photos-content"

export default async function PhotosPage() {
  const supabase = await createClient()

  const { data: photos } = await supabase
    .from("photo_records")
    .select("*, inspection:inspection_requests(id, title, request_number)")
    .order("created_at", { ascending: false })

  return (
    <MainLayout>
      <PhotosContent photos={photos || []} />
    </MainLayout>
  )
}
