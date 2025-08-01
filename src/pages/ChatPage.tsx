// src/pages/ChatPage.tsx
import { useState, useRef, useEffect } from 'react';
import { useChat, type Message } from '@/hooks/useChat';
import { useContextStore } from '@/store/useContextStore';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, BrainCircuit, FileCode, Search, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


// 메시지 렌더링 컴포넌트
const MessageBubble = ({ msg, onAnalysisRequest }: { msg: Message, onAnalysisRequest: (payload: any) => void }) => {
    const AnalysisMenu = () => {
        if (!msg.analysisContext) return null;
        const context = msg.analysisContext;

        const menuItems = [
            { text: '결과 해설', type: 'explanation', icon: BrainCircuit },
            { text: '컨텍스트 연계', type: 'context', icon: FileCode },
            { text: '추가 분석 제안', type: 'suggestion', icon: Sparkles }
        ];

        return (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <h4 className="text-xs font-semibold mb-2 text-gray-600 flex items-center gap-2"><Search className="h-4 w-4"/> 추가 분석</h4>
                <div className="flex flex-wrap gap-2">
                    {menuItems.map(item => (
                        <Button key={item.type} variant="outline" size="sm" onClick={() => onAnalysisRequest({ ...context, analysis_type: item.type })}>
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.text}
                        </Button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex items-start gap-4 ${msg.isUser ? 'justify-end' : ''}`}>
            {!msg.isUser && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center"><Bot /></div>}
            <div className={`max-w-2xl ${msg.isUser ? 'order-1' : 'order-2'}`}>
                <Card className={msg.isUser ? 'bg-primary text-white' : ''}>
                    <CardContent className="p-4 text-sm">
                        {msg.type === 'loading' ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></div>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-pre:bg-gray-800 prose-pre:text-white prose-table:border">
                              <ReactMarkdown>
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {msg.type === 'data_result' && <AnalysisMenu />}
            </div>
            {msg.isUser && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><User /></div>}
        </div>
    );
};

// 채팅 페이지 메인 컴포넌트
export default function ChatPage() {
  const { type: contextType } = useContextStore();
  const { messages, isLoading, sendMessage, requestAnalysis } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!contextType) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold">분석을 시작해보세요</h2>
            <p className="mt-2 text-gray-600">
                <Link to="/settings" className="text-primary hover:underline font-semibold">설정 페이지</Link>에서 분석할 프로젝트와 테이블을 선택해주세요.
            </p>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-4 -mr-4">
        <div className="space-y-6">
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} onAnalysisRequest={requestAnalysis} />)}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="데이터에 대해 질문해보세요..."
            className="pr-16"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}