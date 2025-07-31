// src/services/api.ts

// API 응답 타입 정의
export interface GcpProject {
  project_id: string;
  display_name: string;
}

export interface BigQueryTable {
  table_id: string;
  project_id: string;
  dataset_id: string;
  table_name: string;
}

const API_BASE_URL = 'http://127.0.0.1:8080/api'; // 로컬 Flask 서버 주소

// GCP 프로젝트 목록 가져오기
export async function getGcpProjects(): Promise<GcpProject[]> {
  const response = await fetch(`${API_BASE_URL}/gcp-projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch GCP projects');
  }
  const data = await response.json();
  return data.projects || [];
}

// 특정 프로젝트의 테이블 목록 가져오기
export async function getProjectTables(projectId: string): Promise<BigQueryTable[]> {
  const response = await fetch(`${API_BASE_URL}/gcp-projects/${projectId}/tables`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tables for project ${projectId}`);
  }
  const data = await response.json();
  return data.tables || [];
}

// API 응답 타입 추가
export interface QuickQueryResult {
  success: boolean;
  original_question: string;
  generated_sql: string;
  data: Record<string, any>[];
  row_count: number;
  error?: string;
}

export interface AnalyzeContextPayload {
  question: string;
  sql_query: string;
  query_results: Record<string, any>[];
  project_id: string;
  table_ids: string[];
  analysis_type: 'explanation' | 'context' | 'suggestion';
}

export interface AnalyzeContextResult {
    success: boolean;
    analysis: string;
    error?: string;
}

// 빠른 조회 API 호출
export async function quickQuery(question: string, projectId: string, tableIds: string[]): Promise<QuickQueryResult> {
  const response = await fetch(`${API_BASE_URL}/quick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, project_id: projectId, table_ids: tableIds }),
  });
  // 응답이 ok가 아니더라도, 백엔드에서 {success: false, error: ...} 형태로 에러를 반환하므로 일단 json으로 파싱합니다.
  const data = await response.json();
  if (!response.ok && data.success === undefined) {
      throw new Error(data.error || 'An unknown error occurred during quick query.');
  }
  return data;
}

// 컨텍스트 분석 API 호출
export async function analyzeContext(payload: AnalyzeContextPayload): Promise<AnalyzeContextResult> {
    const response = await fetch(`${API_BASE_URL}/analyze-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred during context analysis.');
    }
    return data;
}

// API 응답 타입 추가
export interface Profile {
  id: string;
  project_id: string;
  table_ids: string[];
  status: '완료' | '실패' | '진행 중';
  start_time: string;
  end_time?: string;
  quality_score?: number;
}

export interface ProfileDetail extends Profile {
    profiling_report: {
        sections: Record<string, string>;
        full_report: string;
    }
}

export interface HistoryLog {
    id: string;
    session_id: string;
    timestamp: string;
    log_type: string;
    message: string;
}

// 프로파일 목록 가져오기
export async function getProfiles(): Promise<Profile[]> {
  const response = await fetch(`${API_BASE_URL}/logs`);
  if (!response.ok) throw new Error('Failed to fetch profiles');
  return response.json();
}

// 특정 프로파일 상세 정보 가져오기
export async function getProfileDetail(sessionId: string): Promise<ProfileDetail> {
    const response = await fetch(`${API_BASE_URL}/logs/${sessionId}`);
    if (!response.ok) throw new Error('Failed to fetch profile details');
    return response.json();
}

// 전체 로그(히스토리) 가져오기
export async function getAllLogs(): Promise<HistoryLog[]> {
    const response = await fetch(`${API_BASE_URL}/all-logs`);
    if (!response.ok) throw new Error('Failed to fetch all logs');
    return response.json();
}