// src/hooks/useChat.ts
import { useState } from 'react';
import { quickQuery, analyzeContext, type AnalyzeContextPayload } from '@/services/api';
import { useContextStore } from '@/store/useContextStore';

// 메시지 타입을 정의합니다.
export interface Message {
  id: number;
  isUser: boolean;
  text: string;
  type: 'text' | 'loading' | 'data_result' | 'error';
  // 데이터 결과에 대한 추가 분석을 위한 컨텍스트
  analysisContext?: Omit<AnalyzeContextPayload, 'analysis_type'>;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { projectId, tableIds } = useContextStore.getState();

  const addMessage = (message: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const sendMessage = async (question: string) => {
    if (!projectId || tableIds.length === 0) {
      addMessage({ isUser: false, text: '분석을 시작하려면 먼저 프로젝트 설정을 완료해주세요.', type: 'error' });
      return;
    }

    setIsLoading(true);
    addMessage({ isUser: true, text: question, type: 'text' });
    const loadingMsgId = Date.now();
    addMessage({ isUser: false, text: '분석 중...', type: 'loading', id: loadingMsgId });

    try {
      const result = await quickQuery(question, projectId, tableIds);

      if (!result.success) {
        throw new Error(result.error);
      }

      let content = `### 💾 생성된 SQL\n\`\`\`sql\n${result.generated_sql}\n\`\`\`\n\n### 📊 결과 (${result.row_count}개 행)\n`;
      if (result.data && result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          content += `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n`;
          result.data.slice(0, 10).forEach(row => {
              const values = headers.map(h => String(row[h]).replace(/\|/g, '\\|'));
              content += `| ${values.join(' | ')} |\n`;
          });
          if (result.data.length > 10) content += `\n*... 상위 10개 행만 표시됩니다.*`;
      } else {
          content += "결과 데이터가 없습니다.";
      }

      setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
      addMessage({ 
        isUser: false, 
        text: content, 
        type: 'data_result',
        analysisContext: {
            question: result.original_question,
            sql_query: result.generated_sql,
            query_results: result.data,
            project_id: projectId,
            table_ids: tableIds,
        }
      });

    } catch (error: any) {
      setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
      addMessage({ isUser: false, text: `**❌ 오류 발생:**\n${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const requestAnalysis = async (payload: AnalyzeContextPayload) => {
    setIsLoading(true);
    const loadingMsgId = Date.now();
    addMessage({ isUser: false, text: '추가 분석 중...', type: 'loading', id: loadingMsgId });

    try {
        const result = await analyzeContext(payload);
        if (!result.success) throw new Error(result.error);
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        addMessage({ isUser: false, text: result.analysis, type: 'text' });
    } catch (error: any) {
        setMessages(prev => prev.filter(m => m.id !== loadingMsgId));
        addMessage({ isUser: false, text: `**❌ 분석 오류:**\n${error.message}`, type: 'error' });
    } finally {
        setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, requestAnalysis };
};
