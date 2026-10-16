import React from 'react';
import StatCard from '../common/StatCard.tsx';
import Badge from '../common/Badge.tsx';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters.ts';
import {
  FileSignature,
  Sprout,
  CalendarCheck,
  AlertTriangle,
  ReceiptText,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FarmerDashboardProps {
  stats: any;
  onOpenIssueModal: () => void;
  onOpenHarvestModal: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  stats,
  onOpenIssueModal,
  onOpenHarvestModal,
}) => {
  const metrics = stats?.metrics || {};
  const farmer = stats?.farmerInfo;
  const contracts = stats?.contracts || [];
  const cultivations = stats?.cultivations || [];
  const visits = stats?.visits || [];
  const issues = stats?.issues || [];
  const settlements = stats?.settlements || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white/20 rounded-md">
            Farmer Portal
          </span>
          <h2 className="text-xl font-bold mt-1.5 tracking-tight">
            Namaste, {farmer?.fullName || 'Ramesh Patel'}
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            {farmer?.village}, {farmer?.district}, {farmer?.state} &middot; Land Area: {farmer?.totalLandAreaAcres} Acres
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIssueModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>Report Input Shortage</span>
          </button>
          <button
            onClick={onOpenHarvestModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1b4332] bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Harvest Batch</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Contracts"
          value={metrics.activeContractsCount || 0}
          subtext={`Of ${metrics.totalContracts || 0} total registered`}
          icon={<FileSignature className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Gross Contract Value"
          value={formatCurrency(metrics.totalContractValue)}
          subtext="Guaranteed buyout"
          icon={<ReceiptText className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Received Payments"
          value={formatCurrency(metrics.totalEarned)}
          subtext="Cleared to bank account"
          icon={<ReceiptText className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Pending Payout"
          value={formatCurrency(metrics.pendingPayout)}
          subtext="Under settlement review"
          icon={<ReceiptText className="w-5 h-5 text-amber-700" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Cultivation Tracking */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Active Cultivation Progress</h3>
            <Link to="/cultivation" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {cultivations.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No active cultivation logs found.</p>
            ) : (
              cultivations.map((cl: any) => (
                <div key={cl.cultivationId} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{cl.cropName}</span>
                      <span className="text-stone-500 text-[11px] ml-2">({cl.landAreaAcres} Acres)</span>
                    </div>
                    <Badge status={cl.currentGrowthStage} />
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                      <span>Stage Completion</span>
                      <span className="font-semibold text-stone-800 tabular-nums">{cl.stageProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-300"
                        style={{ width: `${cl.stageProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/70">
                    <span>Sown: {formatDate(cl.sowingDate)}</span>
                    <span>Expected Harvest: {formatDate(cl.expectedHarvestDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Contracts */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Assigned Buyer Contracts</h3>
            <Link to="/contracts" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {contracts.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No contracts assigned yet.</p>
            ) : (
              contracts.slice(0, 3).map((c: any) => (
                <div key={c.contractId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{c.contractId} &middot; {c.cropName}</div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      Buyer: <span className="font-medium text-stone-800">{c.buyerName}</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Target: {formatNumber(c.agreedQuantity)} {c.unitOfMeasurement} @ ₹{c.agreedPricePerUnit}/kg
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={c.contractStatus} />
                    <div className="font-bold text-emerald-900 mt-1 tabular-nums">
                      {formatCurrency(c.grossContractValue)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Field Visits & Input Issues split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Field Visits */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 tracking-tight mb-3">Field Officer Visits</h3>
          <div className="space-y-2.5">
            {visits.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">No visits logged yet.</p>
            ) : (
              visits.slice(0, 3).map((v: any) => (
                <div key={v.visitId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-900">{v.visitType} by {v.fieldOfficerName}</span>
                    <span className="text-[11px] text-stone-400">{formatDate(v.visitDate)}</span>
                  </div>
                  <p className="text-stone-600 text-[11px] italic">"{v.recommendations}"</p>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-2">
                    <span>Health: <strong className="text-emerald-800">{v.cropHealthStatus}</strong></span>
                    <span>Irrigation: <strong className="text-stone-800">{v.irrigationStatus}</strong></span>
                    {v.followUpDate && <span>Follow-up: {formatDate(v.followUpDate)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input Issues */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Agricultural Input Tickets</h3>
            <button onClick={onOpenIssueModal} className="text-xs text-emerald-700 font-semibold hover:underline">
              + New Ticket
            </button>
          </div>
          <div className="space-y-2.5">
            {issues.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">No input shortage tickets logged.</p>
            ) : (
              issues.slice(0, 3).map((i: any) => (
                <div key={i.issueId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-stone-900">{i.inputName} ({i.issueCategory})</span>
                    <Badge status={i.status} />
                  </div>
                  <p className="text-stone-600 text-[11px] line-clamp-2">{i.description}</p>
                  {i.resolutionNotes && (
                    <div className="mt-1.5 p-2 bg-emerald-50/70 border border-emerald-100 rounded text-[11px] text-emerald-900">
                      Officer update: {i.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
