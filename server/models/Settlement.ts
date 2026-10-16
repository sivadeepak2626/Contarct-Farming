import mongoose, { Schema, Document } from 'mongoose';

export interface ISettlement extends Document {
  settlementId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  totalAcceptedQuantity: number;
  agreedUnitPrice: number;
  grossAmount: number;
  deductions: number;
  deductionReason?: string;
  authorizedDeductionBy?: string;
  otherAdjustments: number;
  adjustmentReason?: string;
  netPayableAmount: number;
  amountAlreadyPaid: number;
  outstandingBalance: number;
  paymentDueDate: Date;
  settlementStatus: 'Pending Review' | 'Approved' | 'Partially Paid' | 'Paid' | 'Overdue';
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
  {
    settlementId: { type: String, required: true, unique: true, index: true },
    contractId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    cropName: { type: String, required: true },
    totalAcceptedQuantity: { type: Number, required: true, min: 0 },
    agreedUnitPrice: { type: Number, required: true, min: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    deductionReason: { type: String },
    authorizedDeductionBy: { type: String },
    otherAdjustments: { type: Number, default: 0 },
    adjustmentReason: { type: String },
    netPayableAmount: { type: Number, required: true, min: 0 },
    amountAlreadyPaid: { type: Number, default: 0, min: 0 },
    outstandingBalance: { type: Number, required: true },
    paymentDueDate: { type: Date, required: true },
    settlementStatus: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Pending Review',
      index: true,
    },
    approvalNotes: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export const SettlementModel =
  mongoose.models.Settlement || mongoose.model<ISettlement>('Settlement', SettlementSchema);
