import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
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
} from './data/seedData.ts';

import { UserModel } from './models/User.ts';
import { FarmerModel } from './models/Farmer.ts';
import { BuyerModel } from './models/Buyer.ts';
import { FieldOfficerModel } from './models/FieldOfficer.ts';
import { CropModel } from './models/Crop.ts';
import { ContractModel } from './models/Contract.ts';
import { CultivationRecordModel } from './models/CultivationRecord.ts';
import { FieldVisitModel } from './models/FieldVisit.ts';
import { InputIssueModel } from './models/InputIssue.ts';
import { HarvestModel } from './models/Harvest.ts';
import { DeliveryModel } from './models/Delivery.ts';
import { SettlementModel } from './models/Settlement.ts';
import { PaymentTransactionModel } from './models/PaymentTransaction.ts';
import { NotificationModel } from './models/Notification.ts';

dotenv.config();

const seedDatabase = async () => {
  console.log('[Seed] Connecting to MongoDB...');
  const connected = await connectDB();

  if (!connected) {
    console.error('[Seed] Could not connect to MongoDB. Check MONGODB_URI in your .env file.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      FarmerModel.deleteMany({}),
      BuyerModel.deleteMany({}),
      FieldOfficerModel.deleteMany({}),
      CropModel.deleteMany({}),
      ContractModel.deleteMany({}),
      CultivationRecordModel.deleteMany({}),
      FieldVisitModel.deleteMany({}),
      InputIssueModel.deleteMany({}),
      HarvestModel.deleteMany({}),
      DeliveryModel.deleteMany({}),
      SettlementModel.deleteMany({}),
      PaymentTransactionModel.deleteMany({}),
      NotificationModel.deleteMany({}),
    ]);

    console.log('[Seed] Inserting initial Indian agricultural dataset...');
    await UserModel.insertMany(INITIAL_USERS);
    await FarmerModel.insertMany(INITIAL_FARMERS);
    await BuyerModel.insertMany(INITIAL_BUYERS);
    await FieldOfficerModel.insertMany(INITIAL_FIELD_OFFICERS);
    await CropModel.insertMany(INITIAL_CROPS);
    await ContractModel.insertMany(INITIAL_CONTRACTS);
    await CultivationRecordModel.insertMany(INITIAL_CULTIVATIONS);
    await FieldVisitModel.insertMany(INITIAL_FIELD_VISITS);
    await InputIssueModel.insertMany(INITIAL_INPUT_ISSUES);
    await HarvestModel.insertMany(INITIAL_HARVESTS);
    await DeliveryModel.insertMany(INITIAL_DELIVERIES);
    await SettlementModel.insertMany(INITIAL_SETTLEMENTS);
    await PaymentTransactionModel.insertMany(INITIAL_PAYMENT_TRANSACTIONS);
    await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);

    console.log('[Seed] Successfully seeded FarmContract database!');
    console.log(`- ${INITIAL_FARMERS.length} Farmers`);
    console.log(`- ${INITIAL_BUYERS.length} Buyers`);
    console.log(`- ${INITIAL_FIELD_OFFICERS.length} Field Officers`);
    console.log(`- ${INITIAL_CROPS.length} Crops`);
    console.log(`- ${INITIAL_CONTRACTS.length} Contracts`);
    console.log(`- ${INITIAL_SETTLEMENTS.length} Settlements & Receipts`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
