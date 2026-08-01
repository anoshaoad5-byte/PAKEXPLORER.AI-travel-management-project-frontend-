import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Destinations from './pages/Destinations'
import './index.css'
import Packages from './pages/Packages'
import Trips from './pages/Trips'
import Hotels from './pages/Hotels'
import Transportation from './pages/Transportation'
import BudgetCalculator from './pages/BudgetCalculator'
import Booking from './pages/Booking'
import LocationTracker from './pages/LocationTracker'
import Translator from './pages/Translator'
import Reviews from './pages/Reviews'
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PackagePlanner from './pages/PackagePlanner'
import DestinationPlan from './pages/DestinationPlan'
import ItineraryGenerator from './pages/ItineraryGenerator'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import OurLocation from './pages/OurLocation'
import VedhiWidget from './components/VedhiWidget'
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}
function AdminRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!user?.is_admin) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/destinations" element={
        <ProtectedRoute>
          <Destinations />
        </ProtectedRoute>
      } />
      <Route path="/packages" element={
        <ProtectedRoute>
          <Packages />
        </ProtectedRoute>
      } />
      <Route path="/trips" element={<Trips />} />
      <Route path="/hotels" element={
        <ProtectedRoute>
          <Hotels />
        </ProtectedRoute>
      } />
      <Route path="/transportation" element={
        <ProtectedRoute>
          <Transportation />
        </ProtectedRoute>
      } />
      <Route path="/booking" element={<Booking />} />
      <Route path="/translator" element={<Translator />} />
      <Route path="/location" element={<LocationTracker />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/about" element={<About />} />
      <Route path="/budget-calculator" element={<BudgetCalculator />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/packages/:packageId/plan" element={<PackagePlanner />} />
      <Route path="/itinerary/:destinationId" element={<ItineraryGenerator />} />
      <Route path="/admin" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
      <Route path="/our-location" element={<OurLocation />} />
      <Route path="/dashboard" element={
  <ProtectedRoute>
    <UserDashboard />
  </ProtectedRoute>
} />
      
      <Route path="/destinations/:id/plan" element={
        <ProtectedRoute>
          <DestinationPlan />
        </ProtectedRoute>
      } />
    </Routes>
    
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <VedhiWidget />
      </AuthProvider>
    </BrowserRouter>
  )
}
 

export default App