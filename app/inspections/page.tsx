import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { InspectionsContent } from "@/components/inspections-content"

export default async function InspectionsPage() {
  const supabase = await createClient()

  const { data: inspections } = await supabase
    .from("inspection_requests")
    .select("*, work_type:work_types(*), project:projects(*)")
    .order("created_at", { ascending: false })

  return (
    <MainLayout>
      <InspectionsContent inspections={inspections || []} />
    </MainLayout>
  )
}
