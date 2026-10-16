import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Farmer, Buyer, Crop, FieldOfficer } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [farmerId, setFarmerId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [cropId, setCropId] = useState('');
  const [fieldOfficerId, setFieldOfficerId] = useState('');
  const [farmingSeason, setFarmingSeason] = useState('Kharif 2026');
  const [landArea, setLandArea] = useState('5.0');
  const [agreedQuantity, setAgreedQuantity] = useState('1000');
  const [agreedPrice, setAgreedPrice] = useState('30');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  );
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    new Date(Date.now() + 105 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState(
    '50% within 7 days of verified delivery, remaining post final quality clearance.'
  );
  const [qualityStandards, setQualityStandards] = useState(
    'Grade A commercial, moisture < 12%, unbroken grain > 95%.'
  );
  const [additionalTerms, setAdditionalTerms] = useState(
    'Transportation costs borne by Buyer upon factory gate delivery.'
  );

  useEffect(() => {
    if (isOpen) {
      const loadDependencies = async () => {
        setLoading(true);
        try {
          const [fRes, bRes, cRes, oRes] = await Promise.all([
            api.farmers.getAll(),
            api.buyers.getAll(),
            api.crops.getAll(),
            api.officers.getAll(),
          ]);

          const fData = fRes.data?.data || [];
          const bData = bRes.data?.data || [];
          const cData = cRes.data?.data || [];
          const oData = oRes.data?.data || [];

          setFarmers(fData);
          setBuyers(bData);
          setCrops(cData);
          setOfficers(oData);

          if (fData.length > 0) setFarmerId(fData[0].farmerId);
          if (bData.length > 0) setBuyerId(bData[0].buyerId);
          if (cData.length > 0) setCropId(cData[0].cropId);
          if (oData.length > 0) setFieldOfficerId(oData[0].officerId);
        } catch (err: any) {
          setError('Failed to load dependency data.');
        } finally {
          setLoading(false);
        }
      };

      loadDependencies();
    }
  }, [isOpen]);

  const qty = parseFloat(agreedQuantity) || 0;
  const price = parseFloat(agreedPrice) || 0;
  // Automatically calculated: Gross Contract Value = Agreed Quantity * Agreed Price Per Unit
  const grossContractValue = Math.round(qty * price * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId || !buyerId || !cropId || qty <= 0 || price <= 0) {
      setError('Please provide all mandatory details with valid quantities and prices.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.contracts.create({
        farmerId,
        buyerId,
        cropId,
        fieldOfficerId: fieldOfficerId || undefined,
        farmingSeason,
        cultivatedLandAreaAcres: parseFloat(landArea) || 1,
        agreedQuantity: qty,
        unitOfMeasurement: 'kg',
        agreedPricePerUnit: price,
        contractStartDate: startDate,
        expectedHarvestDate,
        contractEndDate: deliveryDeadline,
        deliveryDeadline,
        paymentTerms,
        qualityStandards,
        additionalTerms,
        contractStatus: 'Active',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create contract.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Farming Contract"
      subtitle="Register an official tripartite contract between Farmer, Corporate Buyer, and Field Officer"
      maxWidth="2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-stone-500">Loading catalog references...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Party Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contract Farmer *</label>
              <select
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              >
                {farmers.map((f) => (
                  <option key={f.farmerId} value={f.farmerId}>
                    {f.fullName} ({f.farmerId} - {f.village}, {f.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Buyer / Company *</label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              >
                {buyers.map((b) => (
                  <option key={b.buyerId} value={b.buyerId}>
                    {b.companyName} ({b.buyerId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop & Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Crop to Cultivate *</label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              >
                {crops.map((c) => (
                  <option key={c.cropId} value={c.cropId}>
                    {c.cropName} ({c.cropCategory})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Assigned Field Officer</label>
              <select
                value={fieldOfficerId}
                onChange={(e) => setFieldOfficerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="">-- Unassigned --</option>
                {officers.map((o) => (
                  <option key={o.officerId} value={o.officerId}>
                    {o.name} ({o.assignedRegion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Farming Season *</label>
              <input
                type="text"
                value={farmingSeason}
                onChange={(e) => setFarmingSeason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                placeholder="e.g. Kharif 2026"
                required
              />
            </div>
          </div>

          {/* Quantities & Price Calculation */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-3">
            <div className="font-semibold text-emerald-950">Agreed Quantities &amp; Financial Terms</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Cultivated Land (Acres) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Agreed Quantity (kg) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={agreedQuantity}
                  onChange={(e) => setAgreedQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Agreed Price Per kg (₹) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums"
                  required
                />
              </div>
            </div>

            {/* Live Automated Valuation Banner */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-300 shadow-xs">
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-wider text-stone-500">
                  Automated Calculation:
                </span>
                <div className="text-xs text-stone-600">
                  {qty.toLocaleString('en-IN')} kg &times; ₹{price.toLocaleString('en-IN')} / kg
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-800 font-medium">Gross Contract Value</span>
                <div className="text-lg font-bold text-emerald-900 tabular-nums">
                  {formatCurrency(grossContractValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contract Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Expected Harvest Date *</label>
              <input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Delivery Deadline *</label>
              <input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Terms & Quality */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Quality Standards *</label>
              <input
                type="text"
                value={qualityStandards}
                onChange={(e) => setQualityStandards(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Payment Terms *</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Additional Terms</label>
              <textarea
                rows={2}
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
              {submitting ? 'Creating Contract...' : 'Authorize & Sign Contract'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContractFormModal;
