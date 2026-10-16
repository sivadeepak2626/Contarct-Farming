import mongoose, { Schema, Document } from 'mongoose';

export interface ICultivationTimeline {
  stage: string;
  date: Date;
  notes: string;
  recordedBy: string;
}

export interface ICultivationRecord extends Document {
  cultivationId: string;
  farmerId: string;
  farmerName: string;
  contractId: string;
  cropId: string;
  cropName: string;
  landAreaAcres: number;
  sowingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  expectedYieldKg: number;
  actualYieldKg?: number;
  currentGrowthStage: 'Land Preparation' | 'Sowing' | 'Growing' | 'Flowering' | 'Harvesting' | 'Harvest Completed';
  stageProgressPercent: number;
  notes: string;
  activityTimeline: ICultivationTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const CultivationRecordSchema = new Schema<ICultivationRecord>(
  {
    cultivationId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    contractId: { type: String, required: true, index: true },
    cropId: { type: String, required: true },
    cropName: { type: String, required: true },
    landAreaAcres: { type: Number, required: true, min: 0.1 },
    sowingDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    actualHarvestDate: { type: Date },
    expectedYieldKg: { type: Number, required: true },
    actualYieldKg: { type: Number },
    currentGrowthStage: {
      type: String,
      enum: ['Land Preparation', 'Sowing', 'Growing', 'Flowering', 'Harvesting', 'Harvest Completed'],
      default: 'Land Preparation',
      index: true,
    },
    stageProgressPercent: { type: Number, default: 10, min: 0, max: 100 },
    notes: { type: String, default: '' },
    activityTimeline: [
      {
        stage: { type: String, required: true },
        date: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        recordedBy: { type: String, default: 'Officer' },
      },
    ],
  },
  { timestamps: true }
);

export const CultivationRecordModel =
  mongoose.models.CultivationRecord ||
  mongoose.model<ICultivationRecord>('CultivationRecord', CultivationRecordSchema);
