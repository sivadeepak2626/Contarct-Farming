import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  cropId: string;
  cropName: string;
  variety: string;
  cropCategory: 'Cereal' | 'Pulse' | 'Oilseed' | 'Commercial' | 'Horticulture';
  growingSeason: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  cultivationDurationDays: number;
  unitOfMeasurement: 'kg' | 'quintal' | 'ton';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
  {
    cropId: { type: String, required: true, unique: true, index: true },
    cropName: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    cropCategory: {
      type: String,
      enum: ['Cereal', 'Pulse', 'Oilseed', 'Commercial', 'Horticulture'],
      required: true,
    },
    growingSeason: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Perennial'],
      required: true,
    },
    cultivationDurationDays: { type: Number, required: true, min: 1 },
    unitOfMeasurement: { type: String, enum: ['kg', 'quintal', 'ton'], default: 'kg' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const CropModel = mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema);
