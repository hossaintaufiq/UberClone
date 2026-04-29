import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PortalPage from './pages/PortalPage'
import RiderAppPage from './pages/RiderAppPage'
import RiderLoginPage from './pages/RiderLoginPage'
import RiderRegisterPage from './pages/RiderRegisterPage'
import AdminLoginPage from './pages/AdminLoginPage'
import DriverLoginPage from './pages/DriverLoginPage'
import DriverRegisterPage from './pages/DriverRegisterPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import DriverDashboardPage from './pages/DriverDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/driver/login" element={<DriverLoginPage />} />
      <Route path="/driver/register" element={<DriverRegisterPage />} />
      <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
      <Route path="/user" element={<Navigate to="/user/login" replace />} />
      <Route path="/user/login" element={<RiderLoginPage />} />
      <Route path="/user/register" element={<RiderRegisterPage />} />
      <Route path="/user/app" element={<RiderAppPage />} />
      <Route path="/rider" element={<Navigate to="/user/login" replace />} />
      <Route path="/rider/login" element={<Navigate to="/user/login" replace />} />
      <Route path="/rider/register" element={<Navigate to="/user/register" replace />} />
      <Route path="/rider/app" element={<Navigate to="/user/app" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
