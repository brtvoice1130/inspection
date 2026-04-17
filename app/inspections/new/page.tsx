import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { NewInspectionForm } from "@/components/new-inspection-form"

export default async function NewInspectionPage() {
  const supabase = await createClient()

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
      />
    </MainLayout>
  )
}
