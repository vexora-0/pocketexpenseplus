# PocketExpense+ Frontend

A React Native mobile application for expense tracking with insights and budget management.

## Features

- 📱 **Expense Management**: Add, edit, and delete expenses
- 📊 **Insights**: View monthly spending analysis and category breakdown
- 💰 **Budget Tracking**: Set and monitor category-wise budgets
- 🔄 **Offline Support**: Works offline and syncs when online
- 🎨 **Modern UI**: Clean black and white theme
- 📈 **Analytics**: Track spending patterns and get insights

## Tech Stack

- React Native (Expo)
- TypeScript
- React Navigation
- React Native Paper
- AsyncStorage
- Axios
- NetInfo

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on device)

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Update API URL in `src/services/api.ts`:
   - For Android Emulator: `http://10.0.2.2:3000/api`
   - For iOS Simulator: `http://localhost:3000/api`
   - For Physical Device: `http://<YOUR_IP>:3000/api`

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app

## Project Structure

```
frontend/
├── App.tsx                 # Root component
├── src/
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ExpenseContext.tsx
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/           # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ExpensesScreen.tsx
│   │   ├── AddExpenseScreen.tsx
│   │   ├── InsightsScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # API and offline services
│   │   ├── api.ts
│   │   └── offlineService.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── utils/             # Utility functions
│       └── storage.ts
├── package.json
└── tsconfig.json
```

## Key Components

### Authentication
- JWT-based authentication
- Persistent login with AsyncStorage
- Auto-login on app start

### Expense Management
- Add expenses with amount, category, payment method, date, and notes
- Edit and delete expenses
- Filter by category
- View daily or monthly grouped expenses

### Insights
- Monthly spending summary
- Category-wise breakdown with percentages
- Visual progress bars
- AI-generated spending insights
- Month/year navigation with date picker

### Budget Management
- Set monthly budgets per category
- Visual progress tracking
- Overspend warnings
- Budget vs actual comparison

### Offline Support
- Expenses saved locally when offline
- Auto-sync when connection is restored
- Pending sync indicator

## Screens Overview

1. **Login/Register**: User authentication
2. **Expenses**: Main expense list with filters
3. **Add/Edit Expense**: Form to add or modify expenses
4. **Insights**: Analytics and spending patterns
5. **Budget**: Budget management and tracking
6. **Profile**: User information and logout

## Color Scheme

- Background: Black (#000000)
- Text: White (#ffffff)
- Accents: White buttons with black text
- Cards: Transparent white overlays

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/expenses` - Fetch all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/analytics/monthly` - Monthly statistics
- `GET /api/budgets` - Fetch budgets
- `POST /api/budgets` - Create budget
- `DELETE /api/budgets/:id` - Delete budget

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Clear Cache
```bash
npx expo start -c
```

## Troubleshooting

1. **Connection Issues**: Update API URL to match your backend
2. **Build Errors**: Clear cache with `npx expo start -c`
3. **Type Errors**: Run `npx tsc --noEmit` to check TypeScript errors

## Notes

- Ensure backend is running before starting the app
- Use Android Emulator or physical device for testing
- Expo Go is recommended for development

