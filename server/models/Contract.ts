import mongoose, { Schema, Document } from 'mongoose';

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  notes: string;
  updatedBy: string;
}

export interface IContract extends Document {
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  cropId: string;
  cropName: string;
  fieldOfficerId?: string;
  fieldOfficerName?: string;
  farmingSeason: string;
  contractStartDate: Date;
  expectedHarvestDate: Date;
  contractEndDate: Date;
  cultivatedLandAreaAcres: number;
  agreedQuantity: number;
  unitOfMeasurement: string;
  agreedPricePerUnit: number;
  grossContractValue: number;
  deliveryDeadline: Date;
  paymentTerms: string;
  qualityStandards: string;
  additionalTerms?: string;
  contractStatus: 'Draft' | 'Pending Approval' | 'Active' | 'In Progress' | 'Completed' | 'Cancelled';
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    contractId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    cropId: { type: String, required: true },
    cropName: { type: String, required: true },
    fieldOfficerId: { type: String, index: true },
    fieldOfficerName: { type: String },
    farmingSeason: { type: String, required: true },
    contractStartDate: { type: Date, required: true },
    expectedHarvestDate: { type: Date, required: true },
    contractEndDate: { type: Date, required: true },
    cultivatedLandAreaAcres: { type: Number, required: true, min: 0.1 },
    agreedQuantity: { type: Number, required: true, min: 1 },
    unitOfMeasurement: { type: String, default: 'kg' },
    agreedPricePerUnit: { type: Number, required: true, min: 0.01 },
    grossContractValue: { type: Number, required: true },
    deliveryDeadline: { type: Date, required: true },
    paymentTerms: { type: String, required: true },
    qualityStandards: { type: String, required: true },
    additionalTerms: { type: String },
    contractStatus: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Active', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        updatedBy: { type: String, default: 'System' },
      },
    ],
  },
  { timestamps: true }
);

export const ContractModel = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
