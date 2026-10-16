import React from 'react';
import StatCard from '../common/StatCard.tsx';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters.ts';
import {
  Users,
  Building2,
  UserCheck,
  FileSignature,
  Sprout,
  AlertTriangle,
  CalendarCheck,
  Truck,
  ReceiptText,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  stats: any;
  onOpenContractModal: () => void;
  onOpenHarvestModal: () => void;
  onOpenDeliveryModal: () => void;
  onOpenSettlementModal: () => void;
}

const COLORS = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onOpenContractModal,
  onOpenHarvestModal,
  onOpenDeliveryModal,
  onOpenSettlementModal,
}) => {
  const metrics = stats?.metrics || {};
  const charts = stats?.charts || {};
  const recentActivities = stats?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#143224] to-[#2d6a4f] text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-white/15 rounded-md border border-white/20">
            Platform Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 tracking-tight">
            National Contract Farming Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 leading-relaxed">
            Monitor real-time agricultural contracts, field officer inspections, crop harvests, deliveries, and transparent banking settlements.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={onOpenContractModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#143224] bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Contract</span>
            </button>
            <button
              onClick={onOpenHarvestModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 rounded-lg border border-white/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Harvest</span>
            </button>
            <button
              onClick={onOpenDeliveryModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 rounded-lg border border-white/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Delivery</span>
            </button>
            <button
              onClick={onOpenSettlementModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 rounded-lg border border-white/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Prepare Settlement</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/farm_hero_field_1791919035593.jpg"
            alt="Field background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Primary KPI Grid (10 Core Metrics as requested) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Farmers"
          value={metrics.totalFarmers || 0}
          subtext="Verified producers"
          icon={<Users className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Total Buyers"
          value={metrics.totalBuyers || 0}
          subtext="Corporate procurers"
          icon={<Building2 className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Field Officers"
          value={metrics.totalOfficers || 0}
          subtext="Regional agronomists"
          icon={<UserCheck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Active Contracts"
          value={metrics.activeContractsCount || 0}
          subtext={`Of ${metrics.totalContracts || 0} total registered`}
          icon={<FileSignature className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Crops Cultivated"
          value={metrics.cropsCount || 0}
          subtext="Catalog varieties"
          icon={<Sprout className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Field Visits Done"
          value={metrics.completedVisits || 0}
          subtext={`${metrics.scheduledVisits || 0} scheduled`}
          icon={<CalendarCheck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Pending Issues"
          value={metrics.pendingIssues || 0}
          subtext="Shortage / pest alerts"
          icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
        />
        <StatCard
          title="Pending Deliveries"
          value={metrics.pendingDeliveries || 0}
          subtext="In transit / scheduled"
          icon={<Truck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Gross Valuation"
          value={formatCurrency(metrics.totalGrossContractValue)}
          subtext="Under binding contract"
          icon={<ReceiptText className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Outstanding Dues"
          value={formatCurrency(metrics.outstandingSettlementsTotal)}
          subtext={`${formatCurrency(metrics.paidSettlementsTotal)} settled`}
          icon={<ReceiptText className="w-5 h-5 text-rose-700" />}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Contract Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Contract Status Distribution</h3>
              <p className="text-[11px] text-stone-500">Breakdown of contracts across lifecycle stages</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.contractStatusChart || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  label={((entry: any) => `${entry.name || entry.status || ''}: ${entry.value || entry.count || ''}`) as any}
                  labelLine={false}
                >
                  {(charts.contractStatusChart || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} contracts`, 'Count']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Crop-wise Contracted Quantity */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Crop-wise Contracted Quantity</h3>
              <p className="text-[11px] text-stone-500">Agreed procurement volume by crop type (kg)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.cropQuantityChart || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v > 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip
                  formatter={(val: any) => [`${formatNumber(val)} kg`, 'Contracted']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                />
                <Bar dataKey="quantity" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Harvest Performance */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight">Harvest Quality Performance</h3>
              <p className="text-[11px] text-stone-500">Actual harvested vs accepted clean produce (kg)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyHarvestChart || []} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v > 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${formatNumber(val)} kg`, name === 'actual' ? 'Actual Yield' : 'Accepted']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="actual" name="Actual Yield" fill="#74c69d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted" name="Accepted Produce" fill="#1b4332" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery & Settlement Settlement Health */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">Fulfillment &amp; Settlement Progress</h3>
                <p className="text-[11px] text-stone-500">Aggregate delivery rate and payment reconciliation</p>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                  <span>Physical Produce Delivery Progress</span>
                  <span className="tabular-nums text-emerald-800">
                    {metrics.deliveryProgress?.percentage || 0}% Completed
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, metrics.deliveryProgress?.percentage || 0)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>Delivered: {formatNumber(metrics.deliveryProgress?.totalDelivered)} kg</span>
                  <span>Total Target: {formatNumber(metrics.deliveryProgress?.totalAgreed)} kg</span>
                </div>
              </div>

              {/* Settlement Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1.5">
                  <span>Financial Settlement Payouts</span>
                  <span className="tabular-nums text-teal-800">
                    {metrics.totalNetPayable > 0
                      ? Math.round((metrics.paidSettlementsTotal / metrics.totalNetPayable) * 100)
                      : 0}% Disbursed
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className="h-full bg-teal-700 transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalNetPayable > 0
                          ? Math.min(100, Math.round((metrics.paidSettlementsTotal / metrics.totalNetPayable) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>Disbursed: {formatCurrency(metrics.paidSettlementsTotal)}</span>
                  <span>Net Payable: {formatCurrency(metrics.totalNetPayable)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="mt-5 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
            <span>Outstanding Balance across all settlements:</span>
            <span className="font-bold text-rose-700 tabular-nums text-sm">
              {formatCurrency(metrics.outstandingSettlementsTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 tracking-tight mb-3">Live Operational Activity Log</h3>
        <div className="divide-y divide-stone-100">
          {recentActivities.map((act: any, idx: number) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    act.type === 'payment'
                      ? 'bg-emerald-100 text-emerald-800'
                      : act.type === 'delivery'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {act.type === 'payment' ? (
                    <ReceiptText className="w-3.5 h-3.5" />
                  ) : act.type === 'delivery' ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : (
                    <CalendarCheck className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-stone-900">{act.title}</div>
                  <div className="text-[11px] text-stone-500">{act.subtitle}</div>
                </div>
              </div>
              <div className="text-[11px] text-stone-400 whitespace-nowrap">
                {formatDate(act.date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
