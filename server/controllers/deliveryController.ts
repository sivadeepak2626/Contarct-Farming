import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.deliveries];
    const { contractId, buyerId, farmerId, status, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((d) => d.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'buyer') {
      list = list.filter((d) => d.buyerId === req.user?.associatedId);
    }

    if (contractId && contractId !== 'All') {
      list = list.filter((d) => d.contractId === contractId);
    }

    if (buyerId && buyerId !== 'All') {
      list = list.filter((d) => d.buyerId === buyerId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((d) => d.farmerId === farmerId);
    }

    if (status && status !== 'All') {
      list = list.filter((d) => d.deliveryStatus === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.deliveryId.toLowerCase().includes(q) ||
          d.farmerName.toLowerCase().includes(q) ||
          d.buyerName.toLowerCase().includes(q) ||
          d.cropName.toLowerCase().includes(q) ||
          d.contractId.toLowerCase().includes(q)
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

export const createDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const {
      contractId,
      scheduledDeliveryDate,
      actualDeliveryDate,
      plannedQuantity,
      deliveredQuantity,
      acceptedQuantity,
      rejectedQuantity = 0,
      deliveryLocation,
      qualityStatus = 'Passed',
      notes = '',
      deliveryStatus = 'Delivered',
    } = req.body;

    if (!contractId || deliveredQuantity === undefined || acceptedQuantity === undefined || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID, Delivered Quantity, Accepted Quantity, and Delivery Location are required.',
      });
    }

    const contract = dbStore.contracts.find((c) => c.contractId === contractId);
    if (!contract) {
      return res.status(400).json({ success: false, message: 'Referenced contract not found.' });
    }

    const delivered = Number(deliveredQuantity);
    const accepted = Number(acceptedQuantity);
    const rejected = Number(rejectedQuantity || 0);

    if (accepted + rejected > delivered) {
      return res.status(400).json({
        success: false,
        message: `Sum of Accepted (${accepted}) and Rejected (${rejected}) cannot exceed Delivered Quantity (${delivered}).`,
      });
    }

    // Check existing accepted deliveries for this contract
    const existingDeliveries = dbStore.deliveries.filter((d) => d.contractId === contractId);
    const prevAcceptedTotal = existingDeliveries.reduce((sum, d) => sum + (d.acceptedQuantity || 0), 0);
    const newTotalAccepted = prevAcceptedTotal + accepted;
    const remainingQuantity = Math.max(0, contract.agreedQuantity - newTotalAccepted);

    const nextNum = dbStore.deliveries.length + 1;
    const deliveryId = `DEL-${String(nextNum).padStart(3, '0')}`;

    const newDelivery = {
      deliveryId,
      contractId,
      farmerId: contract.farmerId,
      farmerName: contract.farmerName,
      buyerId: contract.buyerId,
      buyerName: contract.buyerName,
      cropName: contract.cropName,
      scheduledDeliveryDate: scheduledDeliveryDate ? new Date(scheduledDeliveryDate) : new Date(),
      actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate) : new Date(),
      plannedQuantity: plannedQuantity ? Number(plannedQuantity) : delivered,
      deliveredQuantity: delivered,
      acceptedQuantity: accepted,
      rejectedQuantity: rejected,
      unit: contract.unitOfMeasurement || 'kg',
      deliveryLocation: deliveryLocation.trim(),
      qualityStatus,
      notes: notes || '',
      deliveryStatus: deliveryStatus as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.deliveries.unshift(newDelivery);

    // If remaining quantity reaches 0, update contract to Completed or In Progress
    if (remainingQuantity === 0 && contract.contractStatus !== 'Completed') {
      contract.contractStatus = 'Completed';
      contract.statusHistory.push({
        status: 'Completed',
        timestamp: new Date(),
        notes: `Full contract quota delivered (${newTotalAccepted}/${contract.agreedQuantity} ${contract.unitOfMeasurement}).`,
        updatedBy: req.user?.name || 'System',
      });
    }

    return res.status(201).json({
      success: true,
      message: `Delivery ${deliveryId} recorded successfully. Remaining contract quantity: ${remainingQuantity} ${contract.unitOfMeasurement}.`,
      data: newDelivery,
      meta: {
        totalAcceptedDelivered: newTotalAccepted,
        remainingContractQuantity: remainingQuantity,
        completionPercent: Math.min(100, Math.round((newTotalAccepted / contract.agreedQuantity) * 100)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
