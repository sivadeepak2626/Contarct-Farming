import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Delivery } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import DeliveryFormModal from '../components/deliveries/DeliveryFormModal.tsx';
import { formatNumber, formatDate } from '../utils/formatters.ts';
import { Truck, Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const DeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.deliveries.getAll({ search });
      setDeliveries(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [search]);

  const totalDelivered = deliveries.reduce((sum, d) => sum + (d.deliveredQuantity || 0), 0);
  const totalAccepted = deliveries.reduce((sum, d) => sum + (d.acceptedQuantity || 0), 0);
  const completedCount = deliveries.filter((d) => d.deliveryStatus === 'Delivered').length;

  const canCreate = user?.role === 'admin' || user?.role === 'farmer' || user?.role === 'buyer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Produce Deliveries &amp; Logistics</h2>
          <p className="text-xs text-stone-500">
            Farm-to-buyer warehouse dispatches, weighbridge receipts, and acceptance tracking
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Delivery</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-stone-400">Total Delivered Volume</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-0.5">{formatNumber(totalDelivered)} kg</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-emerald-700">Accepted by Buyers</span>
            <div className="text-xl font-bold text-emerald-900 tabular-nums mt-0.5">{formatNumber(totalAccepted)} kg</div>
          </div>
          <div className="text-xs font-semibold text-emerald-700">
            {totalDelivered > 0 ? Math.round((totalAccepted / totalDelivered) * 100) : 0}% Acceptance Rate
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-semibold text-stone-500">Completed Dispatches</span>
            <div className="text-xl font-bold text-stone-900 tabular-nums mt-0.5">{completedCount} Lots</div>
          </div>
          <div className="text-xs text-stone-500">Verified receipts</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search delivery ID, crop, farmer, buyer, warehouse..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Delivery ID</th>
                <th className="py-3 px-4">Contract ID</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Buyer Entity</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4 text-right">Delivered</th>
                <th className="py-3 px-4 text-right">Accepted</th>
                <th className="py-3 px-4">Destination Warehouse</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">Loading deliveries...</td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">No delivery logs recorded.</td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.deliveryId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{d.deliveryId}</td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-600">{d.contractId}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{d.farmerName}</td>
                    <td className="py-3 px-4 font-medium text-stone-800">{d.buyerName}</td>
                    <td className="py-3 px-4 font-medium text-emerald-900">{d.cropName}</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-stone-900">
                      {formatNumber(d.deliveredQuantity)} {d.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-emerald-800">
                      {formatNumber(d.acceptedQuantity)} {d.unit}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-stone-600">
                      {d.deliveryLocation}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(d.actualDeliveryDate || d.scheduledDeliveryDate)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={d.deliveryStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDeliveries}
      />
    </div>
  );
};

export default DeliveriesPage;
