import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getAllInputIssues = async (req: AuthRequest, res: Response) => {
  try {
    let list = [...dbStore.inputIssues];
    const { status, priority, category, farmerId, search } = req.query as any;

    if (req.user?.role === 'farmer') {
      list = list.filter((i) => i.farmerId === req.user?.associatedId);
    } else if (req.user?.role === 'officer') {
      list = list.filter((i) => i.assignedFieldOfficerId === req.user?.associatedId);
    }

    if (status && status !== 'All') {
      list = list.filter((i) => i.status === status);
    }

    if (priority && priority !== 'All') {
      list = list.filter((i) => i.priority === priority);
    }

    if (category && category !== 'All') {
      list = list.filter((i) => i.issueCategory === category);
    }

    if (farmerId && farmerId !== 'All') {
      list = list.filter((i) => i.farmerId === farmerId);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.issueId.toLowerCase().includes(q) ||
          i.inputName.toLowerCase().includes(q) ||
          i.farmerName.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
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

export const createInputIssue = async (req: AuthRequest, res: Response) => {
  try {
    const { farmerId, contractId, cropName, issueCategory, inputName, description, quantityRequired, priority = 'Medium' } = req.body;

    if (!contractId || !issueCategory || !inputName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Contract, Issue Category, Input Name, and Description are required.',
      });
    }

    let targetFarmerId = farmerId;
    let targetFarmerName = 'Farmer';

    if (req.user?.role === 'farmer') {
      targetFarmerId = req.user.associatedId || targetFarmerId;
      targetFarmerName = req.user.name;
    } else if (farmerId) {
      const f = dbStore.farmers.find((farm) => farm.farmerId === farmerId);
      if (f) {
        targetFarmerName = f.fullName;
      }
    }

    const contract = dbStore.contracts.find((c) => c.contractId === contractId);
    const assignedOfficerId = contract?.fieldOfficerId || (dbStore.fieldOfficers[0]?.officerId);
    const assignedOfficerName = contract?.fieldOfficerName || (dbStore.fieldOfficers[0]?.name);

    const nextNum = dbStore.inputIssues.length + 1;
    const issueId = `ISS-${String(nextNum).padStart(3, '0')}`;

    const newIssue = {
      issueId,
      farmerId: targetFarmerId || contract?.farmerId || 'FARM-001',
      farmerName: targetFarmerName || contract?.farmerName || 'Farmer',
      contractId,
      cropName: cropName || contract?.cropName || 'Crop',
      issueCategory,
      inputName: inputName.trim(),
      description: description.trim(),
      quantityRequired: quantityRequired || '',
      priority,
      reportedDate: new Date(),
      assignedFieldOfficerId: assignedOfficerId,
      assignedFieldOfficerName: assignedOfficerName,
      resolutionNotes: '',
      status: 'Open' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.inputIssues.unshift(newIssue);

    // Notify field officer and admin
    dbStore.notifications.unshift({
      notificationId: `NOTIF-${Date.now()}`,
      recipientRole: 'officer',
      recipientId: assignedOfficerId,
      title: `New Agricultural Input Issue: ${inputName}`,
      message: `${targetFarmerName} reported ${priority} priority issue regarding ${issueCategory} for contract ${contractId}.`,
      type: 'issue',
      priority: priority === 'Critical' ? 'alert' : 'warning',
      link: '/input-issues',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Agricultural input issue ${issueId} reported successfully.`,
      data: newIssue,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInputIssue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedFieldOfficerId, priority } = req.body;

    const issue = dbStore.inputIssues.find((i) => i.issueId === id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Input issue not found.' });
    }

    if (status) issue.status = status;
    if (resolutionNotes !== undefined) issue.resolutionNotes = resolutionNotes;
    if (priority) issue.priority = priority;

    if (assignedFieldOfficerId) {
      const officer = dbStore.fieldOfficers.find((o) => o.officerId === assignedFieldOfficerId);
      if (officer) {
        issue.assignedFieldOfficerId = officer.officerId;
        issue.assignedFieldOfficerName = officer.name;
      }
    }

    issue.updatedAt = new Date();

    return res.json({
      success: true,
      message: `Issue ${issue.issueId} updated successfully.`,
      data: issue,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
