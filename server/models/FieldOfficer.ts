import mongoose, { Schema, Document } from 'mongoose';

export interface IFieldOfficer extends Document {
  officerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  assignedRegion: string;
  assignedFarmerIds: string[];
  employmentStatus: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const FieldOfficerSchema = new Schema<IFieldOfficer>(
  {
    officerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    assignedRegion: { type: String, required: true, trim: true },
    assignedFarmerIds: [{ type: String, trim: true }],
    employmentStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const FieldOfficerModel =
  mongoose.models.FieldOfficer || mongoose.model<IFieldOfficer>('FieldOfficer', FieldOfficerSchema);
