import React from 'react';
import StatCard from '../common/StatCard.tsx';
import Badge from '../common/Badge.tsx';
import { formatDate } from '../../utils/formatters.ts';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  FileSignature,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfficerDashboardProps {
  stats: any;
  onOpenVisitModal: () => void;
  onOpenHarvestModal: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  stats,
  onOpenVisitModal,
  onOpenHarvestModal,
}) => {
  const metrics = stats?.metrics || {};
  const officer = stats?.officerInfo;
  const assignedFarmers = stats?.assignedFarmers || [];
  const scheduledVisits = stats?.scheduledVisits || [];
  const unresolvedIssues = stats?.unresolvedIssues || [];
  const recentVisits = stats?.recentVisits || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#143224] to-[#2d6a4f] text-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white/20 rounded-md">
            Field Agronomist Console
          </span>
          <h2 className="text-xl font-bold mt-1.5 tracking-tight">
            {officer?.name || 'Dr. Priya Rao'}
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Region: {officer?.assignedRegion} &middot; Officer ID: {officer?.officerId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVisitModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#143224] bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Field Visit</span>
          </button>
          <button
            onClick={onOpenHarvestModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 rounded-lg border border-white/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Verify Harvest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Assigned Farmers"
          value={metrics.assignedFarmersCount || 0}
          subtext="Under active supervision"
          icon={<Users className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Scheduled Inspections"
          value={metrics.scheduledVisitsCount || 0}
          subtext="Pending field verification"
          icon={<CalendarCheck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Completed Visits"
          value={metrics.completedVisitsCount || 0}
          subtext="Reports verified on record"
          icon={<CalendarCheck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Unresolved Issues"
          value={metrics.unresolvedIssuesCount || 0}
          subtext="Shortages / pest alerts"
          icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scheduled Visits */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Upcoming Inspection Schedule</h3>
            <Link to="/field-visits" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {scheduledVisits.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No upcoming visits scheduled.</p>
            ) : (
              scheduledVisits.map((v: any) => (
                <div key={v.visitId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{v.farmerName} &middot; {v.visitType}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Contract: {v.contractId} &middot; Stage: {v.cropGrowthStage}
                    </div>
                    <div className="text-[11px] text-stone-600 italic">Rec: {v.recommendations}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      {formatDate(v.visitDate)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Farmers */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Assigned Farmers In Jurisdiction</h3>
            <Link to="/farmers" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {assignedFarmers.map((f: any) => (
              <div key={f.farmerId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{f.fullName} ({f.farmerId})</div>
                  <div className="text-[11px] text-stone-500">
                    {f.village}, {f.district} &middot; {f.totalLandAreaAcres} Acres
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium">
                    Crops: {f.cropsCultivated?.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <Badge status={f.accountStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
