import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllContracts = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.contracts];
    const { search, farmerId, buyerId, cropId, season, status, page = '1', limit = '10' } = req.query as any;

    // RBAC check
    if (req.user?.role === 'farmer') {
      list = list.filter((c) => c.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'buyer') {
      list = list.filter((c) => c.buyerId === req.user?.associatedId);
    } else if (req.user?.role === 'officer') {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === req.user?.associatedId);
      list = list.filter((c) => c.fieldOfficerId === req.user?.associatedId || (officer && officer.assignedFarmerIds.includes(c.farmerId)));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.contractId.toLowerCase().includes(q) ||
          c.farmerName.toLowerCase().includes(q) ||
          c.buyerName.toLowerCase().includes(q) ||
          c.cropName.toLowerCase().includes(q)
      );
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((c) => c.farmerId === farmerId);
    }

    if (buyerId && buyerId !== 'All') {
      list = list.filter((c) => c.buyerId === buyerId);
    }

    if (cropId && cropId !== 'All') {
      list = list.filter((c) => c.cropId === cropId);
    }

    if (season && season !== 'All') {
      list = list.filter((c) => c.farmingSeason.toLowerCase().includes(season.toLowerCase()));
    }

    if (status && status !== 'All') {
      list = list.filter((c) => c.contractStatus === status);
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

export const getContractById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = dbStore.contracts.find((c) => c.contractId === id);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    // Role verification
    if (req.user?.role === 'farmer' && contract.farmerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this contract.' });
    }
    if (req.user?.role === 'buyer' && contract.buyerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this contract.' });
    }

    // Expand associated operations
    const cultivations = dbStore.cultivations.filter((cl) => cl.contractId === contract.contractId);
    const fieldVisits = dbStore.fieldVisits.filter((v) => v.contractId === contract.contractId);
    const harvests = dbStore.harvests.filter((h) => h.contractId === contract.contractId);
    const deliveries = dbStore.deliveries.filter((d) => d.contractId === contract.contractId);
    const settlements = dbStore.settlements.filter((s) => s.contractId === contract.contractId);
    const inputIssues = dbStore.inputIssues.filter((i) => i.contractId === contract.contractId);

    // Derived statistics
    const totalHarvested = harvests.reduce((acc, h) => acc + (h.actualQuantityHarvested || 0), 0);
    const totalAcceptedDelivered = deliveries.reduce((acc, d) => acc + (d.acceptedQuantity || 0), 0);
    const remainingToDeliver = Math.max(0, contract.agreedQuantity - totalAcceptedDelivered);
    const deliveryCompletionRate = contract.agreedQuantity > 0 ? (totalAcceptedDelivered / contract.agreedQuantity) * 100 : 0;

    return res.json({
      success: true,
      data: {
        ...contract,
        totalHarvested,
        totalAcceptedDelivered,
        remainingToDeliver,
        deliveryCompletionRate: Math.round(deliveryCompletionRate * 10) / 10,
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

export const createContract = async (req: AuthRequest, res: Response) => {
  try {
    const {
      farmerId,
      buyerId,
      cropId,
      fieldOfficerId,
      farmingSeason,
      contractStartDate,
      expectedHarvestDate,
      contractEndDate,
      cultivatedLandAreaAcres,
      agreedQuantity,
      unitOfMeasurement = 'kg',
      agreedPricePerUnit,
      deliveryDeadline,
      paymentTerms,
      qualityStandards,
      additionalTerms,
      contractStatus = 'Active',
    } = req.body;

    if (!farmerId || !buyerId || !cropId || !agreedQuantity || !agreedPricePerUnit || !cultivatedLandAreaAcres) {
      return res.status(400).json({
        success: false,
        message: 'Farmer, Buyer, Crop, Land Area, Quantity, and Unit Price are required.',
      });
    }

    const farmer = dbStore.farmers.find((f) => f.farmerId === farmerId);
    if (!farmer) return res.status(400).json({ success: false, message: 'Specified farmer not found.' });

    const buyer = dbStore.buyers.find((b) => b.buyerId === buyerId);
    if (!buyer) return res.status(400).json({ success: false, message: 'Specified buyer not found.' });

    const crop = dbStore.crops.find((c) => c.cropId === cropId);
    if (!crop) return res.status(400).json({ success: false, message: 'Specified crop not found.' });

    let officerName = undefined;
    if (fieldOfficerId) {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === fieldOfficerId);
      if (officer) {
        officerName = officer.name;
        // ensure farmer is in assigned list
        if (!officer.assignedFarmerIds.includes(farmerId)) {
          officer.assignedFarmerIds.push(farmerId);
        }
      }
    }

    const qty = Number(agreedQuantity);
    const unitPrice = Number(agreedPricePerUnit);
    if (qty <= 0 || unitPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity and unit price must be positive numbers.' });
    }

    // Auto-calculate Gross Contract Value: Agreed Quantity * Agreed Price Per Unit
    const grossContractValue = Math.round(qty * unitPrice * 100) / 100;

    const nextNum = dbStore.contracts.length + 1;
    const currentYear = new Date().getFullYear();
    const contractId = `CNT-${currentYear}-${String(nextNum).padStart(3, '0')}`;

    const newContract = {
      contractId,
      farmerId,
      farmerName: farmer.fullName,
      buyerId,
      buyerName: buyer.companyName,
      cropId,
      cropName: crop.cropName,
      fieldOfficerId: fieldOfficerId || undefined,
      fieldOfficerName: officerName,
      farmingSeason: farmingSeason || 'Kharif 2026',
      contractStartDate: contractStartDate ? new Date(contractStartDate) : new Date(),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : new Date(Date.now() + 90 * 86400000),
      contractEndDate: contractEndDate ? new Date(contractEndDate) : new Date(Date.now() + 120 * 86400000),
      cultivatedLandAreaAcres: Number(cultivatedLandAreaAcres),
      agreedQuantity: qty,
      unitOfMeasurement,
      agreedPricePerUnit: unitPrice,
      grossContractValue,
      deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : new Date(Date.now() + 100 * 86400000),
      paymentTerms: paymentTerms || 'Payment within 7 days of verified delivery.',
      qualityStandards: qualityStandards || 'Grade A commercial standard, moisture < 12%',
      additionalTerms: additionalTerms || '',
      contractStatus: contractStatus as any,
      statusHistory: [
        {
          status: contractStatus,
          timestamp: new Date(),
          notes: 'Contract created and registered in system.',
          updatedBy: req.user?.name || 'Administrator',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.contracts.unshift(newContract);

    // Also auto-generate a cultivation record for this contract
    const nextCultId = `CLT-${String(dbStore.cultivations.length + 1).padStart(3, '0')}`;
    const newCultivation = {
      cultivationId: nextCultId,
      farmerId: newContract.farmerId,
      farmerName: newContract.farmerName,
      contractId: newContract.contractId,
      cropId: newContract.cropId,
      cropName: newContract.cropName,
      landAreaAcres: newContract.cultivatedLandAreaAcres,
      sowingDate: newContract.contractStartDate,
      expectedHarvestDate: newContract.expectedHarvestDate,
      expectedYieldKg: newContract.agreedQuantity,
      currentGrowthStage: 'Land Preparation' as const,
      stageProgressPercent: 15,
      notes: `Cultivation initiated for contract ${newContract.contractId}`,
      activityTimeline: [
        {
          stage: 'Land Preparation',
          date: new Date(),
          notes: 'Plot demarcated and land preparation initiated.',
          recordedBy: req.user?.name || 'System',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dbStore.cultivations.unshift(newCultivation);

    return res.status(201).json({
      success: true,
      message: `Contract ${contractId} created successfully. Gross Contract Value calculated as ₹${grossContractValue.toLocaleString('en-IN')}.`,
      data: newContract,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContractStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const contract = dbStore.contracts.find((c) => c.contractId === id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    const validStatuses = ['Draft', 'Pending Approval', 'Active', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid contract status.' });
    }

    contract.contractStatus = status;
    contract.statusHistory.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`,
      updatedBy: req.user?.name || 'Authorized User',
    });
    contract.updatedAt = new Date();

    return res.json({
      success: true,
      message: `Contract ${contract.contractId} status changed to ${status}.`,
      data: contract,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContract = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.contracts.findIndex((c) => c.contractId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    const existing = dbStore.contracts[index];
    const qty = req.body.agreedQuantity !== undefined ? Number(req.body.agreedQuantity) : existing.agreedQuantity;
    const price = req.body.agreedPricePerUnit !== undefined ? Number(req.body.agreedPricePerUnit) : existing.agreedPricePerUnit;
    const grossContractValue = Math.round(qty * price * 100) / 100;

    let officerName = existing.fieldOfficerName;
    if (req.body.fieldOfficerId) {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === req.body.fieldOfficerId);
      if (officer) officerName = officer.name;
    }

    const updated = {
      ...existing,
      ...req.body,
      contractId: existing.contractId,
      agreedQuantity: qty,
      agreedPricePerUnit: price,
      grossContractValue,
      fieldOfficerName: officerName,
      updatedAt: new Date(),
    };

    dbStore.contracts[index] = updated;

    return res.json({
      success: true,
      message: 'Contract updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
