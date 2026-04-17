import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { PersonnelContent } from "@/components/personnel-content"

export default async function PersonnelPage() {
  const supabase = await createClient()

  const { data: personnel } = await supabase
    .from("personnel_records")
    .select("*, inspection:inspection_requests(id, title, request_number)")
    .order("created_at", { ascending: false })

  return (
    <MainLayout>
      <PersonnelContent personnel={personnel || []} />
    </MainLayout>
  )
}
