import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { InspectionDetail } from "@/components/inspection-detail"
import { notFound } from "next/navigation"

interface InspectionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InspectionDetailPage({ params }: InspectionDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspection } = await supabase
    .from("inspection_requests")
    .select(`
      *,
      work_type:work_types(*),
      project:projects(*),
      checklists:inspection_checklists(
        *,
        template:checklist_templates(*),
        results:inspection_checklist_results(*)
      ),
      photos:photo_records(*),
      personnel:personnel_records(*),
      attachments:attachments(*)
    `)
    .eq("id", id)
    .single()

  if (!inspection) {
    notFound()
  }

  return (
    <MainLayout>
      <InspectionDetail inspection={inspection} />
    </MainLayout>
  )
}
