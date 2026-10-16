import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Buyer } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import { formatCurrency } from '../../src/utils/formatters.ts';
import { Building2, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const BuyersPage: React.FC = () => {
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Profile View
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedBuyerProfile, setSelectedBuyerProfile] = useState<any>(null);

  // Form Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [preferredCropsStr, setPreferredCropsStr] = useState('Paddy, Wheat, Maize');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.buyers.getAll({ search, status: selectedStatus });
      setBuyers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [search, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingBuyer(null);
    setCompanyName('');
    setContactPerson('');
    setPhoneNumber('');
    setEmail('');
    setBusinessAddress('');
    setRegNumber('');
    setPreferredCropsStr('Paddy, Wheat, Maize');
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setCompanyName(buyer.companyName);
    setContactPerson(buyer.contactPerson);
    setPhoneNumber(buyer.phoneNumber);
    setEmail(buyer.email);
    setBusinessAddress(buyer.businessAddress);
    setRegNumber(buyer.registrationNumber || '');
    setPreferredCropsStr(buyer.preferredCrops.join(', '));
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleViewProfile = async (buyer: Buyer) => {
    try {
      const res = await api.buyers.getById(buyer.buyerId);
      setSelectedBuyerProfile(res.data?.data);
      setProfileModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load buyer details.');
    }
  };

  const handleDelete = async (buyer: Buyer) => {
    if (confirm(`Deactivate company account ${buyer.companyName}?`)) {
      try {
        await api.buyers.delete(buyer.buyerId);
        fetchBuyers();
      } catch (err) {
        alert('Failed to deactivate.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !phoneNumber || !email || !businessAddress) {
      setFormError('Please fill in all mandatory company fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const crops = preferredCropsStr.split(',').map((c) => c.trim()).filter(Boolean);

    try {
      if (editingBuyer) {
        await api.buyers.update(editingBuyer.buyerId, {
          companyName,
          contactPerson,
          phoneNumber,
          email,
          businessAddress,
          registrationNumber: regNumber,
          preferredCrops: crops,
        });
      } else {
        await api.buyers.create({
          companyName,
          contactPerson,
          phoneNumber,
          email,
          businessAddress,
          registrationNumber: regNumber,
          preferredCrops: crops,
        });
      }
      setFormModalOpen(false);
      fetchBuyers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = user?.role === 'admin';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Corporate Buyers &amp; Agribusinesses</h2>
          <p className="text-xs text-stone-500">
            Registered food processors, exporters, and procurement enterprises
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register Buyer Company</span>
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
            placeholder="Search by company name, contact, ID, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
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

      {/* Buyers Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Buyer ID</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone &amp; Email</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Preferred Crops</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">Loading buyers...</td>
                </tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">No matching buyers.</td>
                </tr>
              ) : (
                buyers.map((b) => (
                  <tr key={b.buyerId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{b.buyerId}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{b.companyName}</td>
                    <td className="py-3 px-4 font-medium">{b.contactPerson}</td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>{b.phoneNumber}</div>
                      <div className="text-stone-400">{b.email}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-stone-600">{b.businessAddress}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.preferredCrops?.map((c, i) => (
                          <span key={i} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4"><Badge status={b.accountStatus} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewProfile(b)}
                          title="View Company Profile"
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Buyer"
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(b)}
                            title="Deactivate Buyer"
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

      {/* Buyer Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={selectedBuyerProfile?.companyName || 'Buyer Profile'}
        subtitle={`Buyer ID: ${selectedBuyerProfile?.buyerId} · Registration: ${selectedBuyerProfile?.registrationNumber || 'Standard'}`}
        maxWidth="2xl"
      >
        {selectedBuyerProfile && (
          <div className="space-y-5 text-xs text-stone-800">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-stone-500 font-semibold uppercase">Contact Person</span>
                <div className="font-bold text-stone-900">{selectedBuyerProfile.contactPerson}</div>
                <div className="text-stone-500">{selectedBuyerProfile.phoneNumber}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-semibold uppercase">Email</span>
                <div className="font-semibold text-stone-900">{selectedBuyerProfile.email}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 font-semibold uppercase">Registered Address</span>
                <div className="text-stone-700">{selectedBuyerProfile.businessAddress}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-2">Executed Contracts ({selectedBuyerProfile.contracts?.length || 0})</h4>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
                {selectedBuyerProfile.contracts?.map((c: any) => (
                  <div key={c.contractId} className="p-2.5 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{c.contractId} &middot; {c.cropName}</span>
                      <div className="text-stone-500 text-[11px]">Farmer: {c.farmerName}</div>
                    </div>
                    <div className="text-right">
                      <Badge status={c.contractStatus} />
                      <div className="font-bold text-emerald-900 tabular-nums">{formatCurrency(c.grossContractValue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingBuyer ? `Edit Buyer: ${editingBuyer.companyName}` : 'Register Buyer Company'}
        subtitle="Enterprise registration for contract agricultural procurement"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Company / Enterprise Legal Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. AgroCorp Foods India Pvt Ltd"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contact Person *</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 99201 44556"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="procurement@agrocorp.com"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Corporate Registration No. (CIN/LLPIN)</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="U01100HR2018PTC073921"
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Business Registered Address *</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Cyber City Tower B, Gurugram, Haryana"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Preferred Sourcing Crops (comma separated)</label>
            <input
              type="text"
              value={preferredCropsStr}
              onChange={(e) => setPreferredCropsStr(e.target.value)}
              placeholder="Paddy, Wheat, Maize"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
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
              {submitting ? 'Saving...' : editingBuyer ? 'Save Changes' : 'Register Buyer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BuyersPage;
