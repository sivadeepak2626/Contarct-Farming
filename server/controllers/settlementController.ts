import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllSettlements = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.settlements];
    const { status, contractId, farmerId, buyerId, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((s) => s.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'buyer') {
      list = list.filter((s) => s.buyerId === req.user?.associatedId);
    }

    if (status && status !== 'All') {
      list = list.filter((s) => s.settlementStatus === status);
    }

    if (contractId && contractId !== 'All') {
      list = list.filter((s) => s.contractId === contractId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((s) => s.farmerId === farmerId);
    }

    if (buyerId && buyerId !== 'All') {
      list = list.filter((s) => s.buyerId === buyerId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.settlementId.toLowerCase().includes(q) ||
          s.farmerName.toLowerCase().includes(q) ||
          s.buyerName.toLowerCase().includes(q) ||
          s.cropName.toLowerCase().includes(q) ||
          s.contractId.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSettlementById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const settlement = dbStore.settlements.find((s) => s.settlementId === id);

    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found.' });
    }

    if (req.user?.role === 'farmer' && settlement.farmerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
    if (req.user?.role === 'buyer' && settlement.buyerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const payments = dbStore.paymentTransactions.filter((p) => p.settlementId === settlement.settlementId);
    const contract = dbStore.contracts.find((c) => c.contractId === settlement.contractId);
    const deliveries = dbStore.deliveries.filter((d) => d.contractId === settlement.contractId);

    return res.json({
      success: true,
      data: {
        ...settlement,
        payments,
        contract,
        deliveries,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const prepareSettlement = async (req: AuthRequest, res: Response) => {
  try {
    const {
      contractId,
      totalAcceptedQuantity,
      deductions = 0,
      deductionReason = '',
      otherAdjustments = 0,
      adjustmentReason = '',
      paymentDueDate,
      approvalNotes = '',
    } = req.body;

    if (!contractId || totalAcceptedQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID and Total Accepted Quantity are required.',
      });
    }

    const contract = dbStore.contracts.find((c) => c.contractId === contractId);
    if (!contract) {
      return res.status(400).json({ success: false, message: 'Referenced contract not found.' });
    }

    const acceptedQty = Number(totalAcceptedQuantity);
    const unitPrice = contract.agreedPricePerUnit;
    const validDeductions = Math.max(0, Number(deductions) || 0);
    const validAdjustments = Number(otherAdjustments) || 0;

    if (validDeductions > 0 && !deductionReason) {
      return res.status(400).json({
        success: false,
        message: 'A clear deduction reason is required when deductions are specified.',
      });
    }

    // Mathematical formula according to specifications:
    // Gross amount = Total accepted quantity × Agreed unit price
    const grossAmount = Math.round(acceptedQty * unitPrice * 100) / 100;

    // Net payable = Gross amount - Valid deductions + Authorized adjustments
    const netPayableAmount = Math.max(0, Math.round((grossAmount - validDeductions + validAdjustments) * 100) / 100);

    // Initial payments are 0
    const amountAlreadyPaid = 0;
    const outstandingBalance = netPayableAmount;

    const nextNum = dbStore.settlements.length + 1;
    const settlementId = `SET-${String(nextNum).padStart(3, '0')}`;

    const newSettlement = {
      settlementId,
      contractId,
      farmerId: contract.farmerId,
      farmerName: contract.farmerName,
      buyerId: contract.buyerId,
      buyerName: contract.buyerName,
      cropName: contract.cropName,
      totalAcceptedQuantity: acceptedQty,
      agreedUnitPrice: unitPrice,
      grossAmount,
      deductions: validDeductions,
      deductionReason: deductionReason ? deductionReason.trim() : undefined,
      authorizedDeductionBy: validDeductions > 0 ? (req.user?.name || 'Administrator') : undefined,
      otherAdjustments: validAdjustments,
      adjustmentReason: adjustmentReason ? adjustmentReason.trim() : undefined,
      netPayableAmount,
      amountAlreadyPaid,
      outstandingBalance,
      paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : new Date(Date.now() + 14 * 86400000),
      settlementStatus: 'Approved' as const,
      approvalNotes: approvalNotes || 'Prepared and approved by contract officer.',
      approvedBy: req.user?.name || 'Administrator',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.settlements.unshift(newSettlement);

    // Add alert notification for farmer and buyer
    dbStore.notifications.unshift({
      notificationId: `NOTIF-${Date.now()}`,
      recipientRole: 'farmer',
      recipientId: contract.farmerId,
      title: `Settlement Prepared for ${contract.cropName}`,
      message: `Settlement ${settlementId} generated. Gross: ₹${grossAmount.toLocaleString('en-IN')}, Net Payable: ₹${netPayableAmount.toLocaleString('en-IN')}.`,
      type: 'settlement',
      priority: 'info',
      link: '/settlements',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Settlement ${settlementId} generated successfully. Gross: ₹${grossAmount.toLocaleString('en-IN')}, Net Payable: ₹${netPayableAmount.toLocaleString('en-IN')}.`,
      data: newSettlement,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettlementStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvalNotes } = req.body;

    const settlement = dbStore.settlements.find((s) => s.settlementId === id);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found.' });
    }

    if (status) settlement.settlementStatus = status;
    if (approvalNotes) settlement.approvalNotes = approvalNotes;
    if (status === 'Approved') {
      settlement.approvedBy = req.user?.name || 'Administrator';
      settlement.approvedAt = new Date();
    }
    settlement.updatedAt = new Date();

    return res.json({
      success: true,
      message: `Settlement status updated to ${status}.`,
      data: settlement,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
