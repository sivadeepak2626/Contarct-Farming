import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { FieldOfficer, Farmer } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import { UserCheck, Search, Plus, UserPlus, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const FieldOfficersPage: React.FC = () => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [allFarmers, setAllFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Assign Farmers Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<FieldOfficer | null>(null);
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([]);

  // Create Officer Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Western Region');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const [oRes, fRes] = await Promise.all([api.officers.getAll({ search }), api.farmers.getAll()]);
      setOfficers(oRes.data?.data || []);
      setAllFarmers(fRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [search]);

  const handleOpenAssign = (officer: FieldOfficer) => {
    setSelectedOfficer(officer);
    setSelectedFarmerIds(officer.assignedFarmerIds || []);
    setAssignModalOpen(true);
  };

  const toggleFarmerSelection = (farmerId: string) => {
    setSelectedFarmerIds((prev) =>
      prev.includes(farmerId) ? prev.filter((id) => id !== farmerId) : [...prev, farmerId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedOfficer) return;
    try {
      await api.officers.assignFarmers(selectedOfficer.officerId, selectedFarmerIds);
      setAssignModalOpen(false);
      fetchOfficers();
    } catch (err) {
      alert('Failed to update assignments.');
    }
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !region) {
      setFormError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await api.officers.create({
        name,
        email,
        phoneNumber: phone,
        assignedRegion: region,
      });
      setCreateModalOpen(false);
      fetchOfficers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create officer.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Field Agronomists &amp; Extension Officers</h2>
          <p className="text-xs text-stone-500">
            Regional agricultural officers responsible for field inspections, input verifications, and quality assurance
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setName('');
              setEmail('');
              setPhone('');
              setRegion('Central Region');
              setFormError(null);
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field Officer</span>
          </button>
        )}
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Officer ID</th>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Jurisdiction Region</th>
                <th className="py-3 px-4 text-center">Assigned Farmers</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Assignments</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">Loading officers...</td>
                </tr>
              ) : (
                officers.map((o) => (
                  <tr key={o.officerId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{o.officerId}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{o.name}</td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>{o.phoneNumber}</div>
                      <div className="text-stone-400">{o.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800">{o.assignedRegion}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold tabular-nums">
                        {o.assignedFarmerIds?.length || 0} Farmers
                      </span>
                    </td>
                    <td className="py-3 px-4"><Badge status={o.employmentStatus} /></td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAssign(o)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Farmers</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Farmers Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={selectedOfficer ? `Assign Farmers to ${selectedOfficer.name}` : 'Assign Farmers'}
        subtitle={`Select farmers to be overseen by ${selectedOfficer?.name} in ${selectedOfficer?.assignedRegion}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-lg">
            {allFarmers.map((f) => {
              const isSelected = selectedFarmerIds.includes(f.farmerId);
              return (
                <div
                  key={f.farmerId}
                  onClick={() => toggleFarmerSelection(f.farmerId)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/70' : 'hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-stone-900">{f.fullName}</span>
                    <span className="text-stone-500 text-[11px] ml-2">({f.farmerId} &middot; {f.village}, {f.district})</span>
                    <div className="text-[10px] text-stone-400">Land: {f.totalLandAreaAcres} Acres &middot; {f.cropsCultivated.join(', ')}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-200">
            <span className="text-stone-600 text-xs">
              Selected: <strong>{selectedFarmerIds.length}</strong> farmers
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignments}
                className="px-4 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Field Officer Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Field Agronomist Officer"
        subtitle="Register an accredited field extension officer"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateOfficer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Name &amp; Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Priya Rao"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya.rao@farmcontract.in"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Mobile Phone *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 97412 88990"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Jurisdiction Region *</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Western Region (Gujarat & Maharashtra)"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Add Officer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FieldOfficersPage;
