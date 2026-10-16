import mongoose, { Schema, Document } from 'mongoose';

export interface IFieldVisit extends Document {
  visitId: string;
  fieldOfficerId: string;
  fieldOfficerName: string;
  farmerId: string;
  farmerName: string;
  contractId: string;
  visitDate: Date;
  visitType: 'Routine' | 'Pest Inspection' | 'Input Verification' | 'Pre-Harvest' | 'Emergency';
  cropGrowthStage: string;
  cropHealthStatus: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
  weatherObservations?: string;
  irrigationStatus: 'Adequate' | 'Deficit' | 'Excess' | 'Optimal';
  pestOrDiseaseObservations?: string;
  fertilizerAndInputObservations?: string;
  recommendations: string;
  followUpDate?: Date;
  visitStatus: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const FieldVisitSchema = new Schema<IFieldVisit>(
  {
    visitId: { type: String, required: true, unique: true, index: true },
    fieldOfficerId: { type: String, required: true, index: true },
    fieldOfficerName: { type: String, required: true },
    farmerId: { type: String, required: true, index: true },
    farmerName: { type: String, required: true },
    contractId: { type: String, required: true, index: true },
    visitDate: { type: Date, required: true },
    visitType: {
      type: String,
      enum: ['Routine', 'Pest Inspection', 'Input Verification', 'Pre-Harvest', 'Emergency'],
      default: 'Routine',
    },
    cropGrowthStage: { type: String, required: true },
    cropHealthStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'Poor', 'Critical'],
      default: 'Good',
    },
    weatherObservations: { type: String },
    irrigationStatus: {
      type: String,
      enum: ['Adequate', 'Deficit', 'Excess', 'Optimal'],
      default: 'Adequate',
    },
    pestOrDiseaseObservations: { type: String },
    fertilizerAndInputObservations: { type: String },
    recommendations: { type: String, required: true },
    followUpDate: { type: Date },
    visitStatus: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
  },
  { timestamps: true }
);

export const FieldVisitModel =
  mongoose.models.FieldVisit || mongoose.model<IFieldVisit>('FieldVisit', FieldVisitSchema);
