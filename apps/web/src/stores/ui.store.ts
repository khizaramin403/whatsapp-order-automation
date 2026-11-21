import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderFilter = "all" | "cod" | "online";

export interface UIState {
  sidebarOpen: boolean;
  soundOn: boolean;
  filter: OrderFilter;
  selectedOrderId: string | null;
  mobileOpen: boolean;
  newOrdersCount: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSound: () => void;
  setFilter: (filter: OrderFilter) => void;
  setSelectedOrderId: (id: string | null) => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  setNewOrdersCount: (count: number) => void;
  incrementNewOrdersCount: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      soundOn: true,
      filter: "all",
      selectedOrderId: null,
      mobileOpen: false,
      newOrdersCount: 6,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
      setFilter: (filter) => set({ filter }),
      setSelectedOrderId: (selectedOrderId) => set({ selectedOrderId }),
      setMobileOpen: (mobileOpen) => set({ mobileOpen }),
      toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
      setNewOrdersCount: (newOrdersCount) => set({ newOrdersCount }),
      incrementNewOrdersCount: () =>
        set((state) => ({ newOrdersCount: state.newOrdersCount + 1 })),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      })),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        soundOn: state.soundOn,
      }),
    }
  )
);
