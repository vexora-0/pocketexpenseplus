# PocketExpense+ - Expense Tracking with Insights

Full-stack expense tracking app with offline support, insights, and budget management.

## Features

- User authentication (JWT)
- Add, edit, delete expenses
- View expenses (daily, monthly, all)
- Category-wise breakdown
- Spending insights with month-over-month comparison
- Offline support with automatic sync
- Monthly budget limits
- Overspending notifications

## Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- Tamagui UI
- React Navigation
- Context API
- AsyncStorage

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB
- JWT Authentication

## Setup

### Prerequisites
- Node.js (v20 or v22 recommended)
- MongoDB (local or cloud)
- Expo CLI (optional, comes with npm start)

### Backend

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pocketexpense
JWT_SECRET=your_jwt_secret_key_here_change_this
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# Windows (if installed as service, it should auto-start)
# Or use MongoDB Atlas for cloud database
```

5. Run backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

6. (Optional) Seed database with sample data:
```bash
npm run seed
```

This creates a test user with sample expenses and budgets:
- Email: `test@example.com`
- Password: `password123`

### Frontend

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/services/api.ts`:
   - For Android emulator: `http://10.0.2.2:5000/api`
   - For iOS simulator: `http://localhost:5000/api`
   - For physical device: `http://YOUR_COMPUTER_IP:5000/api`

4. Run app:
```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses (query: startDate, endDate, category)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get stats (query: month, year)

### Budget
- `GET /api/budget` - Get budgets (query: month, year)
- `POST /api/budget` - Create/update budget
- `DELETE /api/budget/:id` - Delete budget

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── index.ts      # Server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── services/     # API services
│   │   ├── context/      # State management
│   │   ├── navigation/   # Navigation setup
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

