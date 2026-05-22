import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ProjectsGallery from './pages/ProjectsGallery/ProjectsGallery.jsx'
import AnimeWorld from './pages/AnimeWorld/AnimeWorld.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/projects" element={<ProjectsGallery />} />
        <Route path="/anime" element={<AnimeWorld />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
