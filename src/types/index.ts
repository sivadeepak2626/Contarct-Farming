export type UserRole = 'admin' | 'farmer' | 'buyer' | 'officer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  associatedId?: string;
}

export interface Farmer {
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
  registrationDate: string | Date;
  accountStatus: 'active' | 'inactive';
  assignedFieldOfficerId?: string;
  assignedOfficer?: FieldOfficer;
}

export interface Buyer {
  buyerId: string;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessAddress: string;
  registrationNumber?: string;
  preferredCrops: string[];
  accountStatus: 'active' | 'inactive';
}

export interface FieldOfficer {
  officerId: string;
  name: string;
  email: string;
  phoneNumber: string;
  assignedRegion: string;
  assignedFarmerIds: string[];
  employmentStatus: 'active' | 'inactive';
}

export interface Crop {
  cropId: string;
  cropName: string;
  variety: string;
  cropCategory: 'Cereal' | 'Pulse' | 'Oilseed' | 'Commercial' | 'Horticulture';
  growingSeason: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  cultivationDurationDays: number;
  unitOfMeasurement: 'kg' | 'quintal' | 'ton';
  status: 'active' | 'inactive';
}

export interface ContractStatusHistory {
  status: string;
  timestamp: string | Date;
  notes: string;
  updatedBy: string;
}

export interface Contract {
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
  contractStartDate: string | Date;
  expectedHarvestDate: string | Date;
  contractEndDate: string | Date;
  cultivatedLandAreaAcres: number;
  agreedQuantity: number;
  unitOfMeasurement: string;
  agreedPricePerUnit: number;
  grossContractValue: number;
  deliveryDeadline: string | Date;
  paymentTerms: string;
  qualityStandards: string;
  additionalTerms?: string;
  contractStatus: 'Draft' | 'Pending Approval' | 'Active' | 'In Progress' | 'Completed' | 'Cancelled';
  statusHistory: ContractStatusHistory[];
}

export interface CultivationTimeline {
  stage: string;
  date: string | Date;
  notes: string;
  recordedBy: string;
}

export interface CultivationRecord {
  cultivationId: string;
  farmerId: string;
  farmerName: string;
  contractId: string;
  cropId: string;
  cropName: string;
  landAreaAcres: number;
  sowingDate: string | Date;
  expectedHarvestDate: string | Date;
  actualHarvestDate?: string | Date;
  expectedYieldKg: number;
  actualYieldKg?: number;
  currentGrowthStage: 'Land Preparation' | 'Sowing' | 'Growing' | 'Flowering' | 'Harvesting' | 'Harvest Completed';
  stageProgressPercent: number;
  notes: string;
  activityTimeline: CultivationTimeline[];
}

export interface FieldVisit {
  visitId: string;
  fieldOfficerId: string;
  fieldOfficerName: string;
  farmerId: string;
  farmerName: string;
  contractId: string;
  visitDate: string | Date;
  visitType: 'Routine' | 'Pest Inspection' | 'Input Verification' | 'Pre-Harvest' | 'Emergency';
  cropGrowthStage: string;
  cropHealthStatus: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Critical';
  weatherObservations?: string;
  irrigationStatus: 'Adequate' | 'Deficit' | 'Excess' | 'Optimal';
  pestOrDiseaseObservations?: string;
  fertilizerAndInputObservations?: string;
  recommendations: string;
  followUpDate?: string | Date;
  visitStatus: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface InputIssue {
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
  reportedDate: string | Date;
  assignedFieldOfficerId?: string;
  assignedFieldOfficerName?: string;
  resolutionNotes?: string;
  status: 'Open' | 'Under Review' | 'Assigned' | 'Resolved' | 'Closed';
}

export interface Harvest {
  harvestId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  harvestDate: string | Date;
  expectedQuantity: number;
  actualQuantityHarvested: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Commercial';
  inspectionNotes?: string;
  recordedBy: string;
  harvestStatus: 'Pending Verification' | 'Verified' | 'Disputed';
}

export interface Delivery {
  deliveryId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  scheduledDeliveryDate: string | Date;
  actualDeliveryDate?: string | Date;
  plannedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  deliveryLocation: string;
  qualityStatus: 'Passed' | 'Conditional' | 'Failed';
  notes?: string;
  deliveryStatus: 'Scheduled' | 'In Transit' | 'Partially Delivered' | 'Delivered' | 'Rejected';
}

export interface Settlement {
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
  paymentDueDate: string | Date;
  settlementStatus: 'Pending Review' | 'Approved' | 'Partially Paid' | 'Paid' | 'Overdue';
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string | Date;
}

export interface PaymentTransaction {
  transactionId: string;
  settlementId: string;
  contractId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  paymentDate: string | Date;
  paymentMode: 'NEFT' | 'RTGS' | 'UPI' | 'Direct Bank Transfer' | 'Cheque';
  referenceNumber: string;
  remarks?: string;
  recordedBy: string;
}

export interface NotificationItem {
  notificationId: string;
  recipientRole: string;
  recipientId?: string;
  title: string;
  message: string;
  type: string;
  priority: 'info' | 'warning' | 'alert';
  link?: string;
  isRead: boolean;
  createdAt: string | Date;
}
