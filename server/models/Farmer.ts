import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  farmerId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  village: string;
  district: string;
  state: string;
  farmAddress: string;
  totalLandAreaAcres: number;
  cropsCultivated: string[];
  registrationDate: Date;
  accountStatus: 'active' | 'inactive';
  assignedFieldOfficerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    farmerId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    farmAddress: { type: String, required: true, trim: true },
    totalLandAreaAcres: { type: Number, required: true, min: 0.1 },
    cropsCultivated: [{ type: String, trim: true }],
    registrationDate: { type: Date, default: Date.now },
    accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
    assignedFieldOfficerId: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

export const FarmerModel = mongoose.models.Farmer || mongoose.model<IFarmer>('Farmer', FarmerSchema);
