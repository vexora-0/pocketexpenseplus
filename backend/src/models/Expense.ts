import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  paymentMethod: string;
  date: Date;
  description?: string;
}

const expenseSchema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);

