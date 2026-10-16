import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentTransaction extends Document {
  transactionId: string;
  settlementId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  paymentDate: Date;
  paymentMode: 'NEFT' | 'RTGS' | 'UPI' | 'Direct Bank Transfer' | 'Cheque';
  referenceNumber: string;
  remarks?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    settlementId: { type: String, required: true, index: true },
    contractId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: {
      type: String,
      enum: ['NEFT', 'RTGS', 'UPI', 'Direct Bank Transfer', 'Cheque'],
      required: true,
    },
    referenceNumber: { type: String, required: true, trim: true },
    remarks: { type: String, default: '' },
    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const PaymentTransactionModel =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
