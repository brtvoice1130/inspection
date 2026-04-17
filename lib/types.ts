// 시공검측 요청서 시스템 타입 정의

export interface WorkType {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ChecklistTemplate {
  id: string
  work_type_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  work_type?: WorkType
  items?: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  template_id: string
  item_text: string
  sort_order: number
  is_required: boolean
  created_at: string
}

export interface Project {
  id: string
  name: string
  location: string | null
  client_name: string | null
  contractor_name: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface InspectionRequest {
  id: string
  project_id: string
  request_number: string
  work_type_id: string
  title: string
  location_detail: string | null
  inspection_date: string | null
  requested_by: string | null
  contractor_supervisor: string | null
  site_manager: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
  project?: Project
  work_type?: WorkType
  checklists?: InspectionChecklist[]
  photos?: PhotoRecord[]
  personnel?: PersonnelRecord[]
  attachments?: Attachment[]
}

export interface InspectionChecklist {
  id: string
  inspection_id: string
  template_id: string
  created_at: string
  template?: ChecklistTemplate
  results?: InspectionChecklistResult[]
}

export interface InspectionChecklistResult {
  id: string
  inspection_checklist_id: string
  item_text: string
  is_checked: boolean
  check_result: string | null
  remarks: string | null
  sort_order: number
  created_at: string
}

export interface PhotoRecord {
  id: string
  inspection_id: string
  photo_url: string
  caption: string | null
  photo_date: string | null
  location_info: string | null
  sort_order: number
  created_at: string
}

export interface PersonnelRecord {
  id: string
  inspection_id: string
  name: string
  company: string | null
  position: string | null
  role: string | null
  phone: string | null
  signature_url: string | null
  created_at: string
}

export interface Attachment {
  id: string
  inspection_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  attachment_type: string | null
  created_at: string
}
