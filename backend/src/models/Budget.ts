import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  month: number;
  year: number;
}

const budgetSchema = new Schema<IBudget>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true }
}, { timestamps: true });

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);

