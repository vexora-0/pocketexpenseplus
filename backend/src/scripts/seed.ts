import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import bcrypt from 'bcryptjs';

dotenv.config();

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const paymentMethods = ['Cash', 'Card', 'UPI', 'Online'];

const seedExpenses = async (userId: mongoose.Types.ObjectId) => {
  const expenses = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const amount = Math.floor(Math.random() * 5000) + 100;
    
    expenses.push({
      userId,
      amount,
      category,
      paymentMethod,
      date,
      description: `Sample expense ${i + 1}`
    });
  }
  
  await Expense.insertMany(expenses);
  console.log(`Created ${expenses.length} expenses`);
};

const seedBudgets = async (userId: mongoose.Types.ObjectId) => {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  
  const budgets = [
    { category: 'Food', limit: 5000 },
    { category: 'Transport', limit: 3000 },
    { category: 'Shopping', limit: 10000 },
    { category: 'Bills', limit: 5000 },
    { category: 'Entertainment', limit: 2000 },
  ];
  
  for (const budget of budgets) {
    await Budget.create({
      userId,
      category: budget.category,
      limit: budget.limit,
      month,
      year
    });
  }
  
  console.log(`Created ${budgets.length} budgets`);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pocketexpense');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});
    console.log('Cleared existing data');

    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    console.log('Created test user:', user.email);

    await seedExpenses(user._id);
    await seedBudgets(user._id);

    console.log('\n✅ Seeding completed!');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();

