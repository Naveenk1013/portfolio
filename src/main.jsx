import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ProjectsSkeleton from './components/Skeletons/ProjectsSkeleton'
import AnimeWorldWrapper from './pages/AnimeWorld/AnimeWorldWrapper'

const ProjectsGallery = lazy(() => import('./pages/ProjectsGallery/ProjectsGallery.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/projects" element={
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsGallery />
          </Suspense>
        } />
        <Route path="/anime" element={<AnimeWorldWrapper />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
