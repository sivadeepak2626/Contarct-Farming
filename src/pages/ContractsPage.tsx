import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Contract } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import ContractFormModal from '../components/contracts/ContractFormModal.tsx';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters.ts';
import { FileSignature, Search, Plus, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const ContractsPage: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetContract, setTargetContract] = useState<Contract | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Active');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.contracts.getAll({ search, status: statusFilter });
      setContracts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [search, statusFilter]);

  const handleViewDetail = async (contract: Contract) => {
    try {
      const res = await api.contracts.getById(contract.contractId);
      setSelectedContract(res.data?.data);
      setDetailModalOpen(true);
    } catch (err) {
      alert('Failed to load contract details.');
    }
  };

  const handleOpenStatusModal = (contract: Contract) => {
    setTargetContract(contract);
    setNewStatus(contract.contractStatus);
    setStatusNotes(`Transition authorized by ${user?.name}`);
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetContract) return;

    setUpdatingStatus(true);
    try {
      await api.contracts.updateStatus(targetContract.contractId, {
        status: newStatus,
        notes: statusNotes,
      });
      setStatusModalOpen(false);
      fetchContracts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update contract status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'buyer';
  const canUpdateStatus = user?.role === 'admin' || user?.role === 'buyer' || user?.role === 'farmer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Contract Management</h2>
          <p className="text-xs text-stone-500">
            Binding tripartite agreements with automated value calculation and status audit lifecycle
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Contract</span>
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
            placeholder="Search by Contract ID, Farmer, Buyer, Crop..."
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
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Farmer (Producer)</th>
                <th className="py-3 px-4">Buyer (Procuring Entity)</th>
                <th className="py-3 px-4">Crop Variety</th>
                <th className="py-3 px-4 text-right">Agreed Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Gross Value</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">Loading contracts...</td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">No contracts found.</td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.contractId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{c.contractId}</td>
                    <td className="py-3 px-4 font-semibold text-stone-900">{c.farmerName}</td>
                    <td className="py-3 px-4 font-medium text-stone-800">{c.buyerName}</td>
                    <td className="py-3 px-4 font-medium text-emerald-900">{c.cropName}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold">
                      {formatNumber(c.agreedQuantity)} {c.unitOfMeasurement}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-stone-800">
                      ₹{c.agreedPricePerUnit}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-950">
                      {formatCurrency(c.grossContractValue)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(c.deliveryDeadline)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={c.contractStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(c)}
                          title="View Full Contract Dossier"
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdateStatus && (
                          <button
                            onClick={() => handleOpenStatusModal(c)}
                            title="Update Contract Status"
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            Status
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

      {/* Contract Detail Dossier Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedContract ? `Contract Dossier: ${selectedContract.contractId}` : 'Contract Dossier'}
        subtitle="Tripartite binding terms, physical progress, and financial ledger"
        maxWidth="4xl"
      >
        {selectedContract && (
          <div className="space-y-6 text-xs text-stone-800">
            {/* Primary Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Farmer</span>
                <div className="font-bold text-stone-900 mt-0.5">{selectedContract.farmerName}</div>
                <div className="text-stone-500 text-[11px]">ID: {selectedContract.farmerId}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Buyer Company</span>
                <div className="font-bold text-stone-900 mt-0.5">{selectedContract.buyerName}</div>
                <div className="text-stone-500 text-[11px]">ID: {selectedContract.buyerId}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Crop &amp; Land</span>
                <div className="font-bold text-emerald-900 mt-0.5">{selectedContract.cropName}</div>
                <div className="text-stone-500 text-[11px]">{selectedContract.cultivatedLandAreaAcres} Acres &middot; {selectedContract.farmingSeason}</div>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Assigned Officer</span>
                <div className="font-semibold text-stone-900 mt-0.5">{selectedContract.fieldOfficerName || 'Dr. Priya Rao'}</div>
                <div className="text-stone-500 text-[11px]">Extension supervisor</div>
              </div>
            </div>

            {/* Calculations Banner */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Contracted Quota</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5 tabular-nums">
                  {formatNumber(selectedContract.agreedQuantity)} {selectedContract.unitOfMeasurement}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Agreed Price</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5 tabular-nums">
                  ₹{selectedContract.agreedPricePerUnit} / {selectedContract.unitOfMeasurement}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Gross Contract Value</span>
                <div className="font-bold text-emerald-950 text-base mt-0.5 tabular-nums">
                  {formatCurrency(selectedContract.grossContractValue)}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">Remaining To Deliver</span>
                <div className="font-bold text-rose-800 text-sm mt-0.5 tabular-nums">
                  {formatNumber(selectedContract.remainingToDeliver)} {selectedContract.unitOfMeasurement}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-stone-200">
              <div>
                <span className="font-semibold text-stone-900 block mb-1">Quality Specifications</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">{selectedContract.qualityStandards}</p>
              </div>
              <div>
                <span className="font-semibold text-stone-900 block mb-1">Payment Schedule &amp; Terms</span>
                <p className="text-stone-600 text-[11px] leading-relaxed">{selectedContract.paymentTerms}</p>
              </div>
            </div>

            {/* Status History Trail */}
            <div>
              <h4 className="font-bold text-stone-900 mb-2">Contract Status Audit Log</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                {selectedContract.statusHistory?.map((h: any, i: number) => (
                  <div key={i} className="p-2.5 bg-white flex items-center justify-between text-[11px]">
                    <div>
                      <Badge status={h.status} />
                      <span className="ml-2 font-medium text-stone-700">{h.notes}</span>
                    </div>
                    <div className="text-right text-stone-400">
                      <span>{formatDate(h.timestamp)}</span> &middot; By: <strong>{h.updatedBy}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={targetContract ? `Transition Status: ${targetContract.contractId}` : 'Update Status'}
        subtitle="Officially record contract lifecycle changes with audit trail"
        maxWidth="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Select New Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold"
            >
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Audit Notes &amp; Reason *</label>
            <textarea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingStatus}
              className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Contract Creator Modal */}
      <ContractFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchContracts}
      />
    </div>
  );
};

export default ContractsPage;
