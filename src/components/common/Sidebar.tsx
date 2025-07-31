// src/components/common/Sidebar.tsx

// 1. useContextStore 훅을 import 합니다.
import { useContextStore } from "@/store/useContextStore";
import { NavLink } from "react-router-dom";
import { MessageSquare, Settings, Library, History, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // shadcn/ui 버튼 추가

// ... (navLinks 배열은 그대로 둡니다)
const navLinks = [
  { to: "/", icon: MessageSquare, text: "채팅" },
  { to: "/settings", icon: Settings, text: "프로젝트 설정" },
  { to: "/profiling-history", icon: Library, text: "프로파일 라이브러리" },
  { to: "/history", icon: History, text: "히스토리" },
];


// 2. ContextDisplay 컴포넌트를 Sidebar 내부에 추가합니다.
function ContextDisplay() {
  // 3. 스토어에서 필요한 상태와 액션을 가져옵니다.
  const { type, projectId, profileId, tableIds, clearContext } = useContextStore();

  if (!type) {
    return (
      <div className="p-4 mt-2 text-sm text-gray-500">
        선택된 컨텍스트 없음
      </div>
    );
  }

  const contextTitle = type === 'profile' ? `프로파일: ${profileId?.substring(0, 8)}...` : `프로젝트 설정`;
  const contextSubtitle = `${projectId}`;

  return (
    <div className="p-4 mt-2 space-y-3">
        <div className="flex justify-between items-center">
            <div>
                <div className="font-semibold text-gray-800 text-sm">{contextTitle}</div>
                <div className="text-xs text-gray-500 truncate" title={contextSubtitle}>{contextSubtitle}</div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearContext}>
                <XCircle className="h-4 w-4 text-red-500" />
            </Button>
        </div>
        <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">테이블 ({tableIds.length})</h4>
            <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {tableIds.map(id => (
                    <li key={id} className="truncate" title={id}>- {id.split('.').pop()}</li>
                ))}
            </ul>
        </div>
    </div>
  );
}


export default function Sidebar() {
  return (
    <aside className="w-[280px] min-w-[280px] border-r bg-gray-50 flex flex-col">
      {/* ... (상단 헤더 부분은 그대로 둡니다) ... */}
      <div className="p-6 border-b">
        <h1 className="text-lg font-semibold">BigQuery AI</h1>
        <p className="text-sm text-gray-500">데이터 분석 도우미</p>
      </div>
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-200 hover:text-black ${
                    isActive ? "!bg-primary text-white hover:!bg-primary/90 hover:!text-white" : ""
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* 4. 기존 컨텍스트 섹션을 새로 만든 ContextDisplay 컴포넌트로 교체합니다. */}
        <div className="mt-8 pt-4 border-t">
             <h3 className="px-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">분석 컨텍스트</h3>
             <ContextDisplay />
        </div>
      </nav>
      <div className="p-4 border-t text-xs text-gray-500">
        &copy; 2024 BigQuery AI Assistant
      </div>
    </aside>
  );
}
