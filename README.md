# Primetrade - Task Management App

Welcome to Primetrade! This is a modern, responsive, full-stack task management application with real-time updates, strict role-based access control, and an intuitive Kanban dashboard.

## 🚀 About the Project
Primetrade was built to simplify team workflows using an intuitive interface. It separates users into **Administrators** and **Team Members (Users)**, ensuring strong accountability constraint on task updates.

**Key Features:**
- **Interactive Kanban Board**: Drag and drop tasks with strict status validations.
- **Multi-user Assignment**: Assign multiple team members to a task; task transitions dynamically scale based on user consensus.
- **Real-time Activity Feed**: Integrated with WebSockets to stream team updates live.
- **Admin Control Panel**: Hidden portal for administrators to manage users, suspend accounts, and view overall analytics.
- **API Documentation**: Auto-generated interactive API docs (`/api-docs`).

---

## 🔐 Accounts & Access

Because Primetrade enforces strict role hierarchies, **the Admin portal is visually hidden from regular users** to prevent unauthorized access attempts.

### 1. Admin Portal
- **URL**: `https://primetrade-ua5d.onrender.com/admin/login`
- **Email**: `admin@primetrade.com`
- **Password**: `Admin`

*Note: There is no button on the homepage to access the Admin portal. You must navigate to the `/admin/login` URL manually.*

### 2. User Portal
- **URL**: `https://primetrade-ua5d.onrender.com/user/login` or click "Sign In" on the homepage.
*Below are some test users*
- **Email**: `user1@primetrade.com`
- **Password**: `User1`

- **Email**: `user2@primetrade.com`
- **Password**: `User2`

- **Email**: `user3@primetrade.com`
- **Password**: `User3`

- **Test User**: You can sign up a brand new user via `/user/register` or create your own test account.

### 3. API Documentation
- **URL**: `https://primetrade-backend-zm28.onrender.com/api-docs`
- Contains Swagger-generated documentation of all backend routes, schemas, and endpoints.

---

## 🛠️ Local Development

If you want to run this locally:

1. Clone the repository.
2. Open two terminal instances:
   - **Terminal 1**: `cd backend && npm install && npm run dev`
   - **Terminal 2**: `cd frontend && npm install && npm run dev`
3. Set your `/backend/.env` with `MONGO_URI` and `JWT_SECRET`.
4. Ensure your `/frontend/.env` points to `VITE_API_URL=http://localhost:5001`.
