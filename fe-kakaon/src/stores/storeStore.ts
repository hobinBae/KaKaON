import { create } from "zustand";
import { CartItem, Menu, Transaction } from "@/types/api";

// Zustand 스토어의 상태(state)와 액션(action)에 대한 인터페이스를 정의했음
interface AppState {
  // --- Transaction State ---
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'storeId'>) => void;
  cancelTransaction: (transactionId: string) => void;

  // --- Auth State ---
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // --- UI State ---
  selectedStoreId: string | null;
  setSelectedStoreId: (id: string | null) => void;

  // --- Cart State ---
  cart: CartItem[];
  addToCart: (item: Menu) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, amount: number) => void;
  clearCart: () => void;
}

// Zustand 스토어를 생성했음
// API 연동을 위해 서버 데이터(stores, transactions, products)는 제거하고,
// 순수 클라이언트 상태(인증, UI, 장바구니)만 남겼음
export const useBoundStore = create<AppState>((set, get) => ({
  // --- Transaction State ---
  transactions: [], // 초기 거래 내역은 비워둠 (API로 가져올 예정)
  addTransaction: (newTransaction) => {
    const { selectedStoreId } = get();
    const transaction: Transaction = {
      ...newTransaction,
      id: `tran_${Date.now()}`,
      date: new Date().toISOString(),
      storeId: selectedStoreId!,
    };
    set((state) => ({ transactions: [...state.transactions, transaction] }));
  },
  cancelTransaction: (transactionId) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === transactionId ? { ...t, status: 'cancelled' } : t
      ),
    }));
  },

  // --- Auth State ---
  isLoggedIn: false, // 기본적으로 로그아웃된 상태로 변경했음
  login: () => set({ isLoggedIn: true }),
  logout: () => {
    // 로그아웃 시 관련 상태 초기화 로직을 추가했음
    set({ isLoggedIn: false, selectedStoreId: null, cart: [], transactions: [] });
  },

  // --- UI State ---
  selectedStoreId: null,
  setSelectedStoreId: (id) => set({ selectedStoreId: id }),

  // --- Cart State ---
  cart: [],
  addToCart: (product) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, quantity: 1 }] });
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId, amount) => {
    set({
      cart: get()
        .cart.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
        )
        .filter(item => item.quantity > 0),
    });
  },
  clearCart: () => set({ cart: [] }),
}));
