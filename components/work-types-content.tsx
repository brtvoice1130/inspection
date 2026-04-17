"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-react"
import type { WorkType } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface WorkTypesContentProps {
  workTypes: WorkType[]
}

export function WorkTypesContent({ workTypes }: WorkTypesContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingWorkType(null)
  }

  const openEditDialog = (workType: WorkType) => {
    setEditingWorkType(workType)
    setFormData({
      name: workType.name,
      description: workType.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    
    startTransition(async () => {
      if (editingWorkType) {
        await supabase
          .from("work_types")
          .update({
            name: formData.name,
            description: formData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingWorkType.id)
      } else {
        const maxSortOrder = Math.max(...workTypes.map(w => w.sort_order), 0)
        await supabase
          .from("work_types")
          .insert({
            name: formData.name,
            description: formData.description || null,
            sort_order: maxSortOrder + 1
          })
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 공종을 삭제하시겠습니까? 관련된 체크리스트 템플릿도 함께 삭제됩니다.")) return
    
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from("work_types").delete().eq("id", id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            공종 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            건축 공종 분류를 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              새 공종
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWorkType ? "공종 수정" : "새 공종 추가"}
              </DialogTitle>
              <DialogDescription>
                공종 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">공종명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 철근공사"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="공종에 대한 설명"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || !formData.name}>
                {isPending ? "저장 중..." : editingWorkType ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {workTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              등록된 공종이 없습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              공종을 추가하여 체크리스트 템플릿과 검측 요청서에서 활용하세요
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">순서</TableHead>
                <TableHead>공종명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead className="w-[100px]">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workTypes.map((workType) => (
                <TableRow key={workType.id}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {workType.sort_order}
                  </TableCell>
                  <TableCell className="font-medium">
                    {workType.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {workType.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => openEditDialog(workType)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => handleDelete(workType.id)}
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
