import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getReportData = async (req: AuthRequest, res: Response) => {
  try {
    const { reportType = 'contracts', startDate, endDate, format } = req.query as any;

    let filteredContracts = [...dbStore.contracts];
    let filteredHarvests = [...dbStore.harvests];
    let filteredDeliveries = [...dbStore.deliveries];
    let filteredSettlements = [...dbStore.settlements];
    let filteredVisits = [...dbStore.fieldVisits];
    let filteredIssues = [...dbStore.inputIssues];

    // Filter by dates if provided
    if (startDate) {
      const sDate = new Date(startDate);
      filteredContracts = filteredContracts.filter((c) => new Date(c.contractStartDate) >= sDate);
      filteredHarvests = filteredHarvests.filter((h) => new Date(h.harvestDate) >= sDate);
      filteredDeliveries = filteredDeliveries.filter((d) => new Date(d.scheduledDeliveryDate) >= sDate);
      filteredSettlements = filteredSettlements.filter((s) => new Date(s.createdAt) >= sDate);
      filteredVisits = filteredVisits.filter((v) => new Date(v.visitDate) >= sDate);
    }

    if (endDate) {
      const eDate = new Date(endDate);
      filteredContracts = filteredContracts.filter((c) => new Date(c.contractStartDate) <= eDate);
      filteredHarvests = filteredHarvests.filter((h) => new Date(h.harvestDate) <= eDate);
      filteredDeliveries = filteredDeliveries.filter((d) => new Date(d.scheduledDeliveryDate) <= eDate);
      filteredSettlements = filteredSettlements.filter((s) => new Date(s.createdAt) <= eDate);
      filteredVisits = filteredVisits.filter((v) => new Date(v.visitDate) <= eDate);
    }

    // Role-based filtering
    if (req.user?.role === 'farmer') {
      const fId = req.user.associatedId;
      filteredContracts = filteredContracts.filter((c) => c.farmerId === fId);
      filteredHarvests = filteredHarvests.filter((h) => h.farmerId === fId);
      filteredDeliveries = filteredDeliveries.filter((d) => d.farmerId === fId);
      filteredSettlements = filteredSettlements.filter((s) => s.farmerId === fId);
      filteredVisits = filteredVisits.filter((v) => v.farmerId === fId);
      filteredIssues = filteredIssues.filter((i) => i.farmerId === fId);
    } else if (req.user?.role === 'buyer') {
      const bId = req.user.associatedId;
      filteredContracts = filteredContracts.filter((c) => c.buyerId === bId);
      filteredDeliveries = filteredDeliveries.filter((d) => d.buyerId === bId);
      filteredSettlements = filteredSettlements.filter((s) => s.buyerId === bId);
    }

    let reportRows: any[] = [];
    let columns: { key: string; label: string }[] = [];

    switch (reportType) {
      case 'contracts':
        columns = [
          { key: 'contractId', label: 'Contract ID' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'buyerName', label: 'Buyer' },
          { key: 'cropName', label: 'Crop' },
          { key: 'agreedQuantity', label: 'Agreed Qty' },
          { key: 'agreedPricePerUnit', label: 'Unit Price (₹)' },
          { key: 'grossContractValue', label: 'Gross Value (₹)' },
          { key: 'contractStatus', label: 'Status' },
        ];
        reportRows = filteredContracts;
        break;

      case 'harvests':
        columns = [
          { key: 'harvestId', label: 'Harvest ID' },
          { key: 'contractId', label: 'Contract' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'cropName', label: 'Crop' },
          { key: 'actualQuantityHarvested', label: 'Actual Qty (kg)' },
          { key: 'acceptedQuantity', label: 'Accepted (kg)' },
          { key: 'rejectedQuantity', label: 'Rejected (kg)' },
          { key: 'qualityGrade', label: 'Grade' },
        ];
        reportRows = filteredHarvests;
        break;

      case 'deliveries':
        columns = [
          { key: 'deliveryId', label: 'Delivery ID' },
          { key: 'contractId', label: 'Contract' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'buyerName', label: 'Buyer' },
          { key: 'cropName', label: 'Crop' },
          { key: 'deliveredQuantity', label: 'Delivered (kg)' },
          { key: 'acceptedQuantity', label: 'Accepted (kg)' },
          { key: 'deliveryStatus', label: 'Status' },
        ];
        reportRows = filteredDeliveries;
        break;

      case 'settlements':
        columns = [
          { key: 'settlementId', label: 'Settlement ID' },
          { key: 'contractId', label: 'Contract' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'buyerName', label: 'Buyer' },
          { key: 'grossAmount', label: 'Gross (₹)' },
          { key: 'deductions', label: 'Deductions (₹)' },
          { key: 'netPayableAmount', label: 'Net Payable (₹)' },
          { key: 'amountAlreadyPaid', label: 'Paid (₹)' },
          { key: 'outstandingBalance', label: 'Outstanding (₹)' },
          { key: 'settlementStatus', label: 'Status' },
        ];
        reportRows = filteredSettlements;
        break;

      case 'visits':
        columns = [
          { key: 'visitId', label: 'Visit ID' },
          { key: 'fieldOfficerName', label: 'Officer' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'cropGrowthStage', label: 'Growth Stage' },
          { key: 'cropHealthStatus', label: 'Health' },
          { key: 'visitStatus', label: 'Status' },
        ];
        reportRows = filteredVisits;
        break;

      case 'issues':
        columns = [
          { key: 'issueId', label: 'Issue ID' },
          { key: 'farmerName', label: 'Farmer' },
          { key: 'issueCategory', label: 'Category' },
          { key: 'inputName', label: 'Input' },
          { key: 'priority', label: 'Priority' },
          { key: 'status', label: 'Status' },
        ];
        reportRows = filteredIssues;
        break;

      default:
        reportRows = filteredContracts;
    }

    if (format === 'csv') {
      const csvHeader = columns.map((c) => `"${c.label}"`).join(',');
      const csvRows = reportRows.map((row) =>
        columns
          .map((c) => {
            const val = row[c.key] !== undefined ? row[c.key] : '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      );
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="FarmContract_${reportType}_Report.csv"`);
      return res.send(csvContent);
    }

    return res.json({
      success: true,
      reportType,
      columns,
      totalRecords: reportRows.length,
      data: reportRows,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
