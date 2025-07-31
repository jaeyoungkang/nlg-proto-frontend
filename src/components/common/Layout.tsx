// src/components/common/Layout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* 페이지 컴포넌트가 여기에 렌더링됩니다 */}
      </main>
    </div>
  );
}