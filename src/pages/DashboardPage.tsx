import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import AdminDashboard from '../components/dashboard/AdminDashboard.tsx';
import FarmerDashboard from '../components/dashboard/FarmerDashboard.tsx';
import BuyerDashboard from '../components/dashboard/BuyerDashboard.tsx';
import OfficerDashboard from '../components/dashboard/OfficerDashboard.tsx';

// Modals
import ContractFormModal from '../components/contracts/ContractFormModal.tsx';
import HarvestFormModal from '../components/harvests/HarvestFormModal.tsx';
import DeliveryFormModal from '../components/deliveries/DeliveryFormModal.tsx';
import SettlementFormModal from '../components/settlements/SettlementFormModal.tsx';
import IssueFormModal from '../components/issues/IssueFormModal.tsx';
import VisitFormModal from '../components/visits/VisitFormModal.tsx';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal Triggers
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [harvestModalOpen, setHarvestModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.dashboard.getStats();
      if (res.data?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-stone-500 text-xs">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard analytics...</span>
        </div>
      </div>
    );
  }

  const role = user?.role || 'admin';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {role === 'admin' && (
        <AdminDashboard
          stats={stats}
          onOpenContractModal={() => setContractModalOpen(true)}
          onOpenHarvestModal={() => setHarvestModalOpen(true)}
          onOpenDeliveryModal={() => setDeliveryModalOpen(true)}
          onOpenSettlementModal={() => setSettlementModalOpen(true)}
        />
      )}

      {role === 'farmer' && (
        <FarmerDashboard
          stats={stats}
          onOpenIssueModal={() => setIssueModalOpen(true)}
          onOpenHarvestModal={() => setHarvestModalOpen(true)}
        />
      )}

      {role === 'buyer' && (
        <BuyerDashboard
          stats={stats}
          onOpenContractModal={() => setContractModalOpen(true)}
          onOpenDeliveryModal={() => setDeliveryModalOpen(true)}
          onOpenSettlementModal={() => setSettlementModalOpen(true)}
        />
      )}

      {role === 'officer' && (
        <OfficerDashboard
          stats={stats}
          onOpenVisitModal={() => setVisitModalOpen(true)}
          onOpenHarvestModal={() => setHarvestModalOpen(true)}
        />
      )}

      {/* Global Modals */}
      <ContractFormModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onSuccess={fetchStats}
      />
      <HarvestFormModal
        isOpen={harvestModalOpen}
        onClose={() => setHarvestModalOpen(false)}
        onSuccess={fetchStats}
      />
      <DeliveryFormModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        onSuccess={fetchStats}
      />
      <SettlementFormModal
        isOpen={settlementModalOpen}
        onClose={() => setSettlementModalOpen(false)}
        onSuccess={fetchStats}
      />
      <IssueFormModal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onSuccess={fetchStats}
      />
      <VisitFormModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
};

export default DashboardPage;
