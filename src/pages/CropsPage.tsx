import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Crop } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import { Wheat, Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const CropsPage: React.FC = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [season, setSeason] = useState('All');

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [cropCategory, setCropCategory] = useState<'Cereal' | 'Pulse' | 'Oilseed' | 'Commercial' | 'Horticulture'>('Cereal');
  const [growingSeason, setGrowingSeason] = useState<'Kharif' | 'Rabi' | 'Zaid' | 'Perennial'>('Kharif');
  const [durationDays, setDurationDays] = useState('120');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState<'kg' | 'quintal' | 'ton'>('kg');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await api.crops.getAll({ search, category, season });
      setCrops(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [search, category, season]);

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !variety || !durationDays) {
      setError('Please provide all crop details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.crops.create({
        cropName,
        variety,
        cropCategory,
        growingSeason,
        cultivationDurationDays: parseInt(durationDays, 10),
        unitOfMeasurement,
      });
      setModalOpen(false);
      fetchCrops();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add crop.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Approved Crop Catalog</h2>
          <p className="text-xs text-stone-500">
            Standard agronomic varieties, expected harvest cycles, and procurement units
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCropName('');
              setVariety('');
              setDurationDays('120');
              setError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Crop Variety</span>
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
            placeholder="Search crop name, hybrid variety..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Cereal">Cereal</option>
            <option value="Pulse">Pulse</option>
            <option value="Oilseed">Oilseed</option>
            <option value="Commercial">Commercial</option>
            <option value="Horticulture">Horticulture</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Season:</span>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Seasons</option>
            <option value="Kharif">Kharif (Monsoon)</option>
            <option value="Rabi">Rabi (Winter)</option>
            <option value="Zaid">Zaid (Summer)</option>
            <option value="Perennial">Perennial</option>
          </select>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-stone-400 text-xs">Loading crop catalog...</div>
        ) : crops.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 text-xs">No matching crops found.</div>
        ) : (
          crops.map((c) => (
            <div
              key={c.cropId}
              className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                    {c.cropId}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-stone-500">
                    {c.cropCategory}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm mt-2">{c.cropName}</h3>
                <p className="text-xs text-stone-500 font-medium">{c.variety}</p>

                <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Season:</span>
                    <strong className="text-stone-800">{c.growingSeason}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cultivation Duration:</span>
                    <strong className="text-stone-800 tabular-nums">{c.cultivationDurationDays} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Procurement Unit:</span>
                    <strong className="text-emerald-800 uppercase">{c.unitOfMeasurement}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                <Badge status={c.status} />
                <span className="text-[11px] text-stone-400">Audited standard</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Crop Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Crop Variety to Catalog"
        subtitle="Define standard cultivation parameters and procurement measurement units"
        maxWidth="md"
      >
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateCrop} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Crop Name &amp; Label *</label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Paddy (Basmati 1121)"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Botanical / Hybrid Variety *</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g. Pusa Basmati 1121"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category *</label>
              <select
                value={cropCategory}
                onChange={(e) => setCropCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="Cereal">Cereal</option>
                <option value="Pulse">Pulse</option>
                <option value="Oilseed">Oilseed</option>
                <option value="Commercial">Commercial</option>
                <option value="Horticulture">Horticulture</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Growing Season *</label>
              <select
                value={growingSeason}
                onChange={(e) => setGrowingSeason(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
                <option value="Perennial">Perennial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Cultivation Duration (Days) *</label>
              <input
                type="number"
                min="10"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Unit of Measurement *</label>
              <select
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="ton">ton (1,000 kg)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Crop Variety'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CropsPage;
