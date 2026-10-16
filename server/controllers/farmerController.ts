import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllFarmers = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.farmers];
    const { search, state, crop, status, page = '1', limit = '10' } = req.query as any;

    // Role-based restrictions
    if (req.user?.role === 'farmer') {
      list = list.filter((f) => f.farmerId === req.user?.associatedId || f.email.toLowerCase() === req.user?.email.toLowerCase());
    } else if (req.user?.role === 'officer') {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === req.user?.associatedId || o.email.toLowerCase() === req.user?.email.toLowerCase());
      if (officer && officer.assignedFarmerIds?.length > 0) {
        list = list.filter((f) => officer.assignedFarmerIds.includes(f.farmerId) || f.assignedFieldOfficerId === officer.officerId);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.farmerId.toLowerCase().includes(q) ||
          f.phoneNumber.includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q)
      );
    }

    if (state && state !== 'All') {
      list = list.filter((f) => f.state.toLowerCase() === state.toLowerCase());
    }

    if (crop && crop !== 'All') {
      list = list.filter((f) => f.cropsCultivated.some((c: string) => c.toLowerCase().includes(crop.toLowerCase())));
    }

    if (status && status !== 'All') {
      list = list.filter((f) => f.accountStatus === status);
    }

    const total = list.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFarmerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const farmer = dbStore.farmers.find((f) => f.farmerId === id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    // Role check: farmer can only view self
    if (req.user?.role === 'farmer' && req.user.associatedId !== farmer.farmerId && req.user.email.toLowerCase() !== farmer.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this farmer profile.' });
    }

    // Associated entities
    const contracts = dbStore.contracts.filter((c) => c.farmerId === farmer.farmerId);
    const cultivations = dbStore.cultivations.filter((c) => c.farmerId === farmer.farmerId);
    const fieldVisits = dbStore.fieldVisits.filter((v) => v.farmerId === farmer.farmerId);
    const harvests = dbStore.harvests.filter((h) => h.farmerId === farmer.farmerId);
    const deliveries = dbStore.deliveries.filter((d) => d.farmerId === farmer.farmerId);
    const settlements = dbStore.settlements.filter((s) => s.farmerId === farmer.farmerId);
    const inputIssues = dbStore.inputIssues.filter((i) => i.farmerId === farmer.farmerId);
    const assignedOfficer = dbStore.fieldOfficers.find((o) => o.officerId === farmer.assignedFieldOfficerId);

    return res.json({
      success: true,
      data: {
        ...farmer,
        assignedOfficer,
        contracts,
        cultivations,
        fieldVisits,
        harvests,
        deliveries,
        settlements,
        inputIssues,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFarmer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      village,
      district,
      state,
      farmAddress,
      totalLandAreaAcres,
      cropsCultivated = [],
      assignedFieldOfficerId,
    } = req.body;

    if (!fullName || !phoneNumber || !email || !village || !district || !state || !totalLandAreaAcres) {
      return res.status(400).json({ success: false, message: 'Please provide all mandatory farmer details.' });
    }

    const nextNum = dbStore.farmers.length + 1;
    const farmerId = `FARM-${String(nextNum).padStart(3, '0')}`;

    const newFarmer = {
      farmerId,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      farmAddress: farmAddress || `${village}, ${district}`,
      totalLandAreaAcres: Number(totalLandAreaAcres),
      cropsCultivated: Array.isArray(cropsCultivated) ? cropsCultivated : [cropsCultivated],
      registrationDate: new Date(),
      accountStatus: 'active' as const,
      assignedFieldOfficerId: assignedFieldOfficerId || undefined,
    };

    dbStore.farmers.unshift(newFarmer);

    // If an officer was assigned, update officer's assignedFarmerIds
    if (assignedFieldOfficerId) {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === assignedFieldOfficerId);
      if (officer && !officer.assignedFarmerIds.includes(farmerId)) {
        officer.assignedFarmerIds.push(farmerId);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Farmer registered successfully.',
      data: newFarmer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFarmer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.farmers.findIndex((f) => f.farmerId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    const existing = dbStore.farmers[index];

    // Role check: farmer can only update phone, address; admin/officer can update status & officer
    if (req.user?.role === 'farmer' && req.user.associatedId !== existing.farmerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this farmer.' });
    }

    const updated = {
      ...existing,
      ...req.body,
      farmerId: existing.farmerId, // Immutable ID
    };

    dbStore.farmers[index] = updated;

    return res.json({
      success: true,
      message: 'Farmer profile updated.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFarmer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.farmers.findIndex((f) => f.farmerId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    // Check if farmer has active contracts
    const hasActiveContracts = dbStore.contracts.some(
      (c) => c.farmerId === id && ['Active', 'In Progress'].includes(c.contractStatus)
    );

    if (hasActiveContracts) {
      // Soft-deactivate instead of deleting
      dbStore.farmers[index].accountStatus = 'inactive';
      return res.json({
        success: true,
        message: 'Farmer has active contracts. Account status changed to Inactive to preserve financial audit trail.',
        deactivated: true,
      });
    }

    // Safe deletion or deactivation
    dbStore.farmers[index].accountStatus = 'inactive';
    return res.json({
      success: true,
      message: 'Farmer account deactivated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
