import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ServiceLanding from './pages/ServiceLanding'
import HospitalRegister from './pages/HospitalRegister'
import AmbulanceRegister from './pages/AmbulanceRegister'
import HospitalProfile from './pages/HospitalProfile'
import AmbulanceProfile from './pages/AmbulanceProfile'
import ManageHospitalServices from './pages/ManageHospitalServices'
import ManageCollection from './pages/ManageCollection'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ServiceLanding />} />
        <Route path="/register/hospital" element={<HospitalRegister />} />
        <Route path="/register/ambulance" element={<AmbulanceRegister />} />
        <Route path="/hospital-profile" element={<HospitalProfile />} />
        <Route path="/ambulance-profile" element={<AmbulanceProfile />} />
        <Route path="/manage-hospital-services" element={<ManageHospitalServices />} />
        <Route path="/manage-collection" element={<ManageCollection />} />
      </Routes>
    </Router>
  )
}

export default App

