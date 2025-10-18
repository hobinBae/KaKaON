import { create } from "zustand";

type Store = { id: string; name: string };

interface StoreState {
  stores: Store[];
  selectedStoreId: string | null;
  setStores: (stores: Store[]) => void;
  setSelectedStoreId: (id: string | null) => void;
}

export const useStoreSelection = create<StoreState>((set) => ({
  stores: [
    { id: "gangnam", name: "강남점" },
    { id: "jamsil", name: "잠실점" },
    { id: "hongdae", name: "홍대점" }
  ],
  selectedStoreId: null,
  setStores: (stores) => set({ stores }),
  setSelectedStoreId: (id) => set({ selectedStoreId: id })
}));
