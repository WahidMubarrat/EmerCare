import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HospitalList from './pages/HospitalList'
import DonorList from './pages/DonorList'
import AmbulanceList from './pages/AmbulanceList'
import DonorRegister from './pages/DonorRegister'
import DonorProfile from './pages/DonorProfile'
import HospitalServicesDetail from './pages/HospitalServicesDetail'
import ChatBot from './components/ChatBot'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/hospitals" element={<HospitalList />} />
        <Route path="/donors" element={<DonorList />} />
        <Route path="/ambulances" element={<AmbulanceList />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/donor-profile" element={<DonorProfile />} />
        <Route path="/hospital/:hospitalId/services" element={<HospitalServicesDetail />} />
      </Routes>
      <ChatBot />
    </Router>
  )
}

export default App
