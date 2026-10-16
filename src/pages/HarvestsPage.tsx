import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Harvest } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import HarvestFormModal from '../components/harvests/HarvestFormModal.tsx';
import { formatNumber, formatDate } from '../utils/formatters.ts';
import { PackageCheck, Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const HarvestsPage: React.FC = () => {
  const { user } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchHarvests = async () => {
    setLoading(true);
    try {
      const res = await api.harvests.getAll({ search });
      setHarvests(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, [search]);

  const totalActual = harvests.reduce((sum, h) => sum + (h.actualQuantityHarvested || 0), 0);
  const totalAccepted = harvests.reduce((sum, h) => sum + (h.acceptedQuantity || 0), 0);
  const totalRejected = harvests.reduce((sum, h) => sum + (h.rejectedQuantity || 0), 0);

  const canCreate = user?.role === 'admin' || user?.role === 'officer' || user?.role === 'farmer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Harvest Entries &amp; Yield Records</h2>
          <p className="text-xs text-stone-500">
            Certified crop yield lots with accepted vs rejected breakdown and field grade inspections
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record Harvest Batch</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-stone-400">Total Actual Yield</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-0.5">{formatNumber(totalActual)} kg</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-emerald-700">Accepted Clean Produce</span>
            <div className="text-xl font-bold text-emerald-900 tabular-nums mt-0.5">{formatNumber(totalAccepted)} kg</div>
          </div>
          <div className="text-xs font-semibold text-emerald-700">
            {totalActual > 0 ? Math.round((totalAccepted / totalActual) * 100) : 0}% Qualified
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-rose-600">Screened Out / Rejected</span>
            <div className="text-xl font-bold text-rose-800 tabular-nums mt-0.5">{formatNumber(totalRejected)} kg</div>
          </div>
          <div className="text-xs font-semibold text-rose-700">
            {totalActual > 0 ? (totalRejected / totalActual) * 100 : 0}% Loss Rate
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search harvest ID, crop, contract, farmer..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Harvests Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Harvest ID</th>
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4 text-right">Actual Harvest</th>
                <th className="py-3 px-4 text-right">Accepted (kg)</th>
                <th className="py-3 px-4 text-right">Rejected (kg)</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Harvest Date</th>
                <th className="py-3 px-4">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">Loading harvests...</td>
                </tr>
              ) : harvests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">No harvest batches found.</td>
                </tr>
              ) : (
                harvests.map((h) => (
                  <tr key={h.harvestId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{h.harvestId}</td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-600">{h.contractId}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{h.farmerName}</td>
                    <td className="py-3 px-4 font-medium text-emerald-900">{h.cropName}</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-stone-900">
                      {formatNumber(h.actualQuantityHarvested)} kg
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-800">
                      {formatNumber(h.acceptedQuantity)} kg
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-rose-700">
                      {formatNumber(h.rejectedQuantity)} kg
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {h.qualityGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(h.harvestDate)}
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">{h.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <HarvestFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchHarvests}
      />
    </div>
  );
};

export default HarvestsPage;
