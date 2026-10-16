import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Contract } from '../../types/index.ts';

interface HarvestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
}

export const HarvestFormModal: React.FC<HarvestFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [actualQuantity, setActualQuantity] = useState('800');
  const [acceptedQuantity, setAcceptedQuantity] = useState('760');
  const [rejectedQuantity, setRejectedQuantity] = useState('40');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Grade C' | 'Commercial'>('Grade A');
  const [notes, setNotes] = useState('Grain harvested at optimal moisture. Verified clean threshing.');
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

  const actual = parseFloat(actualQuantity) || 0;
  const accepted = parseFloat(acceptedQuantity) || 0;
  const rejected = parseFloat(rejectedQuantity) || 0;

  // Real-time validation warning
  const isOverSum = accepted + rejected > actual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || actual <= 0) {
      setError('Please select a valid contract and enter actual harvested quantity.');
      return;
    }

    if (isOverSum) {
      setError(`Validation Error: Accepted (${accepted} kg) + Rejected (${rejected} kg) cannot exceed Actual Harvested (${actual} kg).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.harvests.create({
        contractId,
        farmerId: selectedContract?.farmerId,
        harvestDate,
        expectedQuantity: selectedContract?.agreedQuantity || actual,
        actualQuantityHarvested: actual,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        qualityGrade,
        inspectionNotes: notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Harvest Entry"
      subtitle="Document crop yield with field quality inspection and accepted/rejected breakdown"
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
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-500">Agreed Contract Target</span>
              <div className="font-bold text-stone-900 tabular-nums">
                {selectedContract.agreedQuantity.toLocaleString('en-IN')} {selectedContract.unitOfMeasurement}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500">Agreed Unit Price</span>
              <div className="font-bold text-stone-900 tabular-nums">
                ₹{selectedContract.agreedPricePerUnit} / {selectedContract.unitOfMeasurement}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Actual Harvested (kg) *</label>
            <input
              type="number"
              step="1"
              min="1"
              value={actualQuantity}
              onChange={(e) => setActualQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Accepted (kg) *</label>
            <input
              type="number"
              step="1"
              min="0"
              value={acceptedQuantity}
              onChange={(e) => setAcceptedQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums text-emerald-800 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Rejected (kg)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={rejectedQuantity}
              onChange={(e) => setRejectedQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums text-rose-800 font-semibold"
            />
          </div>
        </div>

        {isOverSum && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[11px]">
            Notice: Accepted ({accepted}) + Rejected ({rejected}) = {accepted + rejected} kg, which exceeds actual harvested ({actual} kg). Please correct quantities.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Harvest Date *</label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Quality Inspection Grade</label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
              <option value="Grade C">Grade C (Fair)</option>
              <option value="Commercial">Commercial Grade</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Inspection Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            placeholder="Field observations regarding moisture, kernel size, impurities..."
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
            disabled={submitting || isOverSum}
            className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Save Harvest Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HarvestFormModal;
