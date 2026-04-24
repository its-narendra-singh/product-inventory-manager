import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsApi } from '../services/dashboard.service';

export const DASHBOARD_KEY = 'dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_KEY],
    queryFn: getDashboardStatsApi,
  });
}
