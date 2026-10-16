import React from 'react';
import Modal from '../common/Modal.tsx';
import { Settlement, PaymentTransaction } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';
import { Printer, Sprout } from 'lucide-react';

interface PrintableInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement | null;
  payments: PaymentTransaction[];
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  isOpen,
  onClose,
  settlement,
  payments,
}) => {
  if (!settlement) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Settlement Statement &amp; Payment Receipt"
      subtitle="Generated according to National Model Contract Farming Framework"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs text-stone-800" id="printable-statement">
        {/* Printable Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-300">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#1b4332] text-white flex items-center justify-center font-bold">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1b4332] tracking-tight">FarmContract</h2>
              <p className="text-[11px] text-stone-500">Contract Farming Settlement Statement</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-stone-900 text-sm">{settlement.settlementId}</div>
            <div className="text-[11px] text-stone-500">Date: {formatDate(settlement.approvedAt || new Date())}</div>
            <div className="text-[11px] text-emerald-800 font-semibold uppercase">{settlement.settlementStatus}</div>
          </div>
        </div>

        {/* Parties Box */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Farmer (Producer)</span>
            <div className="font-bold text-stone-900 text-sm mt-0.5">{settlement.farmerName}</div>
            <div className="text-[11px] text-stone-600">ID: {settlement.farmerId}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Corporate Buyer</span>
            <div className="font-bold text-stone-900 text-sm mt-0.5">{settlement.buyerName}</div>
            <div className="text-[11px] text-stone-600">ID: {settlement.buyerId}</div>
          </div>
        </div>

        {/* Contract & Produce Details */}
        <table className="w-full text-left border-collapse border border-stone-200">
          <thead>
            <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
              <th className="p-2.5">Contract ID</th>
              <th className="p-2.5">Crop Variety</th>
              <th className="p-2.5 text-right">Accepted Qty (kg)</th>
              <th className="p-2.5 text-right">Unit Price (₹)</th>
              <th className="p-2.5 text-right">Gross Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-100">
              <td className="p-2.5 font-mono font-medium">{settlement.contractId}</td>
              <td className="p-2.5">{settlement.cropName}</td>
              <td className="p-2.5 text-right tabular-nums">{settlement.totalAcceptedQuantity.toLocaleString('en-IN')}</td>
              <td className="p-2.5 text-right tabular-nums">₹{settlement.agreedUnitPrice}</td>
              <td className="p-2.5 text-right font-bold tabular-nums">{formatCurrency(settlement.grossAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Reconciliation Ledger */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 p-3 bg-stone-50/70 rounded-lg border border-stone-200">
            <div className="flex justify-between py-0.5">
              <span className="text-stone-600">Gross Settlement Value:</span>
              <span className="font-bold tabular-nums">{formatCurrency(settlement.grossAmount)}</span>
            </div>

            {settlement.deductions > 0 && (
              <div className="flex justify-between py-0.5 text-rose-700">
                <span>Deductions ({settlement.deductionReason || 'Authorized fee'}):</span>
                <span className="font-bold tabular-nums">- {formatCurrency(settlement.deductions)}</span>
              </div>
            )}

            {settlement.otherAdjustments !== 0 && (
              <div className="flex justify-between py-0.5 text-emerald-800">
                <span>Adjustments / Bonus:</span>
                <span className="font-bold tabular-nums">+ {formatCurrency(settlement.otherAdjustments)}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-t border-b border-stone-300 font-bold text-stone-900 text-sm">
              <span>Net Payable Amount:</span>
              <span className="tabular-nums">{formatCurrency(settlement.netPayableAmount)}</span>
            </div>

            <div className="flex justify-between py-0.5 text-emerald-800 font-medium">
              <span>Total Amount Disbursed:</span>
              <span className="font-bold tabular-nums">{formatCurrency(settlement.amountAlreadyPaid)}</span>
            </div>

            <div className="flex justify-between py-1 font-bold text-stone-900 text-sm">
              <span>Outstanding Balance Due:</span>
              <span className={`tabular-nums ${settlement.outstandingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {formatCurrency(settlement.outstandingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Payments Trail */}
        {payments.length > 0 && (
          <div>
            <h4 className="font-bold text-stone-900 mb-2">Recorded Payment Receipts</h4>
            <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg overflow-hidden">
              {payments.map((p) => (
                <div key={p.transactionId} className="p-2.5 flex items-center justify-between bg-white text-[11px]">
                  <div>
                    <span className="font-bold text-stone-900">{p.transactionId}</span> &middot; {p.paymentMode} &middot; Ref: {p.referenceNumber}
                    <div className="text-stone-500">{p.remarks}</div>
                  </div>
                  <div className="text-right font-bold text-emerald-800 tabular-nums">
                    {formatCurrency(p.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[10px] text-stone-500 border-t border-stone-200">
          <div>
            <div className="h-10 border-b border-stone-300 mb-1" />
            <span>Authorized Buyer Signature</span>
          </div>
          <div>
            <div className="h-10 border-b border-stone-300 mb-1" />
            <span>Farmer Producer Signature</span>
          </div>
          <div>
            <div className="h-10 border-b border-stone-300 mb-1" />
            <span>Field Officer / Admin Auditor</span>
          </div>
        </div>

        {/* Print / Close Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement / PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintableInvoice;
