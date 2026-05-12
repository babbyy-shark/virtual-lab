import { Routes, Route } from 'react-router-dom'
import LabPage       from './pages/LabPage.jsx'
import LibraryPage   from './pages/LibraryPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<LabPage />} />
      <Route path="/room/:roomId" element={<LabPage />} />
      <Route path="/library"    element={<LibraryPage />} />
      <Route path="/dashboard"  element={<DashboardPage />} />
    </Routes>
  )
}
