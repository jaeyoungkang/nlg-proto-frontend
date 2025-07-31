// src/store/useContextStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 스토어에서 관리할 상태의 타입을 정의합니다.
interface ContextState {
  type: 'settings' | 'profile' | null;
  projectId: string | null;
  tableIds: string[];
  profileId: string | null;
}

// 스토어의 액션(상태를 변경하는 함수) 타입을 정의합니다.
interface ContextActions {
  setSettings: (projectId: string, tableIds: string[]) => void;
  selectProfile: (profileId: string, projectId: string, tableIds: string[]) => void;
  clearContext: () => void;
}

// 초기 상태
const initialState: ContextState = {
  type: null,
  projectId: null,
  tableIds: [],
  profileId: null,
};

// Zustand 스토어를 생성합니다.
export const useContextStore = create<ContextState & ContextActions>()(
  // persist 미들웨어를 사용하여 상태를 localStorage에 자동으로 저장하고 복원합니다.
  persist(
    (set) => ({
      ...initialState,

      // 프로젝트 설정을 컨텍스트로 지정하는 액션
      setSettings: (projectId, tableIds) => set({
        type: 'settings',
        projectId,
        tableIds,
        profileId: null, // 설정 기반 컨텍스트에서는 프로파일 ID를 초기화합니다.
      }),

      // 프로파일을 컨텍스트로 선택하는 액션
      selectProfile: (profileId, projectId, tableIds) => set({
        type: 'profile',
        projectId,
        tableIds,
        profileId,
      }),

      // 컨텍스트를 초기화하는 액션
      clearContext: () => set(initialState),
    }),
    {
      name: 'bigquery-ai-context', // localStorage에 저장될 키 이름
    }
  )
);