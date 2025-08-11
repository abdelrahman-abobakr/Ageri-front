# Ageri Research Platform - Frontend

A modern React frontend for the Ageri Research Platform, a comprehensive research management system for governmental agencies.

## 🚀 Features

- **Modern React 18** with JSX (no TypeScript)
- **Ant Design** for professional UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **JWT Authentication** with automatic token refresh
- **Role-based Access Control** (Admin, Moderator, Researcher)
- **Responsive Design** with mobile-first approach
- **Governmental Styling** with professional appearance

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 + Vite
- **UI Library**: Ant Design 5.x
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Icons**: Ant Design Icons
- **Date Handling**: Day.js

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_NAME=Ageri Research Platform
   VITE_APP_VERSION=1.0.0
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── profile/         # Profile pages
│   └── ...              # Other feature pages
├── services/            # API service functions
├── store/               # Redux store configuration
│   └── slices/          # Redux slices
├── constants/           # App constants
└── App.jsx              # Main App component
```

## 🔐 Authentication

The application uses JWT-based authentication with:

- **Login/Register**: User authentication with form validation
- **Token Management**: Automatic token refresh on expiration
- **Protected Routes**: Route guards based on authentication status
- **Role-based Access**: Different UI based on user roles
- **Pending Approval**: Support for admin approval workflow

## 👥 User Roles

1. **Admin**: Full system access, user management, system settings
2. **Moderator**: Content management, publication review, service requests
3. **Researcher**: Publication submission, course enrollment, profile management

## 🎨 UI/UX Features

- **Professional Design**: Clean, governmental-style interface
- **Responsive Layout**: Mobile-first responsive design
- **Loading States**: Proper loading indicators and error handling
- **Notifications**: Toast notifications for user feedback

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚧 Development Status

### ✅ Completed Features
- Project setup and configuration
- Authentication system (login, register, JWT)
- Protected routes and role-based access
- Main layout with responsive sidebar
- Dashboard with role-specific content
- Profile management
- Basic navigation and breadcrumbs

### 🔄 Next Steps
- Research management module
- Organization management
- Training system
- Services management
- Content management

## 🤝 Backend Integration

This frontend is designed to work with the Django REST Framework backend. Make sure the backend is running on `http://localhost:8000` for full functionality.
