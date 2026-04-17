import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { ChecklistsContent } from "@/components/checklists-content"

export default async function ChecklistsPage() {
  const supabase = await createClient()

  const [{ data: templates }, { data: workTypes }] = await Promise.all([
    supabase
      .from("checklist_templates")
      .select("*, work_type:work_types(*), items:checklist_items(*)")
      .order("created_at", { ascending: false }),
    supabase.from("work_types").select("*").order("sort_order"),
  ])

  return (
    <MainLayout>
      <ChecklistsContent 
        templates={templates || []} 
        workTypes={workTypes || []} 
      />
    </MainLayout>
  )
}
