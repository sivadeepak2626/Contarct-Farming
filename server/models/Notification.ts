import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  notificationId: string;
  recipientRole: 'all' | 'admin' | 'farmer' | 'buyer' | 'officer';
  recipientId?: string;
  title: string;
  message: string;
  type: 'harvest' | 'visit' | 'issue' | 'delivery' | 'settlement' | 'payment' | 'contract';
  priority: 'info' | 'warning' | 'alert';
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    recipientRole: {
      type: String,
      enum: ['all', 'admin', 'farmer', 'buyer', 'officer'],
      default: 'all',
      index: true,
    },
    recipientId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['harvest', 'visit', 'issue', 'delivery', 'settlement', 'payment', 'contract'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['info', 'warning', 'alert'],
      default: 'info',
    },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
