import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout';
import { Skeleton } from '../components/ui/Skeleton';
import { useDashboardStats } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: 'blue' | 'green' | 'amber';
  icon: string;
}

const accentClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
};

function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  const cls = accentClasses[accent];
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${cls.value}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className={`rounded-lg p-2.5 text-xl ${cls.icon}`}>{icon}</span>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

function LowStockBar({ lowStockCount, totalProducts }: { lowStockCount: number; totalProducts: number }) {
  const pct = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const barColor = pct >= 50 ? 'bg-red-500' : pct >= 25 ? 'bg-amber-400' : 'bg-green-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-medium text-gray-700 mb-4">Inventory health</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Low stock ratio</span>
          <span className="font-medium text-gray-900">{lowStockCount} / {totalProducts} products</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span className={pct >= 50 ? 'text-red-500 font-medium' : ''}>
            {pct}% low or out of stock
          </span>
          <span>100%</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> Healthy (&lt;25%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Warning (25–50%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Critical (&gt;50%)
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboardStats();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {user?.name ? `Welcome, ${user.name}` : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your inventory.</p>
        </div>

        {/* Stat cards */}
        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to load dashboard stats. Please refresh the page.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Total products"
                  value={String(data!.totalProducts)}
                  sub="across all categories"
                  accent="blue"
                  icon="📦"
                />
                <StatCard
                  label="Inventory value"
                  value={`$${data!.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  sub="price × stock"
                  accent="green"
                  icon="💰"
                />
                <StatCard
                  label="Low stock items"
                  value={String(data!.lowStockCount)}
                  sub="stock ≤ 10 units"
                  accent="amber"
                  icon="⚠️"
                />
              </>
            )}
          </div>
        )}

        {/* Inventory health bar */}
        {!isLoading && !isError && data && (
          <LowStockBar
            lowStockCount={data.lowStockCount}
            totalProducts={data.totalProducts}
          />
        )}

        {/* Quick actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              + Add product
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View all products
            </Link>
            <Link
              to="/products?inStock=false"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              View out-of-stock
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
