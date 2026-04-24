import api from '../api/axios';

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
}

export async function getDashboardStatsApi(): Promise<DashboardStats> {
  const { data } = await api.get<{ data: DashboardStats }>('/api/dashboard/stats');
  return data.data;
}
