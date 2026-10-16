import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Contract } from '../../types/index.ts';

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState('');
  const [category, setCategory] = useState<'Seeds' | 'Fertilizer' | 'Pesticides' | 'Irrigation' | 'Equipment' | 'Other'>('Fertilizer');
  const [inputName, setInputName] = useState('Agricultural Gypsum (Calcium Sulphate)');
  const [quantityRequired, setQuantityRequired] = useState('200 kg');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [description, setDescription] = useState('Pegging stage in progress. Need quick replenishment for optimal shell development.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !inputName.trim() || !description.trim()) {
      setError('Please provide contract, input name, and detailed description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.issues.create({
        contractId,
        farmerId: selectedContract?.farmerId,
        cropName: selectedContract?.cropName,
        issueCategory: category,
        inputName,
        quantityRequired,
        priority,
        description,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Agricultural Input Issue"
      subtitle="Escalate shortage or defect in seeds, bio-fertilizers, pesticides, or irrigation hardware"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
                {c.contractId} - {c.cropName} ({c.farmerName})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Issue Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Seeds">Seeds &amp; Germination</option>
              <option value="Fertilizer">Fertilizer &amp; Nutrients</option>
              <option value="Pesticides">Pesticides &amp; Protection</option>
              <option value="Irrigation">Irrigation Supplies &amp; Drip</option>
              <option value="Equipment">Farming Equipment</option>
              <option value="Other">Other Agronomic Inputs</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Priority Level *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High (Impacting growth)</option>
              <option value="Critical">Critical (Immediate crop loss risk)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Input / Material Name *</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. Bio-Neem 1500ppm"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Quantity Required</label>
            <input
              type="text"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(e.target.value)}
              placeholder="e.g. 5 Litres, 20 bags"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Problem Description &amp; Urgency *</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            placeholder="Explain symptoms, affected plot acreage, and urgency..."
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
            {submitting ? 'Submitting...' : 'Report Input Issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueFormModal;
