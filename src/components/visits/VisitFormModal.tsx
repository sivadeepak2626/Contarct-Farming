import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Contract, FieldOfficer } from '../../types/index.ts';

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultContractId?: string;
}

export const VisitFormModal: React.FC<VisitFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultContractId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [contractId, setContractId] = useState('');
  const [fieldOfficerId, setFieldOfficerId] = useState('');
  const [visitType, setVisitType] = useState<'Routine' | 'Pest Inspection' | 'Input Verification' | 'Pre-Harvest' | 'Emergency'>('Routine');
  const [cropGrowthStage, setCropGrowthStage] = useState('Growing (Tillering Stage)');
  const [cropHealthStatus, setCropHealthStatus] = useState<'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical'>('Good');
  const [weatherObservations, setWeatherObservations] = useState('Sunny, 31°C, 65% humidity');
  const [irrigationStatus, setIrrigationStatus] = useState<'Adequate' | 'Deficit' | 'Excess' | 'Optimal'>('Adequate');
  const [pestObservations, setPestObservations] = useState('Minor aphid presence on leaf margins');
  const [fertilizerObservations, setFertilizerObservations] = useState('Basal dose verified. Bio-stimulant spray recommended');
  const [recommendations, setRecommendations] = useState('Apply neem extract 1500 ppm at dusk. Maintain 5cm water level in field.');
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [cRes, oRes] = await Promise.all([api.contracts.getAll(), api.officers.getAll()]);
          const cData = cRes.data?.data || [];
          const oData = oRes.data?.data || [];
          setContracts(cData);
          setOfficers(oData);
          if (defaultContractId) {
            setContractId(defaultContractId);
          } else if (cData.length > 0) {
            setContractId(cData[0].contractId);
          }
          if (oData.length > 0) {
            setFieldOfficerId(oData[0].officerId);
          }
        } catch (err) {
          setError('Failed to load contract references.');
        }
      };
      loadData();
    }
  }, [isOpen, defaultContractId]);

  const selectedContract = contracts.find((c) => c.contractId === contractId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !cropGrowthStage || !recommendations) {
      setError('Please provide contract, crop growth stage, and agronomic recommendations.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.visits.create({
        contractId,
        farmerId: selectedContract?.farmerId,
        fieldOfficerId,
        visitType,
        cropGrowthStage,
        cropHealthStatus,
        weatherObservations,
        irrigationStatus,
        pestOrDiseaseObservations: pestObservations,
        fertilizerAndInputObservations: fertilizerObservations,
        recommendations,
        followUpDate,
        visitStatus: 'Completed',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record visit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Field Officer Inspection Visit"
      subtitle="Log crop growth status, pest monitoring, agronomic inputs, and scheduled follow-ups"
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Contract / Farm *</label>
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

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Visiting Field Officer</label>
            <select
              value={fieldOfficerId}
              onChange={(e) => setFieldOfficerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              {officers.map((o) => (
                <option key={o.officerId} value={o.officerId}>
                  {o.name} ({o.assignedRegion})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Visit Type</label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Routine">Routine Inspection</option>
              <option value="Pest Inspection">Pest / Disease Diagnosis</option>
              <option value="Input Verification">Input Verification</option>
              <option value="Pre-Harvest">Pre-Harvest Clearance</option>
              <option value="Emergency">Emergency Callout</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Crop Growth Stage *</label>
            <input
              type="text"
              value={cropGrowthStage}
              onChange={(e) => setCropGrowthStage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Overall Health</label>
            <select
              value={cropHealthStatus}
              onChange={(e) => setCropHealthStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Moderate">Moderate</option>
              <option value="Poor">Poor</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Irrigation Status</label>
            <select
              value={irrigationStatus}
              onChange={(e) => setIrrigationStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="Adequate">Adequate</option>
              <option value="Optimal">Optimal</option>
              <option value="Deficit">Deficit (Moisture stress)</option>
              <option value="Excess">Excess (Waterlogging)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Scheduled Follow-Up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Pest &amp; Disease Observations</label>
          <input
            type="text"
            value={pestObservations}
            onChange={(e) => setPestObservations(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Fertilizer &amp; Input Observations</label>
          <input
            type="text"
            value={fertilizerObservations}
            onChange={(e) => setFertilizerObservations(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Agronomist Recommendations *</label>
          <textarea
            rows={2}
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
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
            {submitting ? 'Submitting...' : 'Save Field Visit Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VisitFormModal;
