import { Navigate, Route, Routes } from 'react-router-dom'

// Public
import HomePage from './pages/HomePage'

// Rider
import RiderLoginPage from './pages/RiderLoginPage'
import RiderRegisterPage from './pages/RiderRegisterPage'
import RiderAppPage from './pages/RiderAppPage'
import RiderChatPage from './pages/rider/RiderChatPage'
import RiderChatbotPage from './pages/rider/RiderChatbotPage'

// Driver
import DriverLoginPage from './pages/driver/DriverLoginPage'
import DriverRegisterPage from './pages/driver/DriverRegisterPage'
import DriverDashboardPage from './pages/driver/DriverDashboardPage'
import DriverIncomingRequestPage from './pages/driver/DriverIncomingRequestPage'
import DriverCurrentTripPage from './pages/driver/DriverCurrentTripPage'
import DriverPaymentOverviewPage from './pages/driver/DriverPaymentOverviewPage'
import DriverRideHistoryPage from './pages/driver/DriverRideHistoryPage'
import DriverProfilePage from './pages/driver/DriverProfilePage'

// Admin
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminManageRiderPage from './pages/admin/AdminManageRiderPage'
import AdminManageDriverPage from './pages/admin/AdminManageDriverPage'
import AdminRideMonitorPage from './pages/admin/AdminRideMonitorPage'
import AdminPaymentPage from './pages/admin/AdminPaymentPage'
import AdminPromocodePage from './pages/admin/AdminPromocodePage'
import AdminReportAnalyticsPage from './pages/admin/AdminReportAnalyticsPage'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />

      {/* Rider Portal */}
      <Route path="/rider" element={<Navigate to="/rider/login" replace />} />
      <Route path="/rider/login" element={<RiderLoginPage />} />
      <Route path="/rider/register" element={<RiderRegisterPage />} />
      <Route path="/rider/app" element={<RiderAppPage />} />
      <Route path="/rider/chat/:rideId" element={<RiderChatPage />} />
      <Route path="/rider/chatbot" element={<RiderChatbotPage />} />

      {/* Driver Portal */}
      <Route path="/driver" element={<Navigate to="/driver/login" replace />} />
      <Route path="/driver/login" element={<DriverLoginPage />} />
      <Route path="/driver/register" element={<DriverRegisterPage />} />
      <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
      <Route path="/driver/incoming" element={<DriverIncomingRequestPage />} />
      <Route path="/driver/trip" element={<DriverCurrentTripPage />} />
      <Route path="/driver/payments" element={<DriverPaymentOverviewPage />} />
      <Route path="/driver/history" element={<DriverRideHistoryPage />} />
      <Route path="/driver/profile" element={<DriverProfilePage />} />

      {/* Admin Portal */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/riders" element={<AdminManageRiderPage />} />
      <Route path="/admin/drivers" element={<AdminManageDriverPage />} />
      <Route path="/admin/rides" element={<AdminRideMonitorPage />} />
      <Route path="/admin/payments" element={<AdminPaymentPage />} />
      <Route path="/admin/promocodes" element={<AdminPromocodePage />} />
      <Route path="/admin/analytics" element={<AdminReportAnalyticsPage />} />

      {/* Legacy redirect */}
      <Route path="/portal" element={<Navigate to="/admin/login" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
