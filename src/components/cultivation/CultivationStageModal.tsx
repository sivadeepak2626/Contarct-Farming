import React, { useState } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { CultivationRecord } from '../../types/index.ts';

interface CultivationStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: CultivationRecord | null;
}

const STAGES = [
  'Land Preparation',
  'Sowing',
  'Growing',
  'Flowering',
  'Harvesting',
  'Harvest Completed',
];

export const CultivationStageModal: React.FC<CultivationStageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  record,
}) => {
  const [stage, setStage] = useState(record?.currentGrowthStage || 'Growing');
  const [notes, setNotes] = useState('Growth benchmark verified. Moisture and tillers within healthy threshold.');
  const [actualYieldKg, setActualYieldKg] = useState(record?.actualYieldKg ? String(record.actualYieldKg) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.cultivations.updateStage(record.cultivationId, {
        stage,
        notes,
        actualYieldKg: actualYieldKg ? parseFloat(actualYieldKg) : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update cultivation stage.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advance Crop Cultivation Stage"
      subtitle={`Plot ID: ${record.cultivationId} · ${record.cropName} (${record.farmerName})`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Target Growth Stage *</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {stage === 'Harvest Completed' && (
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Final Actual Yield (kg)</label>
            <input
              type="number"
              step="1"
              value={actualYieldKg}
              onChange={(e) => setActualYieldKg(e.target.value)}
              placeholder="e.g. 800"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-semibold"
            />
          </div>
        )}

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Activity Log &amp; Stage Notes *</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            required
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
            {submitting ? 'Updating...' : 'Save & Log Stage'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CultivationStageModal;
