import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import type { Lease } from '../types/lease.js';
import type { LeaseSummary } from '../components/LeaseSummaryCard';

interface LeaseStoreState {
  leases: Lease[];
  loading: boolean;
  error: string | null;
  selectedSummary: LeaseSummary | null;
  summaryLoading: boolean;
  summaryError: string | null;
  fetchLeases: () => Promise<void>;
  removeLease: (leaseId: number) => Promise<void>;
  fetchLeaseSummary: (leaseId: number) => Promise<void>;
  reset: () => void;
}

const initialState = {
  leases: [],
  loading: false,
  error: null,
  selectedSummary: null,
  summaryLoading: false,
  summaryError: null,
};

export const useLeaseStore = create<LeaseStoreState>((set) => ({
  ...initialState,

  fetchLeases: async (): Promise<void> => {
    const token = useAuthStore.getState().token ?? localStorage.getItem('token');

    set({ loading: true, error: null });
    try {
      const res: Response = await fetch('/api/lease', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data: any = await res.json();

      if (!res.ok || !data?.leases) {
        set({
          error: data?.error ?? 'Failed to load leases.',
          leases: [],
          loading: false,
        });
        return;
      }
      set({ leases: data.leases, loading: false });
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading leases.',
        leases: [],
        loading: false,
      });
    }
  },

  removeLease: async (leaseId: number): Promise<void> => {
    const token: string | null = useAuthStore.getState().token ?? localStorage.getItem('token');

    set({ loading: true, error: null });
    try {
      const res: Response = await fetch(`/api/lease/${leaseId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        set({
          error: data?.error ?? 'Failed to delete lease.',
          loading: false,
        });
        return;
      }
      set((state: LeaseStoreState): { leases: Lease[]; loading: false } => ({
        leases: state.leases.filter((l) => l.id !== leaseId),
        loading: false,
      }));
    } catch (err: unknown) {
      set({
        error:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while deleting the lease.',
        loading: false,
      });
    }
  },

  fetchLeaseSummary: async (leaseId: number): Promise<void> => {
    const token: string | null = useAuthStore.getState().token ?? localStorage.getItem('token');

    set({ summaryLoading: true, summaryError: null, selectedSummary: null });
    try {
      const res: Response = await fetch(`/api/lease/${leaseId}/summary`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data: any = await res.json();

      if (!res.ok || !data?.summary) {
        set({
          summaryError: data?.error ?? 'Failed to fetch summary.',
          summaryLoading: false,
          selectedSummary: null,
        });
        return;
      }
      set({
        selectedSummary: data.summary,
        summaryLoading: false,
        summaryError: null,
      });
    } catch (err: unknown) {
      set({
        summaryError:
          err instanceof Error
            ? err.message
            : 'Unexpected error fetching summary.',
        summaryLoading: false,
        selectedSummary: null,
      });
    }
  },

  reset: (): void => set({ ...initialState }),
}));
