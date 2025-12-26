import express from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category, month, year },
      { limit },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month/year if not provided
    const queryMonth = month ? Number(month) : new Date().getMonth() + 1;
    const queryYear = year ? Number(year) : new Date().getFullYear();
    
    const budgets = await Budget.find({
      userId: req.userId,
      month: queryMonth,
      year: queryYear
    });

    const expenses = await Expense.find({
      userId: req.userId,
      date: {
        $gte: new Date(queryYear, queryMonth - 1, 1),
        $lte: new Date(queryYear, queryMonth, 0, 23, 59, 59)
      }
    });

    const categorySpending = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const budgetStatus = budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const remaining = budget.limit - spent;
      const percentage = (spent / budget.limit) * 100;
      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentage: Math.round(percentage),
        exceeded: spent > budget.limit
      };
    });

    res.json(budgetStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Budget deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

