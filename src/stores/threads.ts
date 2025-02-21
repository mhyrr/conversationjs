import { create } from 'zustand';

interface ThreadState {
  expandedThreads: Set<string>;
  recentThreads: Set<string>;
  expandAll: () => void;
  collapseAll: () => void;
  expandThread: (threadTitle: string) => void;
  collapseThread: (threadTitle: string) => void;
  setExpandedThreads: (threads: string[]) => void;
  showNewest: () => void;
}

const getRecentThreads = (): Set<string> => {
  const allThreads = Array.from(document.querySelectorAll('[data-thread-title]'))
    .map(el => ({
      title: el.getAttribute('data-thread-title') || '',
      timestamp: new Date(el.getAttribute('data-latest-timestamp') || '').getTime()
    }))
    .filter(({ timestamp }) => !isNaN(timestamp));

  if (allThreads.length === 0) return new Set();

  const latestTimestamp = Math.max(...allThreads.map(t => t.timestamp));
  const cutoffTime = latestTimestamp - (24 * 60 * 60 * 1000); // 24 hours ago

  return new Set(
    allThreads
      .filter(({ timestamp }) => timestamp >= cutoffTime)
      .map(({ title }) => title)
  );
};

export const useThreadStore = create<ThreadState>((set) => ({
  expandedThreads: new Set<string>(),
  recentThreads: getRecentThreads(),
  expandAll: () => set((state) => {
    const allThreads = document.querySelectorAll('[data-thread-title]');
    const titles = Array.from(allThreads).map(el => el.getAttribute('data-thread-title') || '');
    return { expandedThreads: new Set(titles) };
  }),
  collapseAll: () => set({ expandedThreads: new Set() }),
  expandThread: (threadTitle: string) => set((state) => ({
    expandedThreads: new Set([...state.expandedThreads, threadTitle])
  })),
  collapseThread: (threadTitle: string) => set((state) => {
    const newSet = new Set(state.expandedThreads);
    newSet.delete(threadTitle);
    return { expandedThreads: newSet };
  }),
  setExpandedThreads: (threads: string[]) => set({
    expandedThreads: new Set(threads)
  }),
  showNewest: () => set((state) => {
    const recentThreads = getRecentThreads();
    return { 
      expandedThreads: recentThreads,
      recentThreads 
    };
  })
})); 