import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { notFound } from "next/navigation"

interface InspectionChecklistsPageProps {
  params: Promise<{ id: string }>
}

export default async function InspectionChecklistsPage({ params }: InspectionChecklistsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspection } = await supabase
    .from("inspection_requests")
    .select(`
      id,
      title,
      request_number,
      checklists:inspection_checklists(
        *,
        template:checklist_templates(*),
        results:inspection_checklist_results(*)
      )
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
              체크리스트
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {inspection.request_number} - {inspection.title}
            </p>
          </div>
        </div>

        {inspection.checklists && inspection.checklists.length > 0 ? (
          <div className="space-y-4">
            {inspection.checklists.map((checklist: any) => (
              <div key={checklist.id} className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  {checklist.template?.name || "체크리스트"}
                </h3>
                <div className="space-y-2">
                  {checklist.results?.map((result: any) => (
                    <div key={result.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={result.is_checked}
                        readOnly
                        className="size-4"
                      />
                      <span className="text-sm flex-1">{result.item_text}</span>
                      {result.check_result && (
                        <span className="text-xs text-muted-foreground">
                          {result.check_result}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">체크리스트가 없습니다</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}