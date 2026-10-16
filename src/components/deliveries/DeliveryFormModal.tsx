import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Contract } from '../../types/index.ts';

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
}

export const DeliveryFormModal: React.FC<DeliveryFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [deliveredQuantity, setDeliveredQuantity] = useState('600');
  const [acceptedQuantity, setAcceptedQuantity] = useState('600');
  const [rejectedQuantity, setRejectedQuantity] = useState('0');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryLocation, setDeliveryLocation] = useState('AgroCorp Central Silo, Silvassa Road Hub');
  const [qualityStatus, setQualityStatus] = useState<'Passed' | 'Conditional' | 'Failed'>('Passed');
  const [notes, setNotes] = useState('Batch 1 weighed on electronic bridge. Seal verified intact.');
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

  const delivered = parseFloat(deliveredQuantity) || 0;
  const accepted = parseFloat(acceptedQuantity) || 0;
  const rejected = parseFloat(rejectedQuantity) || 0;

  const isOverDelivered = accepted + rejected > delivered;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || delivered <= 0 || !deliveryLocation) {
      setError('Please provide contract, valid delivered quantity, and delivery location.');
      return;
    }

    if (isOverDelivered) {
      setError(`Accepted (${accepted}) + Rejected (${rejected}) cannot exceed Delivered Quantity (${delivered}).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.deliveries.create({
        contractId,
        scheduledDeliveryDate: scheduledDate,
        actualDeliveryDate: scheduledDate,
        plannedQuantity: delivered,
        deliveredQuantity: delivered,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        deliveryLocation,
        qualityStatus,
        notes,
        deliveryStatus: 'Delivered',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Crop Delivery"
      subtitle="Register farm-to-warehouse dispatch, weighbridge receipt, and acceptance"
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
              <span className="text-[11px] text-stone-500">Agreed Contract Quota</span>
              <div className="font-bold text-stone-900 tabular-nums">
                {selectedContract.agreedQuantity.toLocaleString('en-IN')} {selectedContract.unitOfMeasurement}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500">Remaining After Current Batch</span>
              <div className="font-bold text-emerald-800 tabular-nums">
                {Math.max(0, selectedContract.agreedQuantity - accepted).toLocaleString('en-IN')} {selectedContract.unitOfMeasurement}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Delivered Qty (kg) *</label>
            <input
              type="number"
              step="1"
              min="1"
              value={deliveredQuantity}
              onChange={(e) => setDeliveredQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Accepted Qty (kg) *</label>
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
            <label className="block font-semibold text-stone-700 mb-1">Rejected Qty (kg)</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Delivery Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Quality Status</label>
            <select
              value={qualityStatus}
              onChange={(e) => setQualityStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Passed">Passed (Accepted fully)</option>
              <option value="Conditional">Conditional Clearance</option>
              <option value="Failed">Failed Quality</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Delivery Destination / Warehouse *</label>
          <input
            type="text"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            placeholder="e.g. AgroCorp Central Silo Hub, Gate 3"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Notes &amp; Weighbridge Reference</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            disabled={submitting || isOverDelivered}
            className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Verify & Log Delivery'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryFormModal;
