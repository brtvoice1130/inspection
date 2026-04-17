"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ListChecks,
  ChevronDown,
  ChevronRight,
  GripVertical
} from "lucide-react"
import type { ChecklistTemplate, WorkType, ChecklistItem } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface ChecklistsContentProps {
  templates: (ChecklistTemplate & { items?: ChecklistItem[] })[]
  workTypes: WorkType[]
}

export function ChecklistsContent({ templates, workTypes }: ChecklistsContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    work_type_id: "",
    items: [{ item_text: "", is_required: false }] as { item_text: string; is_required: boolean }[]
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTemplates(newExpanded)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      work_type_id: "",
      items: [{ item_text: "", is_required: false }]
    })
    setEditingTemplate(null)
  }

  const openEditDialog = (template: ChecklistTemplate & { items?: ChecklistItem[] }) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || "",
      work_type_id: template.work_type_id,
      items: template.items?.map(item => ({
        item_text: item.item_text,
        is_required: item.is_required
      })) || [{ item_text: "", is_required: false }]
    })
    setIsDialogOpen(true)
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_text: "", is_required: false }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = async () => {
    const supabase = createClient()
    
    startTransition(async () => {
      if (editingTemplate) {
        // Update existing template
        await supabase
          .from("checklist_templates")
          .update({
            name: formData.name,
            description: formData.description || null,
            work_type_id: formData.work_type_id,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingTemplate.id)

        // Delete old items and insert new ones
        await supabase
          .from("checklist_items")
          .delete()
          .eq("template_id", editingTemplate.id)

        const validItems = formData.items.filter(item => item.item_text.trim())
        if (validItems.length > 0) {
          await supabase
            .from("checklist_items")
            .insert(
              validItems.map((item, index) => ({
                template_id: editingTemplate.id,
                item_text: item.item_text,
                is_required: item.is_required,
                sort_order: index + 1
              }))
            )
        }
      } else {
        // Create new template
        const { data: newTemplate } = await supabase
          .from("checklist_templates")
          .insert({
            name: formData.name,
            description: formData.description || null,
            work_type_id: formData.work_type_id,
            is_active: true
          })
          .select()
          .single()

        if (newTemplate) {
          const validItems = formData.items.filter(item => item.item_text.trim())
          if (validItems.length > 0) {
            await supabase
              .from("checklist_items")
              .insert(
                validItems.map((item, index) => ({
                  template_id: newTemplate.id,
                  item_text: item.item_text,
                  is_required: item.is_required,
                  sort_order: index + 1
                }))
              )
          }
        }
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 체크리스트 템플릿을 삭제하시겠습니까?")) return
    
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from("checklist_templates").delete().eq("id", id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            체크리스트 템플릿 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            공종별 체크리스트 템플릿을 생성하고 관리합니다
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              새 템플릿
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "체크리스트 템플릿 수정" : "새 체크리스트 템플릿"}
              </DialogTitle>
              <DialogDescription>
                검측 시 사용할 체크리스트 항목을 정의합니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="work_type">공종 선택</Label>
                <Select 
                  value={formData.work_type_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, work_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="공종을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((wt) => (
                      <SelectItem key={wt.id} value={wt.id}>
                        {wt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">템플릿 이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 철근 배근 검측 체크리스트"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="템플릿에 대한 설명을 입력하세요"
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>체크 항목</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-1 size-3" />
                    항목 추가
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={item.item_text}
                        onChange={(e) => updateItem(index, "item_text", e.target.value)}
                        placeholder={`항목 ${index + 1}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item.is_required}
                          onCheckedChange={(checked) => updateItem(index, "is_required", checked as boolean)}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">필수</span>
                      </div>
                      {formData.items.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || !formData.name || !formData.work_type_id}>
                {isPending ? "저장 중..." : editingTemplate ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListChecks className="size-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              등록된 체크리스트 템플릿이 없습니다
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              공종별 체크리스트 템플릿을 생성하여 검측 요청서 작성 시 활용하세요
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleExpanded(template.id)}
                  >
                    {expandedTemplates.has(template.id) ? (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.work_type?.name && (
                          <Badge variant="outline" className="mr-2">
                            {template.work_type.name}
                          </Badge>
                        )}
                        {template.items?.length || 0}개 항목
                        {template.description && ` | ${template.description}`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => openEditDialog(template)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedTemplates.has(template.id) && template.items && template.items.length > 0 && (
                <CardContent className="pt-0">
                  <div className="rounded-md border border-border">
                    {template.items
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((item, index) => (
                        <div 
                          key={item.id}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            index !== template.items!.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <span className="text-sm text-muted-foreground w-6">
                            {index + 1}.
                          </span>
                          <span className="flex-1 text-sm text-foreground">
                            {item.item_text}
                          </span>
                          {item.is_required && (
                            <Badge variant="secondary" className="text-xs">
                              필수
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
