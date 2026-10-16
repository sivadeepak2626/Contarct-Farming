import React from 'react';
import StatCard from '../common/StatCard.tsx';
import Badge from '../common/Badge.tsx';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters.ts';
import {
  FileSignature,
  Truck,
  ReceiptText,
  Building2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BuyerDashboardProps {
  stats: any;
  onOpenContractModal: () => void;
  onOpenDeliveryModal: () => void;
  onOpenSettlementModal: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  stats,
  onOpenContractModal,
  onOpenDeliveryModal,
  onOpenSettlementModal,
}) => {
  const metrics = stats?.metrics || {};
  const buyer = stats?.buyerInfo;
  const contracts = stats?.contracts || [];
  const deliveries = stats?.deliveries || [];
  const settlements = stats?.settlements || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#143224] to-[#1b4332] text-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white/20 rounded-md">
            Agribusiness Buyer Procurement Desk
          </span>
          <h2 className="text-xl font-bold mt-1.5 tracking-tight">
            {buyer?.companyName || 'AgroCorp Foods India Pvt Ltd'}
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Procurement Lead: {buyer?.contactPerson} &middot; Preferred Crops: {buyer?.preferredCrops?.join(', ') || 'Paddy, Wheat, Maize'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenContractModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#143224] bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Buy Contract</span>
          </button>
          <button
            onClick={onOpenDeliveryModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700/60 hover:bg-emerald-700 rounded-lg border border-white/20 transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Accept Delivery</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Sourcing Contracts"
          value={metrics.activeContractsCount || 0}
          subtext={`Of ${metrics.totalContracts || 0} total executed`}
          icon={<FileSignature className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Contracted Volume"
          value={`${formatNumber(metrics.totalContractedQuantity)} kg`}
          subtext="Total harvest buyout target"
          icon={<Building2 className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Received Volume"
          value={`${formatNumber(metrics.totalDeliveredQuantity)} kg`}
          subtext={`${metrics.deliveryFulfillmentPercent || 0}% fulfillment rate`}
          icon={<Truck className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          title="Outstanding Payable"
          value={formatCurrency(metrics.outstandingPayable)}
          subtext={`${formatCurrency(metrics.totalPaid)} disbursed`}
          icon={<ReceiptText className="w-5 h-5 text-rose-700" />}
        />
      </div>

      {/* Contracts & Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Sourcing Contracts */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Contracted Farming Supply</h3>
            <Link to="/contracts" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {contracts.map((c: any) => (
              <div key={c.contractId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">{c.contractId} &middot; {c.cropName}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Farmer: <span className="font-medium text-stone-800">{c.farmerName}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Agreed: {formatNumber(c.agreedQuantity)} {c.unitOfMeasurement} @ ₹{c.agreedPricePerUnit}/kg
                  </div>
                </div>
                <div className="text-right">
                  <Badge status={c.contractStatus} />
                  <div className="font-bold text-emerald-900 mt-1 tabular-nums">
                    {formatCurrency(c.grossContractValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Deliveries */}
        <div className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Recent Produce Deliveries</h3>
            <Link to="/deliveries" className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {deliveries.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No delivery logs recorded yet.</p>
            ) : (
              deliveries.slice(0, 4).map((d: any) => (
                <div key={d.deliveryId} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{d.deliveryId} &middot; {d.cropName}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      From: {d.farmerName} &middot; Location: {d.deliveryLocation}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Delivered: {formatNumber(d.deliveredQuantity)} kg &middot; Accepted: <strong className="text-emerald-800">{formatNumber(d.acceptedQuantity)} kg</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge status={d.deliveryStatus} />
                    <div className="text-[11px] text-stone-400 mt-1">
                      {formatDate(d.actualDeliveryDate || d.scheduledDeliveryDate)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
