import { create } from "zustand";

type Store = { id: string; name: string };

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

interface StoreState {
  stores: Store[];
  selectedStoreId: string | null;
  setStores: (stores: Store[]) => void;
  setSelectedStoreId: (id: string | null) => void;
}

// 인증 상태와 가맹점 선택 상태를 하나의 스토어에서 관리합니다.
export const useBoundStore = create<AuthState & StoreState>((set) => ({
  // --- Auth State ---
  isLoggedIn: false, // 기본적으로 로그인되지 않은 상태
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),

  // --- Store State ---
  stores: [
    { id: "gangnam", name: "강남점" },
    { id: "jamsil", name: "잠실점" },
    { id: "hongdae", name: "홍대점" }
  ],
  selectedStoreId: "gangnam", // 초기 선택값을 첫 번째 가맹점으로 설정
  setStores: (stores) => set({ stores }),
  setSelectedStoreId: (id) => set({ selectedStoreId: id })
}));
