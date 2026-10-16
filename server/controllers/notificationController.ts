import { Response } from 'express';
import { dbStore } from '../data/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role || 'all';
    const associatedId = req.user?.associatedId;

    const list = dbStore.notifications.filter((n) => {
      if (n.recipientRole === 'all') return true;
      if (n.recipientRole === role) {
        if (!n.recipientId) return true;
        return n.recipientId === associatedId;
      }
      return false;
    });

    const unreadCount = list.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      unreadCount,
      data: list,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = dbStore.notifications.find((n) => n.notificationId === id);

    if (notification) {
      notification.isRead = true;
    }

    return res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role || 'all';
    const associatedId = req.user?.associatedId;

    dbStore.notifications.forEach((n) => {
      if (n.recipientRole === 'all' || n.recipientRole === role) {
        if (!n.recipientId || n.recipientId === associatedId) {
          n.isRead = true;
        }
      }
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
