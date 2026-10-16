import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.paymentTransactions];
    const { settlementId, farmerId, buyerId, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((p) => p.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'buyer') {
      list = list.filter((p) => p.buyerId === req.user?.associatedId);
    }

    if (settlementId && settlementId !== 'All') {
      list = list.filter((p) => p.settlementId === settlementId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((p) => p.farmerId === farmerId);
    }

    if (buyerId && buyerId !== 'All') {
      list = list.filter((p) => p.buyerId === buyerId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.transactionId.toLowerCase().includes(q) ||
          p.referenceNumber.toLowerCase().includes(q) ||
          p.farmerName.toLowerCase().includes(q) ||
          p.buyerName.toLowerCase().includes(q)
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

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { settlementId, amount, paymentMode = 'NEFT', referenceNumber, remarks } = req.body;

    if (!settlementId || !amount || !referenceNumber) {
      return res.status(400).json({
        success: false,
        message: 'Settlement ID, Payment Amount, and Reference Number are required.',
      });
    }

    const settlement = dbStore.settlements.find((s) => s.settlementId === settlementId);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement record not found.' });
    }

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    if (paymentAmount > settlement.outstandingBalance) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Payment amount (₹${paymentAmount.toLocaleString('en-IN')}) cannot exceed the current outstanding balance (₹${settlement.outstandingBalance.toLocaleString('en-IN')}).`,
      });
    }

    // Check duplicate reference number
    const duplicateRef = dbStore.paymentTransactions.find(
      (p) => p.referenceNumber.toLowerCase() === referenceNumber.trim().toLowerCase()
    );
    if (duplicateRef) {
      return res.status(400).json({
        success: false,
        message: `Payment transaction with reference number '${referenceNumber}' has already been processed.`,
      });
    }

    const currentYear = new Date().getFullYear();
    const nextNum = dbStore.paymentTransactions.length + 1;
    const transactionId = `TXN-${currentYear}-${String(nextNum).padStart(3, '0')}`;

    const newPayment = {
      transactionId,
      settlementId: settlement.settlementId,
      contractId: settlement.contractId,
      farmerId: settlement.farmerId,
      farmerName: settlement.farmerName,
      buyerId: settlement.buyerId,
      buyerName: settlement.buyerName,
      amount: paymentAmount,
      paymentDate: new Date(),
      paymentMode,
      referenceNumber: referenceNumber.trim(),
      remarks: remarks || '',
      recordedBy: req.user?.name || 'Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.paymentTransactions.unshift(newPayment);

    // Update settlement financial balances
    settlement.amountAlreadyPaid = Math.round((settlement.amountAlreadyPaid + paymentAmount) * 100) / 100;
    settlement.outstandingBalance = Math.round((settlement.netPayableAmount - settlement.amountAlreadyPaid) * 100) / 100;

    if (settlement.outstandingBalance <= 0) {
      settlement.settlementStatus = 'Paid';
    } else {
      settlement.settlementStatus = 'Partially Paid';
    }
    settlement.updatedAt = new Date();

    // Create notification for farmer
    dbStore.notifications.unshift({
      notificationId: `NOTIF-${Date.now()}`,
      recipientRole: 'farmer',
      recipientId: settlement.farmerId,
      title: 'Payment Credited',
      message: `₹${paymentAmount.toLocaleString('en-IN')} has been transferred via ${paymentMode} (Ref: ${referenceNumber}). Remaining balance: ₹${settlement.outstandingBalance.toLocaleString('en-IN')}.`,
      type: 'payment',
      priority: 'info',
      link: '/settlements',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully. Outstanding balance: ₹${settlement.outstandingBalance.toLocaleString('en-IN')}.`,
      data: newPayment,
      settlement: {
        settlementId: settlement.settlementId,
        netPayableAmount: settlement.netPayableAmount,
        amountAlreadyPaid: settlement.amountAlreadyPaid,
        outstandingBalance: settlement.outstandingBalance,
        settlementStatus: settlement.settlementStatus,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
