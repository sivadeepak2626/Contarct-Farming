import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

const STAGE_PROGRESS: Record<string, number> = {
  'Land Preparation': 15,
  'Sowing': 35,
  'Growing': 55,
  'Flowering': 75,
  'Harvesting': 90,
  'Harvest Completed': 100,
};

export const getAllCultivations = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.cultivations];
    const { farmerId, contractId, stage, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((cl) => cl.farmerId === req.user?.associatedId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((cl) => cl.farmerId === farmerId);
    }

    if (contractId && contractId !== 'All') {
      list = list.filter((cl) => cl.contractId === contractId);
    }

    if (stage && stage !== 'All') {
      list = list.filter((cl) => cl.currentGrowthStage === stage);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (cl) =>
          cl.farmerName.toLowerCase().includes(q) ||
          cl.cropName.toLowerCase().includes(q) ||
          cl.contractId.toLowerCase().includes(q) ||
          cl.cultivationId.toLowerCase().includes(q)
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

export const getCultivationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cultivation = dbStore.cultivations.find((cl) => cl.cultivationId === id);

    if (!cultivation) {
      return res.status(404).json({ success: false, message: 'Cultivation record not found.' });
    }

    if (req.user?.role === 'farmer' && cultivation.farmerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this record.' });
    }

    return res.json({
      success: true,
      data: cultivation,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCultivationStage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, notes, actualYieldKg } = req.body;

    const cultivation = dbStore.cultivations.find((cl) => cl.cultivationId === id);
    if (!cultivation) {
      return res.status(404).json({ success: false, message: 'Cultivation record not found.' });
    }

    const validStages = ['Land Preparation', 'Sowing', 'Growing', 'Flowering', 'Harvesting', 'Harvest Completed'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid cultivation growth stage.' });
    }

    cultivation.currentGrowthStage = stage as any;
    cultivation.stageProgressPercent = STAGE_PROGRESS[stage] || cultivation.stageProgressPercent;
    if (notes) cultivation.notes = notes;
    if (actualYieldKg !== undefined) cultivation.actualYieldKg = Number(actualYieldKg);
    if (stage === 'Harvest Completed') {
      cultivation.actualHarvestDate = new Date();
    }

    cultivation.activityTimeline.push({
      stage,
      date: new Date(),
      notes: notes || `Cultivation advanced to ${stage}`,
      recordedBy: req.user?.name || 'Field Officer',
    });
    cultivation.updatedAt = new Date();

    return res.json({
      success: true,
      message: `Cultivation stage updated to ${stage} (${cultivation.stageProgressPercent}%).`,
      data: cultivation,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCultivation = async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, contractId, cropId, landAreaAcres, sowingDate, expectedHarvestDate, expectedYieldKg, notes } = req.body;

    if (!farmerId || !contractId || !cropId || !landAreaAcres || !expectedYieldKg) {
      return res.status(400).json({ success: false, message: 'Missing required cultivation fields.' });
    }

    const farmer = dbStore.farmers.find((f) => f.farmerId === farmerId);
    const crop = dbStore.crops.find((c) => c.cropId === cropId);

    const nextNum = dbStore.cultivations.length + 1;
    const cultivationId = `CLT-${String(nextNum).padStart(3, '0')}`;

    const newRecord = {
      cultivationId,
      farmerId,
      farmerName: farmer?.fullName || 'Farmer',
      contractId,
      cropId,
      cropName: crop?.cropName || 'Crop',
      landAreaAcres: Number(landAreaAcres),
      sowingDate: sowingDate ? new Date(sowingDate) : new Date(),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : new Date(Date.now() + 90 * 86400000),
      expectedYieldKg: Number(expectedYieldKg),
      currentGrowthStage: 'Land Preparation' as const,
      stageProgressPercent: 15,
      notes: notes || '',
      activityTimeline: [
        {
          stage: 'Land Preparation',
          date: new Date(),
          notes: 'Cultivation record registered.',
          recordedBy: req.user?.name || 'Field Officer',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.cultivations.unshift(newRecord);

    return res.status(201).json({
      success: true,
      message: 'Cultivation tracking started.',
      data: newRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
