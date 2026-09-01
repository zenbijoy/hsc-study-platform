import { create } from 'zustand';

type ReaderState = {
  page: number;
  totalPages: number;
  dark: boolean;
  setPage: (page: number) => void;
  setTotalPages: (value: number) => void;
  toggleDark: () => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  page: 1,
  totalPages: 1,
  dark: false,
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  toggleDark: () => set((s) => ({ dark: !s.dark })),
}));
