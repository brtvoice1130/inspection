import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { WorkTypesContent } from "@/components/work-types-content"

export default async function WorkTypesPage() {
  const supabase = await createClient()

  const { data: workTypes } = await supabase
    .from("work_types")
    .select("*")
    .order("sort_order")

  return (
    <MainLayout>
      <WorkTypesContent workTypes={workTypes || []} />
    </MainLayout>
  )
}
