import express from 'express';
import Expense from '../models/Expense';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: req.userId });
    await expense.save();
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query: any = { userId: req.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const categoryBreakdown = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const total = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const lastMonth = new Date(Number(year), Number(month) - 2, 1);
    const lastMonthEnd = new Date(Number(year), Number(month) - 1, 0, 23, 59, 59);
    const lastMonthExpenses = await Expense.find({
      userId: req.userId,
      date: { $gte: lastMonth, $lte: lastMonthEnd }
    });

    const lastMonthCategoryBreakdown = lastMonthExpenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const insights = Object.keys(categoryBreakdown).map(category => {
      const current = categoryBreakdown[category];
      const last = lastMonthCategoryBreakdown[category] || 0;
      const change = last > 0 ? ((current - last) / last) * 100 : 0;
      return {
        category,
        current,
        last,
        change: Math.round(change)
      };
    });

    res.json({ total, categoryBreakdown, insights });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

