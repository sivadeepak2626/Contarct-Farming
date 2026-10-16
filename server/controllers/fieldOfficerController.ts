import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllFieldOfficers = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.fieldOfficers];
    const { search, region, status } = req.query as any;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.officerId.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phoneNumber.includes(q) ||
          o.assignedRegion.toLowerCase().includes(q)
      );
    }

    if (region && region !== 'All') {
      list = list.filter((o) => o.assignedRegion.toLowerCase().includes(region.toLowerCase()));
    }

    if (status && status !== 'All') {
      list = list.filter((o) => o.employmentStatus === status);
    }

    return res.json({
      success: true,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFieldOfficerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const officer = dbStore.fieldOfficers.find((o) => o.officerId === id);

    if (!officer) {
      return res.status(404).json({ success: false, message: 'Field officer not found.' });
    }

    const assignedFarmers = dbStore.farmers.filter((f) => officer.assignedFarmerIds.includes(f.farmerId) || f.assignedFieldOfficerId === officer.officerId);
    const assignedContracts = dbStore.contracts.filter((c) => c.fieldOfficerId === officer.officerId);
    const fieldVisits = dbStore.fieldVisits.filter((v) => v.fieldOfficerId === officer.officerId);
    const assignedIssues = dbStore.inputIssues.filter((i) => i.assignedFieldOfficerId === officer.officerId);

    return res.json({
      success: true,
      data: {
        ...officer,
        assignedFarmers,
        assignedContracts,
        fieldVisits,
        assignedIssues,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFieldOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phoneNumber, assignedRegion, assignedFarmerIds = [] } = req.body;

    if (!name || !email || !phoneNumber || !assignedRegion) {
      return res.status(400).json({ success: false, message: 'Please provide all required officer details.' });
    }

    const nextNum = dbStore.fieldOfficers.length + 1;
    const officerId = `FO-${String(nextNum).padStart(3, '0')}`;

    const newOfficer = {
      officerId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      assignedRegion: assignedRegion.trim(),
      assignedFarmerIds: Array.isArray(assignedFarmerIds) ? assignedFarmerIds : [],
      employmentStatus: 'active' as const,
    };

    dbStore.fieldOfficers.push(newOfficer);

    return res.status(201).json({
      success: true,
      message: 'Field Officer registered successfully.',
      data: newOfficer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFieldOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.fieldOfficers.findIndex((o) => o.officerId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Field officer not found.' });
    }

    const existing = dbStore.fieldOfficers[index];
    const updated = {
      ...existing,
      ...req.body,
      officerId: existing.officerId,
    };

    dbStore.fieldOfficers[index] = updated;

    return res.json({
      success: true,
      message: 'Field officer updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignFarmersToOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { farmerIds } = req.body;

    const officer = dbStore.fieldOfficers.find((o) => o.officerId === id);
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Field officer not found.' });
    }

    officer.assignedFarmerIds = Array.isArray(farmerIds) ? farmerIds : [];

    // Also update farmers' assignedFieldOfficerId
    dbStore.farmers.forEach((f) => {
      if (officer.assignedFarmerIds.includes(f.farmerId)) {
        f.assignedFieldOfficerId = officer.officerId;
      } else if (f.assignedFieldOfficerId === officer.officerId) {
        f.assignedFieldOfficerId = undefined;
      }
    });

    return res.json({
      success: true,
      message: 'Farmers assigned to officer successfully.',
      data: officer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
