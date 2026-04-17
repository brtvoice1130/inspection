import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/main-layout"
import { ProjectsContent } from "@/components/projects-content"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <MainLayout>
      <ProjectsContent projects={projects || []} />
    </MainLayout>
  )
}
