# Student Performance Analysis System

A comprehensive web application for managing and analyzing student academic performance, marks, and attendance. Built with React, Node.js, Express, and MongoDB.

## 📋 Overview

This system provides a complete platform for:
- **Student Management**: Add, edit, and manage student records with attendance tracking
- **Marks Management**: Record marks for different exam types (Mid Semester 1, Mid Semester 2, End Semester)
- **Performance Analytics**: Calculate grades, risk levels, consistency scores, and predictions
- **Role-Based Access**: Admin, Faculty, and Student roles with specific permissions
- **Detailed Reports**: Class analytics, student rankings, and performance recommendations

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

**Frontend:**
- React 19
- Material-UI (MUI) for components
- Axios for API calls
- React Router for navigation
- Chart.js for performance visualization

## 📁 Project Structure

```
performance_analysis/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, signup, user creation
│   │   ├── studentController.js  # Student CRUD operations
│   │   ├── marksController.js    # Marks CRUD operations
│   │   └── analysisController.js # Performance calculation & analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   ├── validationMiddleware.js # Request validation
│   │   └── errorMiddleware.js    # Error handling
│   ├── models/
│   │   ├── User.js               # User schema (admin, faculty, student)
│   │   ├── Student.js            # Student details with attendance
│   │   ├── Marks.js              # Individual mark records
│   │   └── Performance.js        # Calculated performance metrics
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── studentRoutes.js      # Student management endpoints
│   │   ├── marksRoutes.js        # Marks management endpoints
│   │   └── analysisRoutes.js     # Performance analysis endpoints
│   ├── server.js                 # Express server entry point
│   ├── .env.example              # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js          # Authentication UI
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── Students.js       # Student management
│   │   │   ├── Marks.js          # Marks entry & management
│   │   │   ├── Performance.js    # Performance analytics & charts
│   │   │   └── Navbar.js         # Navigation component
│   │   ├── api.js                # Axios API client with interceptors
│   │   ├── App.js                # Main app component with routing
│   │   ├── App.css               # Styling
│   │   └── index.js              # React entry point
│   ├── package.json
│   └── README.md
│
└── .env.example                  # Root environment template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`):
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/student_performance_db
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   PORT=5001
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional):
   ```env
   REACT_APP_API_URL=http://localhost:5001
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## 👥 User Roles & Permissions

### Admin
- ✅ Create/edit/delete students
- ✅ Add faculty users
- ✅ View all marks and performance data
- ✅ View class analytics
- ✅ Manage all student records and attendance

### Faculty
- ✅ Add marks for students
- ✅ Edit/delete marks
- ✅ View student performance
- ✅ View class analytics
- ❌ Cannot manage student records

### Student
- ✅ View own marks
- ✅ View own performance analytics
- ✅ View performance recommendations
- ❌ Cannot add/edit marks
- ❌ Cannot view other students' data

## 📊 Key Features

### Performance Calculation
- **Grade**: A (85%+), B (70-85%), C (50-70%), F (<50%)
- **Risk Level**: Low (75%+), Medium (50-75%), High (<50%)
- **Consistency Score**: Based on standard deviation of marks (0-100)
- **Trend Detection**: Improving, Declining, or Stable
- **Predictions**: Next exam score prediction based on recent performance

### Marks Management
- **Exam Types**: Mid Semester 1, Mid Semester 2, End Semester
- **Subject Tracking**: Maintain marks by subject
- **Attendance**: Track and update attendance percentage
- **Duplicate Prevention**: Unique constraint on (student, subject, examType)

### Analytics
- Subject-wise performance breakdown
- Grade distribution across class
- Top performers ranking
- Weakest subjects identification
- Pass/Fail ratio

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Protected API endpoints
- Automatic token validation on requests

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin/Faculty creation (admin only)

### Students
- `GET /api/students` - List all students (admin/faculty)
- `GET /api/students/me` - Get logged-in student's info
- `GET /api/students/:rollNo` - Get student details
- `POST /api/students` - Add new student
- `PUT /api/students/:rollNo` - Update student
- `DELETE /api/students/:rollNo` - Delete student

### Marks
- `GET /api/marks` - Get marks (filtered by role)
- `GET /api/marks/student/:student_id` - Get specific student's marks
- `POST /api/marks` - Add marks
- `PUT /api/marks/:id` - Update marks
- `DELETE /api/marks/:id` - Delete marks

### Performance Analysis
- `POST /api/analysis/calculate/:rollNo` - Calculate student performance
- `GET /api/analysis/:rollNo` - Get student performance data
- `GET /api/analysis/class/analytics` - Get class-wide analytics

## 🎯 Workflow

1. **Admin/Faculty Login** → Navigate to dashboard
2. **Add Students** → Enter student details, create user accounts
3. **Record Marks** → Add marks for different exam types and subjects
4. **View Analytics** → Check performance metrics, trends, and recommendations
5. **Student Access** → Students login and view their performance

## 🛠️ Development

### Run Both Servers (Development)

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm start
```

### Database

MongoDB collections:
- `users` - User accounts with roles
- `students` - Student information with attendance
- `marks` - Individual mark records
- `performances` - Calculated performance metrics

## 📝 Environment Variables

**Backend (.env):**
```env
MONGO_URI=mongodb://127.0.0.1:27017/student_performance_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5001
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5001
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check `MONGO_URI` in `.env` and ensure MongoDB is running |
| Frontend can't reach API | Verify `REACT_APP_API_URL` and backend is running on correct port |
| Marks not updating | Clear browser cache, ensure exam type is valid (mid1, mid2, endsem) |
| Attendance showing 0% | Update student attendance through Edit Student dialog |

## 📦 Dependencies

**Backend:**
- express, mongoose, jsonwebtoken, bcryptjs, cors, dotenv

**Frontend:**
- react, react-router-dom, axios, @mui/material, chart.js, react-chartjs-2

## 🔄 Future Enhancements

- Email notifications for performance alerts
- Bulk marks import via CSV
- Advanced filtering and export reports
- Performance trend graphs
- Assignment and quiz marks tracking
- Document upload for assignments
- Parent portal access

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please check the code comments or documentation in respective files.

