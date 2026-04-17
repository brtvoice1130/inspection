"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Save, 
  FileText,
  ListChecks,
  ImageIcon,
  Users,
  Plus,
  Trash2,
  Upload
} from "lucide-react"
import type { WorkType, Project, ChecklistTemplate, ChecklistItem } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface NewInspectionFormProps {
  workTypes: WorkType[]
  projects: Project[]
  templates: (ChecklistTemplate & { items?: ChecklistItem[] })[]
}

interface PersonnelEntry {
  name: string
  company: string
  position: string
  role: string
  phone: string
}

interface PhotoEntry {
  file: File | null
  caption: string
  location_info: string
  preview?: string
}

export function NewInspectionForm({ workTypes, projects, templates }: NewInspectionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("basic")
  
  const [formData, setFormData] = useState({
    project_id: "",
    work_type_id: "",
    title: "",
    location_detail: "",
    inspection_date: "",
    requested_by: "",
    contractor_supervisor: "",
    site_manager: "",
    notes: "",
  })

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [checklistResults, setChecklistResults] = useState<Record<string, Record<string, { checked: boolean; remarks: string }>>>({})
  
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>([
    { name: "", company: "", position: "", role: "시공사", phone: "" }
  ])

  const [photos, setPhotos] = useState<PhotoEntry[]>([])

  // Filter templates by selected work type
  const filteredTemplates = templates.filter(t => 
    !formData.work_type_id || t.work_type_id === formData.work_type_id
  )

  // Generate request number
  const generateRequestNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `ITR-${year}${month}${day}-${random}`
  }

  // Initialize checklist results when templates are selected
  useEffect(() => {
    const newResults: Record<string, Record<string, { checked: boolean; remarks: string }>> = {}
    selectedTemplates.forEach(templateId => {
      const template = templates.find(t => t.id === templateId)
      if (template?.items) {
        newResults[templateId] = {}
        template.items.forEach(item => {
          newResults[templateId][item.id] = checklistResults[templateId]?.[item.id] || { 
            checked: false, 
            remarks: "" 
          }
        })
      }
    })
    setChecklistResults(newResults)
  }, [selectedTemplates, templates])

  const addPersonnel = () => {
    setPersonnel([...personnel, { name: "", company: "", position: "", role: "", phone: "" }])
  }

  const removePersonnel = (index: number) => {
    setPersonnel(personnel.filter((_, i) => i !== index))
  }

  const updatePersonnel = (index: number, field: keyof PersonnelEntry, value: string) => {
    setPersonnel(personnel.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos(prev => [...prev, {
            file,
            caption: "",
            location_info: "",
            preview: reader.result as string
          }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const updatePhoto = (index: number, field: keyof PhotoEntry, value: string) => {
    setPhotos(photos.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const handleSubmit = async (status: "draft" | "pending") => {
    const supabase = createClient()
    
    startTransition(async () => {
      // 1. Create inspection request
      const requestNumber = generateRequestNumber()
      const { data: inspection, error: inspectionError } = await supabase
        .from("inspection_requests")
        .insert({
          ...formData,
          request_number: requestNumber,
          status,
          project_id: formData.project_id || null,
          work_type_id: formData.work_type_id || null,
        })
        .select()
        .single()

      if (inspectionError || !inspection) {
        alert("검측 요청서 생성에 실패했습니다.")
        return
      }

      // 2. Create checklist results
      for (const templateId of selectedTemplates) {
        const { data: checklist } = await supabase
          .from("inspection_checklists")
          .insert({
            inspection_id: inspection.id,
            template_id: templateId
          })
          .select()
          .single()

        if (checklist) {
          const template = templates.find(t => t.id === templateId)
          if (template?.items) {
            const results = template.items.map((item, index) => ({
              inspection_checklist_id: checklist.id,
              item_text: item.item_text,
              is_checked: checklistResults[templateId]?.[item.id]?.checked || false,
              remarks: checklistResults[templateId]?.[item.id]?.remarks || null,
              sort_order: index + 1
            }))
            await supabase.from("inspection_checklist_results").insert(results)
          }
        }
      }

      // 3. Create personnel records
      const validPersonnel = personnel.filter(p => p.name.trim())
      if (validPersonnel.length > 0) {
        await supabase.from("personnel_records").insert(
          validPersonnel.map(p => ({
            inspection_id: inspection.id,
            name: p.name,
            company: p.company || null,
            position: p.position || null,
            role: p.role || null,
            phone: p.phone || null
          }))
        )
      }

      // 4. Handle photos (simplified - using placeholder URLs)
      if (photos.length > 0) {
        const photoRecords = photos.map((photo, index) => ({
          inspection_id: inspection.id,
          photo_url: photo.preview || "/placeholder.jpg",
          caption: photo.caption || null,
          location_info: photo.location_info || null,
          sort_order: index + 1,
          photo_date: formData.inspection_date || null
        }))
        await supabase.from("photo_records").insert(photoRecords)
      }

      router.push(`/inspections/${inspection.id}`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/inspections">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              새 검측 요청서
            </h1>
            <p className="text-muted-foreground mt-1">
              시공검측 요청서를 작성합니다
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit("draft")} 
            disabled={isPending || !formData.title}
          >
            <Save className="mr-2 size-4" />
            임시저장
          </Button>
          <Button 
            onClick={() => handleSubmit("pending")} 
            disabled={isPending || !formData.title}
          >
            <FileText className="mr-2 size-4" />
            {isPending ? "제출 중..." : "검측 요청"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">
            <FileText className="mr-2 size-4" />
            기본정보
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <ListChecks className="mr-2 size-4" />
            체크리스트
          </TabsTrigger>
          <TabsTrigger value="photos">
            <ImageIcon className="mr-2 size-4" />
            사진대지
          </TabsTrigger>
          <TabsTrigger value="personnel">
            <Users className="mr-2 size-4" />
            실명부
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>검측 요청서의 기본 정보를 입력합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project">프로젝트</Label>
                  <Select 
                    value={formData.project_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="프로젝트 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_type">공종</Label>
                  <Select 
                    value={formData.work_type_id} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, work_type_id: value }))
                      setSelectedTemplates([])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="공종 선택" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">검측 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 지하 1층 기초 철근 배근 검측"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location_detail">상세 위치</Label>
                  <Input
                    id="location_detail"
                    value={formData.location_detail}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_detail: e.target.value }))}
                    placeholder="예: A동 지하1층 기초"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspection_date">검측 예정일</Label>
                  <Input
                    id="inspection_date"
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspection_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="requested_by">요청자</Label>
                  <Input
                    id="requested_by"
                    value={formData.requested_by}
                    onChange={(e) => setFormData(prev => ({ ...prev, requested_by: e.target.value }))}
                    placeholder="요청자 이름"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractor_supervisor">시공사 감독</Label>
                  <Input
                    id="contractor_supervisor"
                    value={formData.contractor_supervisor}
                    onChange={(e) => setFormData(prev => ({ ...prev, contractor_supervisor: e.target.value }))}
                    placeholder="시공사 감독 이름"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_manager">현장 소장</Label>
                  <Input
                    id="site_manager"
                    value={formData.site_manager}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_manager: e.target.value }))}
                    placeholder="현장 소장 이름"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">비고</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="추가 메모사항"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>체크리스트</CardTitle>
              <CardDescription>
                사용할 체크리스트 템플릿을 선택하고 검사 결과를 기록합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>체크리스트 템플릿 선택</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">
                      {formData.work_type_id 
                        ? "선택한 공종에 해당하는 체크리스트 템플릿이 없습니다" 
                        : "공종을 먼저 선택해주세요"}
                    </p>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-4"
                      >
                        <Checkbox
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTemplates([...selectedTemplates, template.id])
                            } else {
                              setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium text-foreground">{template.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {template.items?.length || 0}개 항목
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedTemplates.length > 0 && (
                <div className="space-y-6">
                  {selectedTemplates.map(templateId => {
                    const template = templates.find(t => t.id === templateId)
                    if (!template) return null
                    return (
                      <div key={templateId} className="space-y-4">
                        <h4 className="font-semibold text-foreground border-b border-border pb-2">
                          {template.name}
                        </h4>
                        <div className="space-y-3">
                          {template.items
                            ?.sort((a, b) => a.sort_order - b.sort_order)
                            .map((item, index) => (
                              <div 
                                key={item.id}
                                className="flex items-start gap-4 rounded-lg border border-border p-4"
                              >
                                <Checkbox
                                  checked={checklistResults[templateId]?.[item.id]?.checked || false}
                                  onCheckedChange={(checked) => {
                                    setChecklistResults(prev => ({
                                      ...prev,
                                      [templateId]: {
                                        ...prev[templateId],
                                        [item.id]: {
                                          ...prev[templateId]?.[item.id],
                                          checked: checked as boolean
                                        }
                                      }
                                    }))
                                  }}
                                />
                                <div className="flex-1 space-y-2">
                                  <p className="font-medium text-foreground">
                                    {index + 1}. {item.item_text}
                                    {item.is_required && (
                                      <span className="ml-2 text-destructive">*</span>
                                    )}
                                  </p>
                                  <Input
                                    placeholder="비고"
                                    value={checklistResults[templateId]?.[item.id]?.remarks || ""}
                                    onChange={(e) => {
                                      setChecklistResults(prev => ({
                                        ...prev,
                                        [templateId]: {
                                          ...prev[templateId],
                                          [item.id]: {
                                            ...prev[templateId]?.[item.id],
                                            remarks: e.target.value
                                          }
                                        }
                                      }))
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>사진대지</CardTitle>
              <CardDescription>
                검측 관련 사진을 첨부하고 설명을 입력합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="size-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      클릭하여 사진 업로드 또는 드래그 앤 드롭
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative rounded-lg border border-border overflow-hidden">
                      {photo.preview && (
                        <img 
                          src={photo.preview} 
                          alt={`사진 ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-3 space-y-2">
                        <Input
                          placeholder="사진 설명"
                          value={photo.caption}
                          onChange={(e) => updatePhoto(index, "caption", e.target.value)}
                        />
                        <Input
                          placeholder="촬영 위치"
                          value={photo.location_info}
                          onChange={(e) => updatePhoto(index, "location_info", e.target.value)}
                        />
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="w-full"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>실명부</CardTitle>
                  <CardDescription>
                    검측 참여 인원 정보를 입력합니다
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addPersonnel}>
                  <Plus className="mr-2 size-4" />
                  인원 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personnel.map((person, index) => (
                  <div 
                    key={index} 
                    className="grid gap-4 md:grid-cols-6 items-end rounded-lg border border-border p-4"
                  >
                    <div className="space-y-2">
                      <Label>이름</Label>
                      <Input
                        value={person.name}
                        onChange={(e) => updatePersonnel(index, "name", e.target.value)}
                        placeholder="이름"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>소속</Label>
                      <Input
                        value={person.company}
                        onChange={(e) => updatePersonnel(index, "company", e.target.value)}
                        placeholder="회사명"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>직위</Label>
                      <Input
                        value={person.position}
                        onChange={(e) => updatePersonnel(index, "position", e.target.value)}
                        placeholder="직위"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>역할</Label>
                      <Select 
                        value={person.role} 
                        onValueChange={(value) => updatePersonnel(index, "role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="역할" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="시공사">시공사</SelectItem>
                          <SelectItem value="감리">감리</SelectItem>
                          <SelectItem value="발주처">발주처</SelectItem>
                          <SelectItem value="협력사">협력사</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>연락처</Label>
                      <Input
                        value={person.phone}
                        onChange={(e) => updatePersonnel(index, "phone", e.target.value)}
                        placeholder="010-0000-0000"
                      />
                    </div>
                    <div>
                      {personnel.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removePersonnel(index)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
