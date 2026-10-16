import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  deliveryId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  scheduledDeliveryDate: Date;
  actualDeliveryDate?: Date;
  plannedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  deliveryLocation: string;
  qualityStatus: 'Passed' | 'Conditional' | 'Failed';
  notes?: string;
  deliveryStatus: 'Scheduled' | 'In Transit' | 'Partially Delivered' | 'Delivered' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    deliveryId: { type: String, required: true, unique: true, index: true },
    contractId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    cropName: { type: String, required: true },
    scheduledDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    plannedQuantity: { type: Number, required: true, min: 0 },
    deliveredQuantity: { type: Number, required: true, min: 0 },
    acceptedQuantity: { type: Number, required: true, min: 0 },
    rejectedQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    deliveryLocation: { type: String, required: true },
    qualityStatus: {
      type: String,
      enum: ['Passed', 'Conditional', 'Failed'],
      default: 'Passed',
    },
    notes: { type: String, default: '' },
    deliveryStatus: {
      type: String,
      enum: ['Scheduled', 'In Transit', 'Partially Delivered', 'Delivered', 'Rejected'],
      default: 'Scheduled',
      index: true,
    },
  },
  { timestamps: true }
);

export const DeliveryModel = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
