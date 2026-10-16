import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Settlement, PaymentTransaction } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import SettlementFormModal from '../components/settlements/SettlementFormModal.tsx';
import PaymentModal from '../components/settlements/PaymentModal.tsx';
import PrintableInvoice from '../components/settlements/PrintableInvoice.tsx';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters.ts';
import { ReceiptText, Search, Plus, CreditCard, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const SettlementsPage: React.FC = () => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<PaymentTransaction[]>([]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await api.settlements.getAll({ search, status: statusFilter });
      setSettlements(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [search, statusFilter]);

  const handleOpenPayment = (s: Settlement) => {
    setSelectedSettlement(s);
    setPaymentModalOpen(true);
  };

  const handleOpenInvoice = async (s: Settlement) => {
    setSelectedSettlement(s);
    try {
      const pRes = await api.payments.getAll({ settlementId: s.settlementId });
      setSelectedPayments(pRes.data?.data || []);
    } catch (err) {
      setSelectedPayments([]);
    }
    setInvoiceModalOpen(true);
  };

  const totalGross = settlements.reduce((sum, s) => sum + (s.grossAmount || 0), 0);
  const totalNet = settlements.reduce((sum, s) => sum + (s.netPayableAmount || 0), 0);
  const totalPaid = settlements.reduce((sum, s) => sum + (s.amountAlreadyPaid || 0), 0);
  const totalOutstanding = settlements.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

  const canPrepare = user?.role === 'admin' || user?.role === 'buyer';
  const canDisburse = user?.role === 'admin' || user?.role === 'buyer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Financial Settlements &amp; Bank Disbursals</h2>
          <p className="text-xs text-stone-500">
            Reconciliation of accepted deliveries against contracted rates, itemized deductions, and banking transactions
          </p>
        </div>

        {canPrepare && (
          <button
            onClick={() => setSettlementModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Prepare Settlement Statement</span>
          </button>
        )}
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Gross Settlement Value</span>
          <div className="text-lg sm:text-xl font-bold text-stone-900 tabular-nums mt-0.5">{formatCurrency(totalGross)}</div>
          <span className="text-[11px] text-stone-500">Produce delivered total</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800">Net Payable Amount</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-950 tabular-nums mt-0.5">{formatCurrency(totalNet)}</div>
          <span className="text-[11px] text-stone-500">Post authorized deductions</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Total Disbursed (Paid)</span>
          <div className="text-lg sm:text-xl font-bold text-emerald-800 tabular-nums mt-0.5">{formatCurrency(totalPaid)}</div>
          <span className="text-[11px] text-stone-500">Transferred via NEFT/RTGS</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-700">Outstanding Balance</span>
          <div className="text-lg sm:text-xl font-bold text-rose-700 tabular-nums mt-0.5">{formatCurrency(totalOutstanding)}</div>
          <span className="text-[11px] text-stone-500">Due to farmers</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settlement ID, farmer, contract, buyer..."
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
            <option value="Approved">Approved</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Settlement ID</th>
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4 text-right">Accepted Qty</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-stone-400">Loading settlements...</td>
                </tr>
              ) : settlements.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-stone-400">No settlement records found.</td>
                </tr>
              ) : (
                settlements.map((s) => (
                  <tr key={s.settlementId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{s.settlementId}</td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-600">{s.contractId}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{s.farmerName}</td>
                    <td className="py-3 px-4 font-medium text-stone-800">{s.buyerName}</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      {formatNumber(s.totalAcceptedQuantity)} kg
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-stone-800">
                      {formatCurrency(s.grossAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-rose-700">
                      {s.deductions > 0 ? `- ${formatCurrency(s.deductions)}` : '₹0'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-950">
                      {formatCurrency(s.netPayableAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-700">
                      {formatCurrency(s.amountAlreadyPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      <span className={s.outstandingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                        {formatCurrency(s.outstandingBalance)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={s.settlementStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenInvoice(s)}
                          title="Print Settlement Statement / Invoice"
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-md transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {canDisburse && s.outstandingBalance > 0 && (
                          <button
                            onClick={() => handleOpenPayment(s)}
                            title="Disburse Payment"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
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

      {/* Global Settlement Form Modal */}
      <SettlementFormModal
        isOpen={settlementModalOpen}
        onClose={() => setSettlementModalOpen(false)}
        onSuccess={fetchSettlements}
      />

      {/* Payment Disbursal Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={fetchSettlements}
        settlement={selectedSettlement}
      />

      {/* Printable Invoice Modal */}
      <PrintableInvoice
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        settlement={selectedSettlement}
        payments={selectedPayments}
      />
    </div>
  );
};

export default SettlementsPage;
