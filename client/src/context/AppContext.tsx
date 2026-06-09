import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DashboardSummary } from '../types';
import { api } from '../services/api';

interface AppContextType {
  dashboard: DashboardSummary | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;
  fetchDashboard: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setDashboardError(message);
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  return (
    <AppContext.Provider
      value={{
        dashboard,
        isDashboardLoading,
        dashboardError,
        fetchDashboard,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
