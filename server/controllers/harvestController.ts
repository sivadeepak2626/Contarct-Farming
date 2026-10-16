import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllHarvests = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.harvests];
    const { contractId, farmerId, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((h) => h.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'buyer') {
      const contracts = dbStore.contracts.filter((c) => c.buyerId === req.user?.associatedId).map((c) => c.contractId);
      list = list.filter((h) => contracts.includes(h.contractId));
    }

    if (contractId && contractId !== 'All') {
      list = list.filter((h) => h.contractId === contractId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((h) => h.farmerId === farmerId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.harvestId.toLowerCase().includes(q) ||
          h.cropName.toLowerCase().includes(q) ||
          h.farmerName.toLowerCase().includes(q) ||
          h.contractId.toLowerCase().includes(q)
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

export const createHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      contractId,
      farmerId,
      harvestDate,
      expectedQuantity,
      actualQuantityHarvested,
      acceptedQuantity,
      rejectedQuantity = 0,
      qualityGrade = 'Grade A',
      inspectionNotes = '',
    } = req.body;

    if (!contractId || actualQuantityHarvested === undefined || acceptedQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID, Actual Harvested Quantity, and Accepted Quantity are required.',
      });
    }

    const actual = Number(actualQuantityHarvested);
    const accepted = Number(acceptedQuantity);
    const rejected = Number(rejectedQuantity || 0);

    // Business validation rule: accepted + rejected must not exceed actual quantity harvested
    if (accepted + rejected > actual) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Sum of Accepted (${accepted} kg) and Rejected (${rejected} kg) cannot exceed Actual Harvested Quantity (${actual} kg).`,
      });
    }

    const contract = dbStore.contracts.find((c) => c.contractId === contractId);
    if (!contract) {
      return res.status(400).json({ success: false, message: 'Referenced contract not found.' });
    }

    const nextNum = dbStore.harvests.length + 1;
    const harvestId = `HRV-${String(nextNum).padStart(3, '0')}`;

    const newHarvest = {
      harvestId,
      contractId,
      farmerId: farmerId || contract.farmerId,
      farmerName: contract.farmerName,
      cropName: contract.cropName,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      expectedQuantity: expectedQuantity !== undefined ? Number(expectedQuantity) : contract.agreedQuantity,
      actualQuantityHarvested: actual,
      acceptedQuantity: accepted,
      rejectedQuantity: rejected,
      qualityGrade,
      inspectionNotes,
      recordedBy: req.user?.name || 'Inspection Officer',
      harvestStatus: 'Verified' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.harvests.unshift(newHarvest);

    // Advance contract to In Progress if currently Active
    if (contract.contractStatus === 'Active') {
      contract.contractStatus = 'In Progress';
      contract.statusHistory.push({
        status: 'In Progress',
        timestamp: new Date(),
        notes: `Harvest record ${harvestId} logged (${actual} kg).`,
        updatedBy: req.user?.name || 'Officer',
      });
    }

    // Auto update linked cultivation record to Harvesting/Harvest Completed
    const cultivation = dbStore.cultivations.find((cl) => cl.contractId === contractId);
    if (cultivation) {
      cultivation.actualYieldKg = (cultivation.actualYieldKg || 0) + actual;
      if (cultivation.actualYieldKg >= contract.agreedQuantity) {
        cultivation.currentGrowthStage = 'Harvest Completed';
        cultivation.stageProgressPercent = 100;
      } else {
        cultivation.currentGrowthStage = 'Harvesting';
        cultivation.stageProgressPercent = 90;
      }
    }

    return res.status(201).json({
      success: true,
      message: `Harvest entry ${harvestId} recorded successfully (${accepted} kg accepted).`,
      data: newHarvest,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
