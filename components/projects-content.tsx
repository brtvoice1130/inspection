"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
import type { Project } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface ProjectsContentProps {
  projects: Project[]
}

export function ProjectsContent({ projects }: ProjectsContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    client_name: "",
    contractor_name: "",
    start_date: "",
    end_date: "",
  })

  const resetForm = () => {
    setFormData({ name: "", location: "", client_name: "", contractor_name: "", start_date: "", end_date: "" })
    setEditingProject(null)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      location: project.location || "",
      client_name: project.client_name || "",
      contractor_name: project.contractor_name || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    
    startTransition(async () => {
      if (editingProject) {
        await supabase
          .from("projects")
          .update({
            name: formData.name,
            location: formData.location || null,
            client_name: formData.client_name || null,
            contractor_name: formData.contractor_name || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingProject.id)
      } else {
        await supabase
          .from("projects")
          .insert({
            name: formData.name,
            location: formData.location || null,
            client_name: formData.client_name || null,
            contractor_name: formData.contractor_name || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          })
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 프로젝트를 삭제하시겠습니까? 관련된 검측 요청서도 함께 삭제됩니다.")) return
    
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from("projects").delete().eq("id", id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            프로젝트 설정
          </h1>
          <p className="text-muted-foreground mt-1">
            프로젝트(현장) 정보를 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              새 프로젝트
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "프로젝트 수정" : "새 프로젝트 추가"}
              </DialogTitle>
              <DialogDescription>
                프로젝트 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">프로젝트명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: OO아파트 신축공사"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">현장 위치</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="예: 서울시 강남구 역삼동"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_name">발주처</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="발주처명"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor_name">시공사</Label>
                  <Input
                    id="contractor_name"
                    value={formData.contractor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractor_name: e.target.value }))}
                    placeholder="시공사명"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">착공일</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">준공 예정일</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || !formData.name}>
                {isPending ? "저장 중..." : editingProject ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              등록된 프로젝트가 없습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              프로젝트를 추가하여 검측 요청서를 체계적으로 관리하세요
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>프로젝트명</TableHead>
                <TableHead>현장 위치</TableHead>
                <TableHead>발주처</TableHead>
                <TableHead>시공사</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="w-[100px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.location || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.client_name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.contractor_name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {project.start_date && project.end_date 
                      ? `${project.start_date} ~ ${project.end_date}`
                      : project.start_date || project.end_date || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => openEditDialog(project)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => handleDelete(project.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
