import { create } from "zustand";

type Product = { id: number; name: string; price: number; category: string; imageUrl?: string };
export type CartItem = Product & { quantity: number };
type Store = { id: string; name: string; products: Product[] };

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
  cart: CartItem[];
  setStores: (stores: Store[]) => void;
  setSelectedStoreId: (id: string | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'storeId'>) => void;
  cancelTransaction: (transactionId: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, amount: number) => void;
  clearCart: () => void;
  // Product management actions
  addProduct: (product: Omit<Product, 'id' | 'imageUrl'> & { imageUrl?: string }) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
}

// 인증 상태와 가맹점 선택 상태를 하나의 스토어에서 관리합니다.
export const useBoundStore = create<AuthState & StoreState>((set, get) => ({
  // --- Auth State ---
  isLoggedIn: true, // 기본적으로 로그인된 상태
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),

  // --- Store State ---
  stores: [
    { id: "gangnam", name: "강남점", products: [
      { id: 1, name: 'HOT 아메리카노', price: 4000, category: '에스프레소' },
      { id: 2, name: 'ICE 아메리카노', price: 4500, category: '에스프레소' },
      { id: 3, name: '카페라떼', price: 5000, category: '에스프레소' },
    ]},
    { id: "jamsil", name: "잠실점", products: [
      { id: 4, name: '바닐라라떼', price: 5000, category: '에스프레소' },
      { id: 5, name: '검은콩스무디', price: 6000, category: '스무디' },
      { id: 6, name: '애플스무디', price: 6000, category: '스무디' },
    ]},
    { id: "hongdae", name: "홍대점", products: [
      { id: 7, name: '자몽스무디', price: 6000, category: '스무디' },
      { id: 8, name: '카모마일티', price: 5000, category: '허브티' },
      { id: 9, name: '카야잼 토스트', price: 4000, category: '베이커리' },
    ]}
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
  cart: [],
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
  // --- Cart Actions ---
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
          item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item // 0이 아닌 1로 수정
        )
        .filter(item => item.quantity > 0),
    });
  },
  clearCart: () => set({ cart: [] }),
  // --- Product Management Actions ---
  addProduct: (product) => {
    const { stores, selectedStoreId } = get();
    const newProduct = { ...product, id: Date.now() };
    set({
      stores: stores.map(store =>
        store.id === selectedStoreId
          ? { ...store, products: [...store.products, newProduct] }
          : store
      ),
    });
  },
  updateProduct: (updatedProduct) => {
    const { stores, selectedStoreId } = get();
    set({
      stores: stores.map(store =>
        store.id === selectedStoreId
          ? {
              ...store,
              products: store.products.map(p =>
                p.id === updatedProduct.id ? updatedProduct : p
              ),
            }
          : store
      ),
    });
  },
  deleteProduct: (productId) => {
    const { stores, selectedStoreId } = get();
    set({
      stores: stores.map(store =>
        store.id === selectedStoreId
          ? {
              ...store,
              products: store.products.filter(p => p.id !== productId),
            }
          : store
      ),
    });
  },
}));
