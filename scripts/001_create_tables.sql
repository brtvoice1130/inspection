-- 시공검측 요청서 시스템 데이터베이스 스키마

-- 1. 공종 분류 테이블 (건축 공종)
CREATE TABLE IF NOT EXISTS work_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES work_types(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 체크리스트 템플릿 테이블
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_type_id UUID REFERENCES work_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 체크리스트 항목 템플릿 테이블
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES checklist_templates(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  client_name TEXT,
  contractor_name TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 시공검측 요청서 테이블
CREATE TABLE IF NOT EXISTS inspection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  work_type_id UUID REFERENCES work_types(id),
  title TEXT NOT NULL,
  location_detail TEXT,
  inspection_date DATE,
  requested_by TEXT,
  contractor_supervisor TEXT,
  site_manager TEXT,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 검측 요청서 체크리스트 (실제 체크 결과)
CREATE TABLE IF NOT EXISTS inspection_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspection_requests(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 검측 체크리스트 항목 결과
CREATE TABLE IF NOT EXISTS inspection_checklist_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_checklist_id UUID REFERENCES inspection_checklists(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  check_result TEXT,
  remarks TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 사진대지 테이블
CREATE TABLE IF NOT EXISTS photo_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspection_requests(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photo_date DATE,
  location_info TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 실명부 테이블 (참여 인원)
CREATE TABLE IF NOT EXISTS personnel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspection_requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  role TEXT,
  phone TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 첨부파일 테이블
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspection_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  attachment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
