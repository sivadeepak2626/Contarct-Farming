import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllBuyers = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.buyers];
    const { search, status, page = '1', limit = '10' } = req.query as any;

    if (req.user?.role === 'buyer') {
      list = list.filter((b) => b.buyerId === req.user?.associatedId || b.email.toLowerCase() === req.user?.email.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.companyName.toLowerCase().includes(q) ||
          b.buyerId.toLowerCase().includes(q) ||
          b.contactPerson.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All') {
      list = list.filter((b) => b.accountStatus === status);
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

export const getBuyerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const buyer = dbStore.buyers.find((b) => b.buyerId === id);

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found.' });
    }

    if (req.user?.role === 'buyer' && req.user.associatedId !== buyer.buyerId && req.user.email.toLowerCase() !== buyer.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this buyer.' });
    }

    const contracts = dbStore.contracts.filter((c) => c.buyerId === buyer.buyerId);
    const deliveries = dbStore.deliveries.filter((d) => d.buyerId === buyer.buyerId);
    const settlements = dbStore.settlements.filter((s) => s.buyerId === buyer.buyerId);

    return res.json({
      success: true,
      data: {
        ...buyer,
        contracts,
        deliveries,
        settlements,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBuyer = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, contactPerson, phoneNumber, email, businessAddress, registrationNumber, preferredCrops = [] } = req.body;

    if (!companyName || !contactPerson || !phoneNumber || !email || !businessAddress) {
      return res.status(400).json({ success: false, message: 'Please provide all required company details.' });
    }

    const nextNum = dbStore.buyers.length + 1;
    const buyerId = `BUY-${String(nextNum).padStart(3, '0')}`;

    const newBuyer = {
      buyerId,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      businessAddress: businessAddress.trim(),
      registrationNumber: registrationNumber || undefined,
      preferredCrops: Array.isArray(preferredCrops) ? preferredCrops : [preferredCrops],
      accountStatus: 'active' as const,
    };

    dbStore.buyers.unshift(newBuyer);

    return res.status(201).json({
      success: true,
      message: 'Buyer company registered successfully.',
      data: newBuyer,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBuyer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.buyers.findIndex((b) => b.buyerId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Buyer not found.' });
    }

    const existing = dbStore.buyers[index];
    if (req.user?.role === 'buyer' && req.user.associatedId !== existing.buyerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this company.' });
    }

    const updated = {
      ...existing,
      ...req.body,
      buyerId: existing.buyerId,
    };

    dbStore.buyers[index] = updated;

    return res.json({
      success: true,
      message: 'Buyer profile updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBuyer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = dbStore.buyers.findIndex((b) => b.buyerId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Buyer not found.' });
    }

    dbStore.buyers[index].accountStatus = 'inactive';
    return res.json({
      success: true,
      message: 'Buyer status deactivated successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
