import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { FieldVisit } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import VisitFormModal from '../components/visits/VisitFormModal.tsx';
import { formatDate } from '../utils/formatters.ts';
import { CalendarCheck, Search, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const FieldVisitsPage: React.FC = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [overdueOnly, setOverdueOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await api.visits.getAll({
        search,
        status: statusFilter,
        overdueOnly: overdueOnly ? 'true' : 'false',
      });
      setVisits(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [search, statusFilter, overdueOnly]);

  const canCreate = user?.role === 'admin' || user?.role === 'officer';
  const now = new Date();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Agronomic Field Inspections</h2>
          <p className="text-xs text-stone-500">
            Field officer verification logs, pest monitoring, input advisory, and scheduled follow-ups
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Field Visit</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer, officer, contract, recommendations..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
            overdueOnly
              ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Overdue Follow-ups Only</span>
        </button>
      </div>

      {/* Visits List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading inspection reports...</div>
        ) : visits.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">No matching field visits found.</div>
        ) : (
          visits.map((v) => {
            const isOverdue =
              v.followUpDate && new Date(v.followUpDate) < now && v.visitStatus !== 'Completed';

            return (
              <div
                key={v.visitId}
                className={`bg-white p-4 sm:p-5 rounded-xl border shadow-xs transition-colors ${
                  isOverdue ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200/90'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-950 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {v.visitId}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">{v.farmerName}</span>
                    <span className="text-stone-400 text-xs">&middot; Contract: {v.contractId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={v.cropHealthStatus} />
                    <Badge status={v.visitStatus} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200/80 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Field Agronomist</span>
                    <div className="font-semibold text-stone-900">{v.fieldOfficerName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Inspection Type</span>
                    <div className="font-medium text-stone-800">{v.visitType}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Growth Stage</span>
                    <div className="font-medium text-emerald-900 font-semibold">{v.cropGrowthStage}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Inspection Date</span>
                    <div className="font-medium text-stone-800">{formatDate(v.visitDate)}</div>
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <strong className="text-stone-900">Pest &amp; Disease: </strong>
                      {v.pestOrDiseaseObservations || 'None noted'}
                    </div>
                    <div>
                      <strong className="text-stone-900">Irrigation: </strong>
                      {v.irrigationStatus} &middot; Weather: {v.weatherObservations || 'Clear'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs">
                    <strong className="text-emerald-950">Agronomist Recommendation: </strong>
                    <span className="text-emerald-900 italic">"{v.recommendations}"</span>
                  </div>
                </div>

                {v.followUpDate && (
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Scheduled Follow-up Date:</span>
                    <span
                      className={`font-bold tabular-nums ${
                        isOverdue ? 'text-rose-700 bg-rose-100 px-2 py-0.5 rounded' : 'text-stone-800'
                      }`}
                    >
                      {formatDate(v.followUpDate)} {isOverdue && '(OVERDUE FOLLOW-UP)'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <VisitFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchVisits}
      />
    </div>
  );
};

export default FieldVisitsPage;
