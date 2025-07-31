// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';
import { getAllLogs, type HistoryLog } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function HistoryPage() {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const data = await getAllLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load logs", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  if (isLoading) return <div>전체 로그를 불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">히스토리</h1>
        <p className="text-gray-600 mt-2">시스템에서 발생한 모든 로그 목록입니다.</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>타임스탬프</TableHead>
            <TableHead>세션 ID</TableHead>
            <TableHead>로그 타입</TableHead>
            <TableHead>메시지</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.timestamp).toLocaleString('ko-KR')}</TableCell>
              <TableCell className="font-mono text-xs">{log.session_id}</TableCell>
              <TableCell><Badge variant="secondary">{log.log_type}</Badge></TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
