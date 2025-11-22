import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import HospitalList from './pages/HospitalList'
import DonorList from './pages/DonorList'
import AmbulanceList from './pages/AmbulanceList'
import DonorRegister from './pages/DonorRegister'
import HospitalRegister from './pages/HospitalRegister'
import AmbulanceRegister from './pages/AmbulanceRegister'
import HospitalProfile from './pages/HospitalProfile'
import DonorProfile from './pages/DonorProfile'
import AmbulanceProfile from './pages/AmbulanceProfile'
import Profile from './pages/Profile'
import ManageCollection from './pages/ManageCollection'
import ManageHospitalServices from './pages/ManageHospitalServices'
import HospitalServicesDetail from './pages/HospitalServicesDetail'
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
        <Route path="/register/hospital" element={<HospitalRegister />} />
        <Route path="/register/ambulance" element={<AmbulanceRegister />} />
        <Route path="/hospital-profile" element={<HospitalProfile />} />
        <Route path="/donor-profile" element={<DonorProfile />} />
        <Route path="/ambulance-profile" element={<AmbulanceProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/manage-collection" element={<ManageCollection />} />
        <Route path="/manage-hospital-services" element={<ManageHospitalServices />} />
        <Route path="/hospital/:hospitalId/services" element={<HospitalServicesDetail />} />
      </Routes>
    </Router>
  )
}

export default App
