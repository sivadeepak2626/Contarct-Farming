import {
  INITIAL_USERS,
  INITIAL_FARMERS,
  INITIAL_BUYERS,
  INITIAL_FIELD_OFFICERS,
  INITIAL_CROPS,
  INITIAL_CONTRACTS,
  INITIAL_CULTIVATIONS,
  INITIAL_FIELD_VISITS,
  INITIAL_INPUT_ISSUES,
  INITIAL_HARVESTS,
  INITIAL_DELIVERIES,
  INITIAL_SETTLEMENTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from './seedData.ts';
import { UserModel } from '../models/User.ts';
import { FarmerModel } from '../models/Farmer.ts';
import { BuyerModel } from '../models/Buyer.ts';
import { FieldOfficerModel } from '../models/FieldOfficer.ts';
import { CropModel } from '../models/Crop.ts';
import { ContractModel } from '../models/Contract.ts';
import { CultivationRecordModel } from '../models/CultivationRecord.ts';
import { FieldVisitModel } from '../models/FieldVisit.ts';
import { InputIssueModel } from '../models/InputIssue.ts';
import { HarvestModel } from '../models/Harvest.ts';
import { DeliveryModel } from '../models/Delivery.ts';
import { SettlementModel } from '../models/Settlement.ts';
import { PaymentTransactionModel } from '../models/PaymentTransaction.ts';
import { NotificationModel } from '../models/Notification.ts';
import mongoose from 'mongoose';

class DataStore {
  users: any[] = [...INITIAL_USERS];
  farmers: any[] = [...INITIAL_FARMERS];
  buyers: any[] = [...INITIAL_BUYERS];
  fieldOfficers: any[] = [...INITIAL_FIELD_OFFICERS];
  crops: any[] = [...INITIAL_CROPS];
  contracts: any[] = [...INITIAL_CONTRACTS];
  cultivations: any[] = [...INITIAL_CULTIVATIONS];
  fieldVisits: any[] = [...INITIAL_FIELD_VISITS];
  inputIssues: any[] = [...INITIAL_INPUT_ISSUES];
  harvests: any[] = [...INITIAL_HARVESTS];
  deliveries: any[] = [...INITIAL_DELIVERIES];
  settlements: any[] = [...INITIAL_SETTLEMENTS];
  paymentTransactions: any[] = [...INITIAL_PAYMENT_TRANSACTIONS];
  notifications: any[] = [...INITIAL_NOTIFICATIONS];

  // Try syncing to MongoDB if connected
  async syncToMongoIfConnected() {
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await UserModel.countDocuments();
        if (count === 0) {
          console.log('[DataStore] Seeding MongoDB database with initial records...');
          await UserModel.insertMany(this.users);
          await FarmerModel.insertMany(this.farmers);
          await BuyerModel.insertMany(this.buyers);
          await FieldOfficerModel.insertMany(this.fieldOfficers);
          await CropModel.insertMany(this.crops);
          await ContractModel.insertMany(this.contracts);
          await CultivationRecordModel.insertMany(this.cultivations);
          await FieldVisitModel.insertMany(this.fieldVisits);
          await InputIssueModel.insertMany(this.inputIssues);
          await HarvestModel.insertMany(this.harvests);
          await DeliveryModel.insertMany(this.deliveries);
          await SettlementModel.insertMany(this.settlements);
          await PaymentTransactionModel.insertMany(this.paymentTransactions);
          await NotificationModel.insertMany(this.notifications);
          console.log('[DataStore] MongoDB successfully seeded!');
        }
      } catch (err: any) {
        console.warn('[DataStore] MongoDB sync warning:', err.message);
      }
    }
  }

  // Reset to seed data
  reset() {
    this.users = [...INITIAL_USERS];
    this.farmers = [...INITIAL_FARMERS];
    this.buyers = [...INITIAL_BUYERS];
    this.fieldOfficers = [...INITIAL_FIELD_OFFICERS];
    this.crops = [...INITIAL_CROPS];
    this.contracts = [...INITIAL_CONTRACTS];
    this.cultivations = [...INITIAL_CULTIVATIONS];
    this.fieldVisits = [...INITIAL_FIELD_VISITS];
    this.inputIssues = [...INITIAL_INPUT_ISSUES];
    this.harvests = [...INITIAL_HARVESTS];
    this.deliveries = [...INITIAL_DELIVERIES];
    this.settlements = [...INITIAL_SETTLEMENTS];
    this.paymentTransactions = [...INITIAL_PAYMENT_TRANSACTIONS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
  }
}

export const dbStore = new DataStore();
