import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { NewInspectionForm } from "@/components/new-inspection-form"
import { notFound } from "next/navigation"

interface EditInspectionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditInspectionPage({ params }: EditInspectionPageProps) {
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

  // Only allow editing if status is draft
  if (inspection.status !== "draft") {
    notFound()
  }

  const [{ data: workTypes }, { data: projects }, { data: templates }] = await Promise.all([
    supabase.from("work_types").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("name"),
    supabase
      .from("checklist_templates")
      .select("*, items:checklist_items(*)")
      .eq("is_active", true)
      .order("name"),
  ])

  return (
    <MainLayout>
      <NewInspectionForm
        workTypes={workTypes || []}
        projects={projects || []}
        templates={templates || []}
        inspection={inspection}
        mode="edit"
      />
    </MainLayout>
  )
}