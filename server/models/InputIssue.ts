import mongoose, { Schema, Document } from 'mongoose';

export interface IInputIssue extends Document {
  issueId: string;
  farmerId: string;
  farmerName: string;
  contractId: string;
  cropName: string;
  issueCategory: 'Seeds' | 'Fertilizer' | 'Pesticides' | 'Irrigation' | 'Equipment' | 'Other';
  inputName: string;
  description: string;
  quantityRequired?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedDate: Date;
  assignedFieldOfficerId?: string;
  assignedFieldOfficerName?: string;
  resolutionNotes?: string;
  status: 'Open' | 'Under Review' | 'Assigned' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const InputIssueSchema = new Schema<IInputIssue>(
  {
    issueId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    contractId: { type: String, required: true, index: true },
    cropName: { type: String, required: true },
    issueCategory: {
      type: String,
      enum: ['Seeds', 'Fertilizer', 'Pesticides', 'Irrigation', 'Equipment', 'Other'],
      required: true,
    },
    inputName: { type: String, required: true },
    description: { type: String, required: true },
    quantityRequired: { type: String },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    reportedDate: { type: Date, default: Date.now },
    assignedFieldOfficerId: { type: String, index: true },
    assignedFieldOfficerName: { type: String },
    resolutionNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Open', 'Under Review', 'Assigned', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
  },
  { timestamps: true }
);

export const InputIssueModel =
  mongoose.models.InputIssue || mongoose.model<IInputIssue>('InputIssue', InputIssueSchema);
