import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllCrops = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.crops];
    const { search, category, season } = req.query as any;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.cropName.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q));
    }

    if (category && category !== 'All') {
      list = list.filter((c) => c.cropCategory === category);
    }

    if (season && season !== 'All') {
      list = list.filter((c) => c.growingSeason === season);
    }

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCropById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const crop = dbStore.crops.find((c) => c.cropId === id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    const contracts = dbStore.contracts.filter((c) => c.cropId === crop.cropId);
    return res.json({
      success: true,
      data: {
        ...crop,
        activeContractsCount: contracts.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCrop = async (req: AuthRequest, res: Response) => {
  try {
    const { cropName, variety, cropCategory, growingSeason, cultivationDurationDays, unitOfMeasurement = 'kg' } = req.body;

    if (!cropName || !variety || !cropCategory || !growingSeason || !cultivationDurationDays) {
      return res.status(400).json({ success: false, message: 'Please provide all crop specifications.' });
    }

    const nextNum = dbStore.crops.length + 1;
    const cropId = `CROP-${String(nextNum).padStart(3, '0')}`;

    const newCrop = {
      cropId,
      cropName: cropName.trim(),
      variety: variety.trim(),
      cropCategory,
      growingSeason,
      cultivationDurationDays: Number(cultivationDurationDays),
      unitOfMeasurement,
      status: 'active' as const,
    };

    dbStore.crops.push(newCrop);

    return res.status(201).json({
      success: true,
      message: 'Crop added to catalog successfully.',
      data: newCrop,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCrop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.crops.findIndex((c) => c.cropId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    const updated = {
      ...dbStore.crops[index],
      ...req.body,
      cropId: dbStore.crops[index].cropId,
    };

    dbStore.crops[index] = updated;

    return res.json({
      success: true,
      message: 'Crop details updated.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
