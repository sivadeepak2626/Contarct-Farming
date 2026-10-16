import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role || 'admin';
    const associatedId = req.user?.associatedId;

    if (role === 'admin') {
      const totalFarmers = dbStore.farmers.length;
      const totalBuyers = dbStore.buyers.length;
      const totalOfficers = dbStore.fieldOfficers.length;
      const totalContracts = dbStore.contracts.length;
      const activeContracts = dbStore.contracts.filter((c) => ['Active', 'In Progress'].includes(c.contractStatus));
      const totalGrossContractValue = dbStore.contracts.reduce((sum, c) => sum + c.grossContractValue, 0);

      const cropsCount = dbStore.crops.length;
      const completedVisits = dbStore.fieldVisits.filter((v) => v.visitStatus === 'Completed').length;
      const scheduledVisits = dbStore.fieldVisits.filter((v) => v.visitStatus === 'Scheduled').length;
      const pendingIssues = dbStore.inputIssues.filter((i) => ['Open', 'Under Review', 'Assigned'].includes(i.status)).length;
      const pendingDeliveries = dbStore.deliveries.filter((d) => ['Scheduled', 'In Transit'].includes(d.deliveryStatus)).length;

      const totalSettlements = dbStore.settlements.length;
      const outstandingSettlementsTotal = dbStore.settlements.reduce((sum, s) => sum + s.outstandingBalance, 0);
      const paidSettlementsTotal = dbStore.settlements.reduce((sum, s) => sum + s.amountAlreadyPaid, 0);
      const totalNetPayable = dbStore.settlements.reduce((sum, s) => sum + s.netPayableAmount, 0);

      // Contract status distribution for chart
      const statusCounts: Record<string, number> = {};
      dbStore.contracts.forEach((c) => {
        statusCounts[c.contractStatus] = (statusCounts[c.contractStatus] || 0) + 1;
      });
      const contractStatusChart = Object.keys(statusCounts).map((status) => ({
        status,
        count: statusCounts[status],
      }));

      // Crop-wise contracted quantity for chart
      const cropQty: Record<string, number> = {};
      dbStore.contracts.forEach((c) => {
        cropQty[c.cropName] = (cropQty[c.cropName] || 0) + c.agreedQuantity;
      });
      const cropQuantityChart = Object.keys(cropQty).map((crop) => ({
        crop: crop.split(' (')[0],
        quantity: cropQty[crop],
      }));

      // Monthly harvest performance
      const harvestMonthly: Record<string, { actual: number; accepted: number }> = {
        'Apr 2026': { actual: 25400, accepted: 25000 },
        'May 2026': { actual: 15200, accepted: 14800 },
        'Oct 2026': { actual: 800, accepted: 760 },
      };
      const monthlyHarvestChart = Object.keys(harvestMonthly).map((month) => ({
        month,
        actual: harvestMonthly[month].actual,
        accepted: harvestMonthly[month].accepted,
      }));

      // Delivery progress
      const totalAgreed = dbStore.contracts.reduce((sum, c) => sum + c.agreedQuantity, 0);
      const totalDelivered = dbStore.deliveries.reduce((sum, d) => sum + d.acceptedQuantity, 0);
      const deliveryProgress = {
        totalAgreed,
        totalDelivered,
        percentage: totalAgreed > 0 ? Math.round((totalDelivered / totalAgreed) * 100) : 0,
      };

      // Recent activities
      const recentActivities = [
        ...dbStore.paymentTransactions.slice(0, 3).map((p) => ({
          type: 'payment',
          title: `Payment of ₹${p.amount.toLocaleString('en-IN')} recorded`,
          subtitle: `${p.farmerName} · Ref: ${p.referenceNumber}`,
          date: p.paymentDate,
        })),
        ...dbStore.deliveries.slice(0, 3).map((d) => ({
          type: 'delivery',
          title: `Delivery of ${d.acceptedQuantity} ${d.unit} verified`,
          subtitle: `${d.cropName} from ${d.farmerName}`,
          date: d.actualDeliveryDate || d.scheduledDeliveryDate,
        })),
        ...dbStore.fieldVisits.slice(0, 3).map((v) => ({
          type: 'visit',
          title: `Field inspection by ${v.fieldOfficerName}`,
          subtitle: `${v.farmerName} (${v.cropGrowthStage})`,
          date: v.visitDate,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

      return res.json({
        success: true,
        role: 'admin',
        metrics: {
          totalFarmers,
          totalBuyers,
          totalOfficers,
          totalContracts,
          activeContractsCount: activeContracts.length,
          totalGrossContractValue,
          cropsCount,
          completedVisits,
          scheduledVisits,
          pendingIssues,
          pendingDeliveries,
          totalSettlements,
          outstandingSettlementsTotal,
          paidSettlementsTotal,
          totalNetPayable,
          deliveryProgress,
        },
        charts: {
          contractStatusChart,
          cropQuantityChart,
          monthlyHarvestChart,
        },
        recentActivities,
      });
    }

    if (role === 'farmer') {
      const farmer = dbStore.farmers.find((f) => f.farmerId === associatedId || f.email.toLowerCase() === req.user?.email.toLowerCase());
      const farmerId = farmer?.farmerId || associatedId || 'FARM-001';

      const myContracts = dbStore.contracts.filter((c) => c.farmerId === farmerId);
      const myCultivations = dbStore.cultivations.filter((cl) => cl.farmerId === farmerId);
      const myVisits = dbStore.fieldVisits.filter((v) => v.farmerId === farmerId);
      const myIssues = dbStore.inputIssues.filter((i) => i.farmerId === farmerId);
      const myHarvests = dbStore.harvests.filter((h) => h.farmerId === farmerId);
      const myDeliveries = dbStore.deliveries.filter((d) => d.farmerId === farmerId);
      const mySettlements = dbStore.settlements.filter((s) => s.farmerId === farmerId);

      const totalContractValue = myContracts.reduce((sum, c) => sum + c.grossContractValue, 0);
      const totalEarned = mySettlements.reduce((sum, s) => sum + s.amountAlreadyPaid, 0);
      const pendingPayout = mySettlements.reduce((sum, s) => sum + s.outstandingBalance, 0);
      const totalHarvestedKg = myHarvests.reduce((sum, h) => sum + h.actualQuantityHarvested, 0);
      const totalDeliveredKg = myDeliveries.reduce((sum, d) => sum + d.acceptedQuantity, 0);

      return res.json({
        success: true,
        role: 'farmer',
        farmerInfo: farmer,
        metrics: {
          activeContractsCount: myContracts.filter((c) => ['Active', 'In Progress'].includes(c.contractStatus)).length,
          totalContracts: myContracts.length,
          totalContractValue,
          totalEarned,
          pendingPayout,
          totalHarvestedKg,
          totalDeliveredKg,
          cultivationsCount: myCultivations.length,
          upcomingVisitsCount: myVisits.filter((v) => v.visitStatus === 'Scheduled').length,
          openIssuesCount: myIssues.filter((i) => ['Open', 'Under Review', 'Assigned'].includes(i.status)).length,
        },
        contracts: myContracts,
        cultivations: myCultivations,
        visits: myVisits,
        issues: myIssues,
        settlements: mySettlements,
      });
    }

    if (role === 'buyer') {
      const buyer = dbStore.buyers.find((b) => b.buyerId === associatedId || b.email.toLowerCase() === req.user?.email.toLowerCase());
      const buyerId = buyer?.buyerId || associatedId || 'BUY-001';

      const myContracts = dbStore.contracts.filter((c) => c.buyerId === buyerId);
      const contractIds = myContracts.map((c) => c.contractId);
      const myDeliveries = dbStore.deliveries.filter((d) => d.buyerId === buyerId || contractIds.includes(d.contractId));
      const mySettlements = dbStore.settlements.filter((s) => s.buyerId === buyerId || contractIds.includes(s.contractId));

      const totalContractedQuantity = myContracts.reduce((sum, c) => sum + c.agreedQuantity, 0);
      const totalDeliveredQuantity = myDeliveries.reduce((sum, d) => sum + d.acceptedQuantity, 0);
      const pendingDeliveriesQuantity = Math.max(0, totalContractedQuantity - totalDeliveredQuantity);
      const totalPayable = mySettlements.reduce((sum, s) => sum + s.netPayableAmount, 0);
      const totalPaid = mySettlements.reduce((sum, s) => sum + s.amountAlreadyPaid, 0);
      const outstandingPayable = mySettlements.reduce((sum, s) => sum + s.outstandingBalance, 0);

      return res.json({
        success: true,
        role: 'buyer',
        buyerInfo: buyer,
        metrics: {
          activeContractsCount: myContracts.filter((c) => ['Active', 'In Progress'].includes(c.contractStatus)).length,
          totalContracts: myContracts.length,
          totalContractedQuantity,
          totalDeliveredQuantity,
          pendingDeliveriesQuantity,
          deliveryFulfillmentPercent: totalContractedQuantity > 0 ? Math.round((totalDeliveredQuantity / totalContractedQuantity) * 100) : 0,
          totalPayable,
          totalPaid,
          outstandingPayable,
        },
        contracts: myContracts,
        deliveries: myDeliveries,
        settlements: mySettlements,
      });
    }

    if (role === 'officer') {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === associatedId || o.email.toLowerCase() === req.user?.email.toLowerCase());
      const officerId = officer?.officerId || associatedId || 'FO-001';

      const assignedFarmers = dbStore.farmers.filter(
        (f) => officer?.assignedFarmerIds.includes(f.farmerId) || f.assignedFieldOfficerId === officerId
      );
      const assignedContracts = dbStore.contracts.filter((c) => c.fieldOfficerId === officerId);
      const myVisits = dbStore.fieldVisits.filter((v) => v.fieldOfficerId === officerId);
      const myIssues = dbStore.inputIssues.filter((i) => i.assignedFieldOfficerId === officerId);

      const scheduledVisits = myVisits.filter((v) => v.visitStatus === 'Scheduled');
      const completedVisits = myVisits.filter((v) => v.visitStatus === 'Completed');
      const unresolvedIssues = myIssues.filter((i) => ['Open', 'Under Review', 'Assigned'].includes(i.status));

      return res.json({
        success: true,
        role: 'officer',
        officerInfo: officer,
        metrics: {
          assignedFarmersCount: assignedFarmers.length,
          assignedContractsCount: assignedContracts.length,
          scheduledVisitsCount: scheduledVisits.length,
          completedVisitsCount: completedVisits.length,
          unresolvedIssuesCount: unresolvedIssues.length,
        },
        assignedFarmers,
        scheduledVisits,
        unresolvedIssues,
        recentVisits: myVisits.slice(0, 5),
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
