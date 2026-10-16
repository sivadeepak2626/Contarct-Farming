import mongoose, { Schema, Document } from 'mongoose';

export interface IHarvest extends Document {
  harvestId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  harvestDate: Date;
  expectedQuantity: number;
  actualQuantityHarvested: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Commercial';
  inspectionNotes?: string;
  recordedBy: string;
  harvestStatus: 'Pending Verification' | 'Verified' | 'Disputed';
  createdAt: Date;
  updatedAt: Date;
}

const HarvestSchema = new Schema<IHarvest>(
  {
    harvestId: { type: String, required: true, unique: true, index: true },
    contractId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    cropName: { type: String, required: true },
    harvestDate: { type: Date, required: true },
    expectedQuantity: { type: Number, required: true, min: 0 },
    actualQuantityHarvested: { type: Number, required: true, min: 0 },
    acceptedQuantity: { type: Number, required: true, min: 0 },
    rejectedQuantity: { type: Number, required: true, min: 0 },
    qualityGrade: {
      type: String,
      enum: ['Grade A', 'Grade B', 'Grade C', 'Commercial'],
      default: 'Grade A',
    },
    inspectionNotes: { type: String, default: '' },
    recordedBy: { type: String, required: true },
    harvestStatus: {
      type: String,
      enum: ['Pending Verification', 'Verified', 'Disputed'],
      default: 'Verified',
      index: true,
    },
  },
  { timestamps: true }
);

export const HarvestModel = mongoose.models.Harvest || mongoose.model<IHarvest>('Harvest', HarvestSchema);
