import React, { useState } from 'react';
import Modal from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { Settlement } from '../../types/index.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settlement: Settlement | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settlement,
}) => {
  const [amount, setAmount] = useState('10000');
  const [paymentMode, setPaymentMode] = useState<'NEFT' | 'RTGS' | 'UPI' | 'Direct Bank Transfer' | 'Cheque'>('NEFT');
  const [referenceNumber, setReferenceNumber] = useState(`NEFT-HDFC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [remarks, setRemarks] = useState('Direct bank transfer to farmer account against accepted harvest delivery');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!settlement) return null;

  const payAmount = parseFloat(amount) || 0;
  const balanceAfterPayment = Math.max(0, settlement.outstandingBalance - payAmount);
  const isOverBalance = payAmount > settlement.outstandingBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (isOverBalance) {
      setError(`Payment cannot exceed current outstanding balance (${formatCurrency(settlement.outstandingBalance)}).`);
      return;
    }

    if (!referenceNumber.trim()) {
      setError('Please provide a valid banking reference / transaction number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.payments.record({
        settlementId: settlement.settlementId,
        amount: payAmount,
        paymentMode,
        referenceNumber: referenceNumber.trim(),
        remarks,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment Disbursement"
      subtitle={`Settlement ID: ${settlement.settlementId} · Beneficiary: ${settlement.farmerName}`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Financial State Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-center">
        <div>
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Net Payable</span>
          <div className="font-bold text-stone-900 tabular-nums text-sm">
            {formatCurrency(settlement.netPayableAmount)}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Already Paid</span>
          <div className="font-bold text-emerald-800 tabular-nums text-sm">
            {formatCurrency(settlement.amountAlreadyPaid)}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-stone-500 uppercase font-semibold">Balance Due</span>
          <div className="font-bold text-rose-800 tabular-nums text-sm">
            {formatCurrency(settlement.outstandingBalance)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Payment Amount (₹) *</label>
          <input
            type="number"
            step="100"
            min="1"
            max={settlement.outstandingBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden tabular-nums font-bold text-stone-900 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Payment Mode *</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="NEFT">NEFT (Electronic Transfer)</option>
              <option value="RTGS">RTGS (High Value Transfer)</option>
              <option value="UPI">UPI Instant Pay</option>
              <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              <option value="Cheque">Bank Demand Cheque</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Transaction Ref Number *</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR / Transaction No"
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Remarks &amp; Audit Reference</label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Balance After Payment Preview */}
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
          <span className="font-medium text-emerald-900">Remaining Balance Post Payment:</span>
          <span className="font-bold text-emerald-950 text-sm tabular-nums">
            {formatCurrency(balanceAfterPayment)}
          </span>
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
            disabled={submitting || isOverBalance}
            className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Confirm & Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
