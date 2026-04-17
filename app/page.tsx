import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: recentInspections },
    { data: workTypes },
    { data: templates },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("inspection_requests")
      .select("*, work_type:work_types(*), project:projects(*)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("work_types").select("*").order("sort_order"),
    supabase.from("checklist_templates").select("*").eq("is_active", true),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
  ])

  return (
    <MainLayout>
      <DashboardContent
        recentInspections={recentInspections || []}
        workTypesCount={workTypes?.length || 0}
        templatesCount={templates?.length || 0}
        projectsCount={projects?.length || 0}
      />
    </MainLayout>
  )
}
