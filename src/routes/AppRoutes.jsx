import { Navigate, Route, Routes } from 'react-router-dom'
import AdminNavbar from '../components/AdminNavbar'
import Navbar from '../components/Navbar'
import ProtectedRoute, { AdminRoute, PublicOnly } from '../components/ProtectedRoute'
import AttendanceHistory from '../pages/AttendanceHistory'
import Dashboard from '../pages/Dashboard'
import LeaveRequest from '../pages/LeaveRequest'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import WeeklySummary from '../pages/WeeklySummary'
import AdminAttendance from '../pages/admin/AdminAttendance'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminLeaves from '../pages/admin/AdminLeaves'
import AdminUsers from '../pages/admin/AdminUsers'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />

      {/* User routes */}
      <Route
        element={
          <ProtectedRoute>
            <Navbar />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<AttendanceHistory />} />
        <Route path="/leave" element={<LeaveRequest />} />
        <Route path="/weekly" element={<WeeklySummary />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <AdminRoute>
            <AdminNavbar />
          </AdminRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/leaves" element={<AdminLeaves />} />
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
