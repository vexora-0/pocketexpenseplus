import express from 'express';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// GET /api/analytics/monthly?month=1&year=2024
router.get('/monthly', async (req: AuthRequest, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month/year if not provided
    const queryMonth = month ? Number(month) : new Date().getMonth() + 1;
    const queryYear = year ? Number(year) : new Date().getFullYear();
    
    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate total spent
    const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Calculate category totals
    const categoryTotalsMap = expenses.reduce((acc: any, exp: any) => {
      if (!acc[exp.category]) {
        acc[exp.category] = 0;
      }
      acc[exp.category] += exp.amount;
      return acc;
    }, {});

    // Convert to array with percentages
    const categoryTotals = Object.keys(categoryTotalsMap).map(category => ({
      category,
      total: categoryTotalsMap[category],
      percentage: totalSpent > 0 ? Math.round((categoryTotalsMap[category] / totalSpent) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    // Get last month for comparison
    const lastMonth = new Date(queryYear, queryMonth - 2, 1);
    const lastMonthEnd = new Date(queryYear, queryMonth - 1, 0, 23, 59, 59);
    const lastMonthExpenses = await Expense.find({
      userId: req.userId,
      date: { $gte: lastMonth, $lte: lastMonthEnd }
    });
    const lastMonthTotal = lastMonthExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Generate insights
    const insights: string[] = [];
    
    if (lastMonthTotal > 0) {
      const change = ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100;
      if (change > 10) {
        insights.push(`Your spending increased by ${Math.round(change)}% compared to last month`);
      } else if (change < -10) {
        insights.push(`Great! Your spending decreased by ${Math.round(Math.abs(change))}% compared to last month`);
      }
    }

    if (categoryTotals.length > 0) {
      const topCategory = categoryTotals[0];
      insights.push(`${topCategory.category} is your top spending category (${topCategory.percentage}% of total)`);
    }

    // Check budgets
    const budgets = await Budget.find({
      userId: req.userId,
      month: queryMonth,
      year: queryYear
    });

    if (budgets.length > 0) {
      const categorySpending = categoryTotalsMap;
      const exceededBudgets = budgets.filter(budget => {
        const spent = categorySpending[budget.category] || 0;
        return spent > budget.limit;
      });

      if (exceededBudgets.length > 0) {
        insights.push(`You've exceeded your budget in ${exceededBudgets.length} categor${exceededBudgets.length > 1 ? 'ies' : 'y'}`);
      }
    }

    if (insights.length === 0) {
      insights.push('Keep tracking your expenses to get personalized insights!');
    }

    res.json({
      totalSpent,
      categoryTotals,
      insights
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/insights
router.get('/insights', async (req: AuthRequest, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get current month expenses
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Get last 3 months for trend analysis
    const insights: string[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const monthStart = new Date(currentYear, currentMonth - i - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth - i, 0, 23, 59, 59);
      const monthExpenses = await Expense.find({
        userId: req.userId,
        date: { $gte: monthStart, $lte: monthEnd }
      });
      const monthTotal = monthExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
      
      if (i === 1 && monthTotal > 0) {
        const change = ((totalSpent - monthTotal) / monthTotal) * 100;
        if (Math.abs(change) > 5) {
          insights.push(`This month's spending is ${change > 0 ? 'up' : 'down'} ${Math.round(Math.abs(change))}% from last month`);
        }
      }
    }

    // Average daily spending
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const avgDaily = totalSpent / daysInMonth;
    insights.push(`You're spending an average of ₹${avgDaily.toFixed(2)} per day this month`);

    // Top category
    const categoryTotals = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    if (Object.keys(categoryTotals).length > 0) {
      const topCategory = Object.entries(categoryTotals)
        .sort(([, a]: any, [, b]: any) => b - a)[0] as [string, number];
      insights.push(`Most spending is on ${topCategory[0]} (₹${topCategory[1].toFixed(2)})`);
    }

    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

