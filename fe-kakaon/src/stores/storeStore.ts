import { create } from "zustand";

type Store = { id: string; name: string };

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

type Transaction = {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  date: string;
  storeId: string;
  orderType: string;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
};

interface StoreState {
  stores: Store[];
  selectedStoreId: string | null;
  transactions: Transaction[];
  setStores: (stores: Store[]) => void;
  setSelectedStoreId: (id: string | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'storeId'>) => void;
  cancelTransaction: (transactionId: string) => void;
}

// 인증 상태와 가맹점 선택 상태를 하나의 스토어에서 관리합니다.
export const useBoundStore = create<AuthState & StoreState>((set, get) => ({
  // --- Auth State ---
  isLoggedIn: true, // 기본적으로 로그인된 상태
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),

  // --- Store State ---
  stores: [
    { id: "gangnam", name: "강남점" },
    { id: "jamsil", name: "잠실점" },
    { id: "hongdae", name: "홍대점" }
  ],
  selectedStoreId: "gangnam", // 초기 선택값을 첫 번째 가맹점으로 설정
  transactions: [
    {
      id: 'TX-20251030-001',
      items: [{ name: 'HOT 아메리카노', quantity: 2, price: 4000 }],
      total: 8000,
      date: new Date('2025-10-30T14:30:00').toISOString(),
      storeId: 'gangnam',
      orderType: 'store',
      paymentMethod: 'card',
      status: 'completed',
    },
    {
      id: 'TX-20251029-001',
      items: [{ name: '카페라떼', quantity: 1, price: 5000 }, { name: '카야잼 토스트', quantity: 1, price: 4000 }],
      total: 9000,
      date: new Date('2025-10-29T11:20:00').toISOString(),
      storeId: 'jamsil',
      orderType: 'delivery',
      paymentMethod: 'kakaopay',
      status: 'completed',
    },
    {
      id: 'TX-20251028-001',
      items: [{ name: '자몽스무디', quantity: 1, price: 6000 }],
      total: 6000,
      date: new Date('2025-10-28T18:45:00').toISOString(),
      storeId: 'gangnam',
      orderType: 'store',
      paymentMethod: 'cash',
      status: 'cancelled',
    },
  ],
  setStores: (stores) => set({ stores }),
  setSelectedStoreId: (id) => set({ selectedStoreId: id }),
  addTransaction: (transaction) => {
    const { selectedStoreId } = get();
    const newTransaction = {
      ...transaction,
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      storeId: selectedStoreId!,
      status: 'completed' as const,
    };
    set((state) => ({ transactions: [...state.transactions, newTransaction] }));
  },
  cancelTransaction: (transactionId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      ),
    }));
  },
}));
