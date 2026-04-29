import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PortalPage from './pages/PortalPage'
import RiderAppPage from './pages/RiderAppPage'
import RiderLoginPage from './pages/RiderLoginPage'
import RiderRegisterPage from './pages/RiderRegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/rider" element={<Navigate to="/rider/login" replace />} />
      <Route path="/rider/login" element={<RiderLoginPage />} />
      <Route path="/rider/register" element={<RiderRegisterPage />} />
      <Route path="/rider/app" element={<RiderAppPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
