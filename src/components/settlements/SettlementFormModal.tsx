import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Contract } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface SettlementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
}

export const SettlementFormModal: React.FC<SettlementFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [acceptedQuantity, setAcceptedQuantity] = useState('600');
  const [deductions, setDeductions] = useState('1000');
  const [deductionReason, setDeductionReason] = useState(
    'Moisture conditioning charge & bag unloading fee authorized under clause 4.2'
  );
  const [otherAdjustments, setOtherAdjustments] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [approvalNotes, setApprovalNotes] = useState('Reviewed against weighbridge delivery sheets.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadContracts = async () => {
        try {
          const res = await api.contracts.getAll();
          const list: Contract[] = res.data?.data || [];
          setContracts(list);
          if (defaultContractId) {
            setContractId(defaultContractId);
          } else if (list.length > 0) {
            setContractId(list[0].contractId);
          }
        } catch (err) {
          setError('Failed to fetch contracts.');
        }
      };
      loadContracts();
    }
  }, [isOpen, defaultContractId]);

  const selectedContract = contracts.find((c) => c.contractId === contractId);
  const unitPrice = selectedContract ? selectedContract.agreedPricePerUnit : 30;

  const qty = parseFloat(acceptedQuantity) || 0;
  const ded = Math.max(0, parseFloat(deductions) || 0);
  const adj = parseFloat(otherAdjustments) || 0;

  // Exact formulas:
  // Gross amount = Total accepted quantity × Agreed unit price
  const grossAmount = Math.round(qty * unitPrice * 100) / 100;

  // Net payable = Gross amount − Valid deductions + Authorized adjustments
  const netPayable = Math.max(0, Math.round((grossAmount - ded + adj) * 100) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || qty <= 0) {
      setError('Please select a contract and enter accepted delivery quantity.');
      return;
    }

    if (ded > 0 && !deductionReason.trim()) {
      setError('A valid authorized deduction reason is required when deductions are applied.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.settlements.prepare({
        contractId,
        totalAcceptedQuantity: qty,
        deductions: ded,
        deductionReason: ded > 0 ? deductionReason : '',
        otherAdjustments: adj,
        adjustmentReason: adj !== 0 ? adjustmentReason : '',
        paymentDueDate: dueDate,
        approvalNotes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to prepare settlement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prepare Settlement Statement"
      subtitle="Generate audit-cleared financial settlement with itemized deductions and balance calculations"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Contract *</label>
          <select
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            required
          >
            {contracts.map((c) => (
              <option key={c.contractId} value={c.contractId}>
                {c.contractId} - {c.cropName} ({c.farmerName} &rarr; {c.buyerName})
              </option>
            ))}
          </select>
        </div>

        {selectedContract && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <span className="text-[11px] text-stone-500">Agreed Unit Price</span>
              <div className="font-bold text-stone-900 tabular-nums">
                ₹{selectedContract.agreedPricePerUnit} / {selectedContract.unitOfMeasurement}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500">Beneficiary Farmer</span>
              <div className="font-bold text-stone-900 truncate">
                {selectedContract.farmerName}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Total Accepted Quantity (kg) *</label>
            <input
              type="number"
              step="1"
              min="1"
              value={acceptedQuantity}
              onChange={(e) => setAcceptedQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Payment Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
          <div className="font-semibold text-emerald-950 flex items-center justify-between">
            <span>Settlement Breakdown</span>
            <span className="text-[11px] text-stone-500 font-normal">Formula Enforced</span>
          </div>

          <div className="space-y-1.5 text-stone-700">
            <div className="flex justify-between items-center py-1 border-b border-emerald-100">
              <span>Gross Amount ({qty.toLocaleString('en-IN')} kg &times; ₹{unitPrice})</span>
              <span className="font-bold text-stone-900 tabular-nums">{formatCurrency(grossAmount)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Authorized Deductions (₹)</label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums text-rose-700 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Deduction Reason *</label>
                <input
                  type="text"
                  value={deductionReason}
                  onChange={(e) => setDeductionReason(e.target.value)}
                  placeholder="Reason for penalty / moisture deduction"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Incentives / Adjustments (₹)</label>
                <input
                  type="number"
                  step="10"
                  value={otherAdjustments}
                  onChange={(e) => setOtherAdjustments(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Prompt delivery bonus"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm font-bold text-emerald-950 border-t border-emerald-200">
              <span>Net Payable Amount:</span>
              <span className="text-base text-emerald-900 tabular-nums">{formatCurrency(netPayable)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Approval &amp; Audit Notes</label>
          <textarea
            rows={2}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Generating...' : 'Approve & Create Settlement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettlementFormModal;
