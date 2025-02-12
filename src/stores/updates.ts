import { create } from 'zustand';

interface UpdatesStore {
  pendingUpdates: number;
  lastUpdateTime: number | null;
  addPendingUpdate: () => void;
  removePendingUpdate: () => void;
}

export const useUpdatesStore = create<UpdatesStore>((set) => ({
  pendingUpdates: 0,
  lastUpdateTime: null,
  addPendingUpdate: () => set((state) => ({ 
    pendingUpdates: state.pendingUpdates + 1,
    lastUpdateTime: Date.now()
  })),
  removePendingUpdate: () => set((state) => ({
    pendingUpdates: Math.max(0, state.pendingUpdates - 1)
  }))
})); 