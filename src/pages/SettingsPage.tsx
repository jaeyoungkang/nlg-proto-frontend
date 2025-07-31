// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { getGcpProjects, getProjectTables, type GcpProject, type BigQueryTable } from '@/services/api';
import { useContextStore } from '@/store/useContextStore';

// shadcn/ui 컴포넌트 임포트
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw } from 'lucide-react';

// 테이블 데이터를 데이터셋별로 그룹화하는 헬퍼 함수
const groupTablesByDataset = (tables: BigQueryTable[]) => {
  return tables.reduce((acc, table) => {
    const { dataset_id } = table;
    if (!acc[dataset_id]) {
      acc[dataset_id] = [];
    }
    acc[dataset_id].push(table);
    return acc;
  }, {} as Record<string, BigQueryTable[]>);
};

export default function SettingsPage() {
  // Zustand 스토어에서 상태와 액션 가져오기
  const { projectId: currentProjectId, tableIds: currentTableIds, setSettings } = useContextStore();

  // 컴포넌트 내부 상태
  const [projects, setProjects] = useState<GcpProject[]>([]);
  const [tables, setTables] = useState<BigQueryTable[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(currentProjectId);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(currentTableIds);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // 컴포넌트가 처음 마운트될 때 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  // 선택된 프로젝트가 변경되면 테이블 목록 로드
  useEffect(() => {
    if (selectedProjectId) {
      loadTables(selectedProjectId);
    } else {
      setTables([]);
      setSelectedTableIds([]);
    }
  }, [selectedProjectId]);

  // 프로젝트 로드 함수
  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const gcpProjects = await getGcpProjects();
      setProjects(gcpProjects);
    } catch (error) {
      console.error(error);
      // TODO: 사용자에게 에러 알림 표시
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // 테이블 로드 함수
  const loadTables = async (projectId: string) => {
    setIsLoadingTables(true);
    setTables([]);
    try {
      const projectTables = await getProjectTables(projectId);
      setTables(projectTables);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingTables(false);
    }
  };
  
  // 테이블 선택/해제 핸들러
  const handleTableSelect = (tableId: string, checked: boolean) => {
    setSelectedTableIds(prev =>
      checked ? [...prev, tableId] : prev.filter(id => id !== tableId)
    );
  };

  // 설정 저장 핸들러
  const handleSaveSettings = () => {
    if (selectedProjectId) {
      setSettings(selectedProjectId, selectedTableIds);
      alert('설정이 저장되었습니다!'); // TODO: shadcn/ui의 Toast 컴포넌트로 교체 예정
    }
  };

  const groupedTables = groupTablesByDataset(tables);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">프로젝트 설정 및 프로파일링</h1>
        <p className="text-gray-600 mt-2">GCP 프로젝트와 테이블을 선택하여 분석을 시작하세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. 프로젝트 설정</CardTitle>
          <CardDescription>분석할 BigQuery 프로젝트와 테이블을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 프로젝트 선택 */}
          <div className="space-y-2">
            <label className="font-medium">GCP Project</label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedProjectId || ''}
                onValueChange={setSelectedProjectId}
                disabled={isLoadingProjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트를 선택하세요..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.project_id} value={p.project_id}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadProjects} disabled={isLoadingProjects}>
                <RefreshCw className={`h-4 w-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* 테이블 선택 */}
          <div className="space-y-2">
             <label className="font-medium">BigQuery Tables</label>
             <div className="border rounded-md max-h-80 overflow-y-auto">
                {isLoadingTables ? (
                    <p className="p-6 text-center text-gray-500">테이블 로딩 중...</p>
                ) : tables.length > 0 ? (
                    Object.entries(groupedTables).map(([datasetId, tablesInDataset]) => (
                        <div key={datasetId}>
                            <h3 className="font-semibold bg-gray-50 p-3 border-b">📁 {datasetId}</h3>
                            <ul className="divide-y">
                                {tablesInDataset.map(table => (
                                    <li key={table.table_id} className="flex items-center p-3 space-x-3">
                                        <Checkbox
                                            id={table.table_id}
                                            checked={selectedTableIds.includes(table.table_id)}
                                            onCheckedChange={(checked) => handleTableSelect(table.table_id, !!checked)}
                                        />
                                        <label htmlFor={table.table_id} className="text-sm font-medium leading-none cursor-pointer">
                                            {table.table_name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="p-6 text-center text-gray-500">
                        {selectedProjectId ? '테이블이 없습니다.' : '프로젝트를 먼저 선택하세요.'}
                    </p>
                )}
             </div>
             <p className="text-sm text-gray-500 pt-1">선택된 테이블: {selectedTableIds.length}개</p>
          </div>
          
          {/* 저장 버튼 */}
          <div className="flex justify-end">
             <Button onClick={handleSaveSettings} disabled={!selectedProjectId || selectedTableIds.length === 0}>
                설정 저장
             </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* TODO: 2. 프로파일링 섹션 (다음 단계에서 구현) */}
    </div>
  );
}