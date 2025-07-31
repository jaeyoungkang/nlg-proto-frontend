// src/pages/ProfilingHistoryPage.tsx
import { useState, useEffect } from 'react';
import { getProfiles, getProfileDetail, type Profile, type ProfileDetail } from '@/services/api';
import { useContextStore } from '@/store/useContextStore';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle } from 'lucide-react';

export default function ProfilingHistoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectProfile, profileId: currentProfileId } = useContextStore();

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch (error) {
        console.error("Failed to load profiles", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const handleViewDetail = async (profileId: string) => {
    try {
        const detail = await getProfileDetail(profileId);
        setSelectedProfile(detail);
    } catch (error) {
        console.error("Failed to load profile detail", error);
    }
  };
  
  const handleSelectProfile = (profile: Profile) => {
    selectProfile(profile.id, profile.project_id, profile.table_ids);
    alert(`${profile.id.substring(0,8)}... 프로파일이 선택되었습니다.`);
  };

  if (isLoading) return <div>프로파일 목록을 불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">프로파일 라이브러리</h1>
        <p className="text-gray-600 mt-2">생성된 프로파일 목록을 확인하고 분석에 활용할 프로파일을 선택하세요.</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>프로젝트 ID</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>테이블 수</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id} className={currentProfileId === profile.id ? 'bg-blue-50' : ''}>
              <TableCell className="font-medium">{profile.project_id}</TableCell>
              <TableCell>
                <Badge variant={profile.status === '완료' ? 'default' : 'destructive'}>{profile.status}</Badge>
              </TableCell>
              <TableCell>{profile.table_ids.length}개</TableCell>
              <TableCell>{new Date(profile.start_time).toLocaleString('ko-KR')}</TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetail(profile.id)}>
                      <Eye className="h-4 w-4 mr-2" />상세 보기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>프로파일 상세: {selectedProfile?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto p-1">
                      {selectedProfile?.profiling_report?.full_report ? (
                        <ReactMarkdown className="prose prose-sm max-w-none">
                            {selectedProfile.profiling_report.full_report}
                        </ReactMarkdown>
                      ) : "리포트 내용이 없습니다."}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" onClick={() => handleSelectProfile(profile)} disabled={profile.status !== '완료'}>
                  <CheckCircle className="h-4 w-4 mr-2" />선택
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
