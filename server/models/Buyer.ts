import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyer extends Document {
  buyerId: string;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessAddress: string;
  registrationNumber?: string;
  preferredCrops: string[];
  accountStatus: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BuyerSchema = new Schema<IBuyer>(
  {
    buyerId: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    businessAddress: { type: String, required: true, trim: true },
    registrationNumber: { type: String, trim: true },
    preferredCrops: [{ type: String, trim: true }],
    accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const BuyerModel = mongoose.models.Buyer || mongoose.model<IBuyer>('Buyer', BuyerSchema);
