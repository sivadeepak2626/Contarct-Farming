import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Farmer, FieldOfficer } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { Users, Search, Plus, Eye, Edit, Trash2, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const FarmersPage: React.FC = () => {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Profile View Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<any>(null);

  // Create / Edit Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('Gujarat');
  const [farmAddress, setFarmAddress] = useState('');
  const [landArea, setLandArea] = useState('10');
  const [cropsStr, setCropsStr] = useState('Paddy, Maize');
  const [officerId, setOfficerId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.farmers.getAll({
        search,
        state: selectedState,
        status: selectedStatus,
      });
      setFarmers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.officers.getAll();
      setOfficers(res.data?.data || []);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchFarmers();
    fetchOfficers();
  }, [search, selectedState, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingFarmer(null);
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setVillage('');
    setDistrict('');
    setStateName('Gujarat');
    setFarmAddress('');
    setLandArea('10');
    setCropsStr('Paddy, Maize');
    setOfficerId(officers[0]?.officerId || '');
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFullName(farmer.fullName);
    setPhoneNumber(farmer.phoneNumber);
    setEmail(farmer.email);
    setVillage(farmer.village);
    setDistrict(farmer.district);
    setStateName(farmer.state);
    setFarmAddress(farmer.farmAddress);
    setLandArea(String(farmer.totalLandAreaAcres));
    setCropsStr(farmer.cropsCultivated.join(', '));
    setOfficerId(farmer.assignedFieldOfficerId || '');
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleViewProfile = async (farmer: Farmer) => {
    try {
      const res = await api.farmers.getById(farmer.farmerId);
      setSelectedFarmerProfile(res.data?.data);
      setProfileModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load farmer profile.');
    }
  };

  const handleDelete = async (farmer: Farmer) => {
    if (confirm(`Are you sure you want to delete or deactivate farmer ${farmer.fullName}?`)) {
      try {
        const res = await api.farmers.delete(farmer.farmerId);
        alert(res.data?.message || 'Farmer record updated.');
        fetchFarmers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to deactivate farmer.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !email || !village || !district || !landArea) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const cropsArray = cropsStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      if (editingFarmer) {
        await api.farmers.update(editingFarmer.farmerId, {
          fullName,
          phoneNumber,
          email,
          village,
          district,
          state: stateName,
          farmAddress,
          totalLandAreaAcres: parseFloat(landArea),
          cropsCultivated: cropsArray,
          assignedFieldOfficerId: officerId || undefined,
        });
      } else {
        await api.farmers.create({
          fullName,
          phoneNumber,
          email,
          village,
          district,
          state: stateName,
          farmAddress,
          totalLandAreaAcres: parseFloat(landArea),
          cropsCultivated: cropsArray,
          assignedFieldOfficerId: officerId || undefined,
        });
      }
      setFormModalOpen(false);
      fetchFarmers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Farmer Management</h2>
          <p className="text-xs text-stone-500">
            Registered smallholders and medium cultivators enrolled in contract farming
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Farmer</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone, village..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All States</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Punjab">Punjab</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Bihar">Bihar</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Farmer ID</th>
                <th className="py-3 px-4">Farmer Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Land Area</th>
                <th className="py-3 px-4">Crops Cultivated</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Loading farmers directory...
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No matching farmer records found.
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => (
                  <tr key={farmer.farmerId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">
                      {farmer.farmerId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {farmer.fullName}
                    </td>
                    <td className="py-3 px-4">
                      {farmer.village}, {farmer.district}
                      <span className="text-stone-400 block text-[10px]">{farmer.state}</span>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>{farmer.phoneNumber}</div>
                      <div className="text-stone-400">{farmer.email}</div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold">
                      {farmer.totalLandAreaAcres} Acres
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {farmer.cropsCultivated?.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={farmer.accountStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewProfile(farmer)}
                          title="View 360° Profile"
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(farmer)}
                            title="Edit Farmer"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(farmer)}
                            title="Deactivate Farmer"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Profile Modal (Complete 360° View as requested) */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={selectedFarmerProfile ? `${selectedFarmerProfile.fullName} (${selectedFarmerProfile.farmerId})` : 'Farmer Profile'}
        subtitle="Complete operational, agronomic, and financial record dossier"
        maxWidth="4xl"
      >
        {selectedFarmerProfile && (
          <div className="space-y-6 text-xs text-stone-800">
            {/* Top Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Location</span>
                <div className="font-semibold text-stone-900 mt-0.5">
                  {selectedFarmerProfile.village}, {selectedFarmerProfile.district}
                </div>
                <div className="text-stone-500 text-[11px]">{selectedFarmerProfile.state}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Contact Info</span>
                <div className="font-semibold text-stone-900 mt-0.5">{selectedFarmerProfile.phoneNumber}</div>
                <div className="text-stone-500 text-[11px] truncate">{selectedFarmerProfile.email}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Farm Acreage</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5 tabular-nums">
                  {selectedFarmerProfile.totalLandAreaAcres} Acres
                </div>
                <div className="text-stone-500 text-[11px]">Enrolled under contract</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Assigned Officer</span>
                <div className="font-semibold text-emerald-900 mt-0.5">
                  {selectedFarmerProfile.assignedOfficer?.name || selectedFarmerProfile.assignedFieldOfficerId || 'Dr. Priya Rao'}
                </div>
                <div className="text-stone-500 text-[11px]">Jurisdiction agronomist</div>
              </div>
            </div>

            {/* Contracts History */}
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Associated Contracts ({selectedFarmerProfile.contracts?.length || 0})</span>
              </h4>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
                {selectedFarmerProfile.contracts?.length === 0 ? (
                  <p className="p-3 text-stone-400">No contracts associated.</p>
                ) : (
                  selectedFarmerProfile.contracts.map((c: any) => (
                    <div key={c.contractId} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">{c.contractId} &middot; {c.cropName}</div>
                        <div className="text-stone-500 text-[11px]">Buyer: {c.buyerName} &middot; Season: {c.farmingSeason}</div>
                      </div>
                      <div className="text-right">
                        <Badge status={c.contractStatus} />
                        <div className="font-bold text-emerald-900 mt-0.5 tabular-nums">{formatCurrency(c.grossContractValue)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cultivations & Field Visits 2-Col Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-2">Cultivation Records</h4>
                <div className="space-y-2">
                  {selectedFarmerProfile.cultivations?.map((cl: any) => (
                    <div key={cl.cultivationId} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-900">{cl.cropName}</span>
                        <Badge status={cl.currentGrowthStage} />
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">
                        Sown: {formatDate(cl.sowingDate)} &middot; Target Yield: {cl.expectedYieldKg} kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-2">Field Officer Visit Logs</h4>
                <div className="space-y-2">
                  {selectedFarmerProfile.fieldVisits?.map((v: any) => (
                    <div key={v.visitId} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-900">{v.visitType}</span>
                        <span className="text-stone-400 text-[10px]">{formatDate(v.visitDate)}</span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5 italic">"{v.recommendations}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settlements & Payouts */}
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-2">Financial Settlements &amp; Bank Payments</h4>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
                {selectedFarmerProfile.settlements?.map((s: any) => (
                  <div key={s.settlementId} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{s.settlementId} &middot; {s.cropName}</div>
                      <div className="text-stone-500 text-[11px]">
                        Gross: {formatCurrency(s.grossAmount)} &middot; Deductions: {formatCurrency(s.deductions)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge status={s.settlementStatus} />
                      <div className="font-bold text-stone-900 mt-0.5 tabular-nums">
                        Paid: <span className="text-emerald-700">{formatCurrency(s.amountAlreadyPaid)}</span> / Due: <span className="text-rose-700">{formatCurrency(s.outstandingBalance)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Farmer Create / Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingFarmer ? `Edit Farmer: ${editingFarmer.fullName}` : 'Register New Farmer'}
        subtitle="Mandatory enrollment form for contract farming registry"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile Phone *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@farmcontract.in"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Total Land Area (Acres) *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Village *</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Bardoli"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">District *</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Surat"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">State *</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Gujarat"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Farm Postal Address</label>
            <input
              type="text"
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              placeholder="Plot 14, Canal Road, Bardoli"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Crops Cultivated (comma separated)</label>
              <input
                type="text"
                value={cropsStr}
                onChange={(e) => setCropsStr(e.target.value)}
                placeholder="Paddy, Sugarcane, Groundnut"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Assign Field Officer</label>
              <select
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="">-- Select Field Officer --</option>
                {officers.map((o) => (
                  <option key={o.officerId} value={o.officerId}>
                    {o.name} ({o.assignedRegion})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingFarmer ? 'Save Changes' : 'Register Farmer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmersPage;
