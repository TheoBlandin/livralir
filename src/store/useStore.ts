// store.ts
import { BookOverview } from "@/types/Work";
import { create } from "zustand";

type Store = {
  selectedItem: BookOverview | null;
  setSelectedItem: (item: BookOverview) => void;
};

export const useStore = create<Store>((set) => ({
  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),
}));
