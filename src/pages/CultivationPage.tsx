import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { CultivationRecord } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import CultivationStageModal from '../components/cultivation/CultivationStageModal.tsx';
import { formatDate } from '../utils/formatters.ts';
import { Activity, Search, Edit3, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const CultivationPage: React.FC = () => {
  const { user } = useAuth();
  const [cultivations, setCultivations] = useState<CultivationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Stage update modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CultivationRecord | null>(null);

  const fetchCultivations = async () => {
    setLoading(true);
    try {
      const res = await api.cultivations.getAll({ search, stage: stageFilter });
      setCultivations(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivations();
  }, [search, stageFilter]);

  const handleOpenStageModal = (record: CultivationRecord) => {
    setSelectedRecord(record);
    setStageModalOpen(true);
  };

  const canUpdate = user?.role === 'admin' || user?.role === 'officer' || user?.role === 'farmer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Crop Cultivation Tracking</h2>
          <p className="text-xs text-stone-500">
            Real-time chronological growth stages, vegetative milestones, and harvest yields
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop, farmer name, contract ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Growth Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Stages</option>
            <option value="Land Preparation">Land Preparation</option>
            <option value="Sowing">Sowing</option>
            <option value="Growing">Growing</option>
            <option value="Flowering">Flowering</option>
            <option value="Harvesting">Harvesting</option>
            <option value="Harvest Completed">Harvest Completed</option>
          </select>
        </div>
      </div>

      {/* Cultivation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-stone-400 text-xs">Loading cultivation tracker...</div>
        ) : cultivations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 text-xs">No cultivation records found.</div>
        ) : (
          cultivations.map((cl) => (
            <div
              key={cl.cultivationId}
              className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-950 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {cl.cultivationId}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        Contract: <strong>{cl.contractId}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-1">{cl.cropName}</h3>
                    <p className="text-xs text-stone-600 font-medium">
                      Farmer: <span className="font-semibold text-stone-900">{cl.farmerName}</span> &middot; {cl.landAreaAcres} Acres
                    </p>
                  </div>
                  <Badge status={cl.currentGrowthStage} />
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                    <span>Cultivation Cycle Milestone</span>
                    <span className="font-bold text-emerald-900 tabular-nums">{cl.stageProgressPercent}% Completed</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full bg-emerald-700 transition-all duration-300 rounded-full"
                      style={{ width: `${cl.stageProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Dates & Yield Estimates */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Sowing Date</span>
                    <div className="font-medium text-stone-800">{formatDate(cl.sowingDate)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Expected Harvest</span>
                    <div className="font-medium text-stone-800">{formatDate(cl.expectedHarvestDate)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Expected Yield</span>
                    <div className="font-bold text-stone-900 tabular-nums">{cl.expectedYieldKg?.toLocaleString('en-IN')} kg</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase">Actual Yield</span>
                    <div className="font-bold text-emerald-800 tabular-nums">
                      {cl.actualYieldKg ? `${cl.actualYieldKg.toLocaleString('en-IN')} kg` : 'Pending harvest'}
                    </div>
                  </div>
                </div>

                {/* Timeline History */}
                {cl.activityTimeline && cl.activityTimeline.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">Growth Activity Log</span>
                    <div className="space-y-1.5 border-l-2 border-emerald-600/40 pl-3">
                      {cl.activityTimeline.slice(-3).map((t, idx) => (
                        <div key={idx} className="text-[11px]">
                          <span className="font-semibold text-stone-800">{t.stage}</span> &middot;{' '}
                          <span className="text-stone-400">{formatDate(t.date)}</span>
                          <p className="text-stone-600 italic leading-snug">{t.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canUpdate && (
                <div className="pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => handleOpenStageModal(cl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Advance Stage</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CultivationStageModal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        onSuccess={fetchCultivations}
        record={selectedRecord}
      />
    </div>
  );
};

export default CultivationPage;
