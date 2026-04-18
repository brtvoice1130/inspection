import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { notFound } from "next/navigation"

interface InspectionPersonnelPageProps {
  params: Promise<{ id: string }>
}

export default async function InspectionPersonnelPage({ params }: InspectionPersonnelPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspection } = await supabase
    .from("inspection_requests")
    .select(`
      id,
      title,
      request_number,
      personnel:personnel_records(*)
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
              실명부
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {inspection.request_number} - {inspection.title}
            </p>
          </div>
        </div>

        {inspection.personnel && inspection.personnel.length > 0 ? (
          <div className="space-y-3">
            {inspection.personnel.map((person: any) => (
              <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{person.name}</p>
                  <p className="text-sm text-muted-foreground">{person.role || "역할 미지정"}</p>
                  {person.company && (
                    <p className="text-xs text-muted-foreground">{person.company}</p>
                  )}
                </div>
                {person.contact_info && (
                  <p className="text-sm text-muted-foreground">{person.contact_info}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">등록된 인원이 없습니다</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}