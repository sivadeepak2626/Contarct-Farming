import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllFieldVisits = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.fieldVisits];
    const { officerId, farmerId, contractId, status, search, overdueOnly } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((v) => v.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'officer') {
      list = list.filter((v) => v.fieldOfficerId === req.user?.associatedId);
    }

    if (officerId && officerId !== 'All') {
      list = list.filter((v) => v.fieldOfficerId === officerId);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((v) => v.farmerId === farmerId);
    }

    if (contractId && contractId !== 'All') {
      list = list.filter((v) => v.contractId === contractId);
    }

    if (status && status !== 'All') {
      list = list.filter((v) => v.visitStatus === status);
    }

    if (overdueOnly === 'true') {
      const now = new Date();
      list = list.filter((v) => v.followUpDate && new Date(v.followUpDate) < now && v.visitStatus !== 'Completed');
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.farmerName.toLowerCase().includes(q) ||
          v.fieldOfficerName.toLowerCase().includes(q) ||
          v.contractId.toLowerCase().includes(q) ||
          v.visitId.toLowerCase().includes(q) ||
          v.recommendations.toLowerCase().includes(q)
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

export const getFieldVisitById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const visit = dbStore.fieldVisits.find((v) => v.visitId === id);

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Field visit not found.' });
    }

    if (req.user?.role === 'farmer' && visit.farmerId !== req.user.associatedId) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    return res.json({
      success: true,
      data: visit,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFieldVisit = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'farmer') {
      return res.status(403).json({ success: false, message: 'Farmers cannot create official field visit reports.' });
    }

    const {
      farmerId,
      contractId,
      fieldOfficerId,
      visitDate,
      visitType = 'Routine',
      cropGrowthStage,
      cropHealthStatus = 'Good',
      weatherObservations,
      irrigationStatus = 'Adequate',
      pestOrDiseaseObservations,
      fertilizerAndInputObservations,
      recommendations,
      followUpDate,
      visitStatus = 'Completed',
    } = req.body;

    if (!farmerId || !contractId || !cropGrowthStage || !recommendations) {
      return res.status(400).json({
        success: false,
        message: 'Farmer, Contract, Crop Growth Stage, and Recommendations are required.',
      });
    }

    const farmer = dbStore.farmers.find((f) => f.farmerId === farmerId);
    if (!farmer) return res.status(400).json({ success: false, message: 'Farmer not found.' });

    let officer = dbStore.fieldOfficers.find((o) => o.officerId === fieldOfficerId);
    if (!officer && req.user?.role === 'officer') {
      officer = dbStore.fieldOfficers.find((o) => o.officerId === req.user?.associatedId);
    }
    if (!officer) {
      officer = dbStore.fieldOfficers[0];
    }

    const nextNum = dbStore.fieldVisits.length + 1;
    const visitId = `VISIT-${String(nextNum).padStart(3, '0')}`;

    const newVisit = {
      visitId,
      fieldOfficerId: officer.officerId,
      fieldOfficerName: officer.name,
      farmerId,
      farmerName: farmer.fullName,
      contractId,
      visitDate: visitDate ? new Date(visitDate) : new Date(),
      visitType,
      cropGrowthStage,
      cropHealthStatus,
      weatherObservations: weatherObservations || 'Mild and clear',
      irrigationStatus,
      pestOrDiseaseObservations: pestOrDiseaseObservations || 'None noted',
      fertilizerAndInputObservations: fertilizerAndInputObservations || 'Standard dosage',
      recommendations,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      visitStatus: visitStatus as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.fieldVisits.unshift(newVisit);

    // Auto notification if follow up is scheduled
    if (newVisit.followUpDate) {
      dbStore.notifications.unshift({
        notificationId: `NOTIF-${Date.now()}`,
        recipientRole: 'officer',
        recipientId: officer.officerId,
        title: 'Follow-Up Inspection Scheduled',
        message: `Follow-up visit set for ${farmer.fullName} (${cropGrowthStage}) on ${new Date(newVisit.followUpDate).toLocaleDateString()}.`,
        type: 'visit',
        priority: 'info',
        link: '/field-visits',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: `Field visit ${visitId} recorded successfully.`,
      data: newVisit,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFieldVisit = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'farmer') {
      return res.status(403).json({ success: false, message: 'Farmers cannot modify official field officer visit logs.' });
    }

    const { id } = req.params;
    const index = dbStore.fieldVisits.findIndex((v) => v.visitId === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Field visit not found.' });
    }

    const existing = dbStore.fieldVisits[index];
    const updated = {
      ...existing,
      ...req.body,
      visitId: existing.visitId,
      updatedAt: new Date(),
    };

    dbStore.fieldVisits[index] = updated;

    return res.json({
      success: true,
      message: 'Field visit report updated.',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
