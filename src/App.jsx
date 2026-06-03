import { useState } from 'react';
import DotGrid from './components/DotGrid/DotGrid';
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu';
import Hero from './components/Hero/Hero';
import TechStack from './components/TechStack/TechStack';
import About from './components/About/About';
import CaseStudies from './components/CaseStudies/CaseStudies';
import Experience from './components/Experience/Experience';
import Skills from './components/Skills/Skills';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import CaseStudyDashboard from './components/CaseStudies/CaseStudyDashboard';
import SplashCursor from './components/SplashCursor/SplashCursor';
import FidgetSettings from './components/SplashCursor/FidgetSettings';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';
import ScrollProgress from './components/ui/ScrollProgress';
import SectionReveal from './components/ui/SectionReveal';
import './App.css'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home section', link: '#home' },
  { label: 'About', ariaLabel: 'Learn about me', link: '#about' },
  { label: 'Case Studies', ariaLabel: 'View case studies', link: '#case-studies' },
  { label: 'Experience', ariaLabel: 'View experience', link: '#experience' },
  { label: 'Skills', ariaLabel: 'View skills', link: '#skills' },
  { label: 'Projects', ariaLabel: 'View projects', link: '#projects' },
  { label: 'Contact', ariaLabel: 'Get in touch', link: '#contact' }
];

const socialItems = [
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/naveen-kumar-8a40bb170/' },
  { label: 'GitHub', link: 'https://github.com/Naveenk1013' },
  { label: 'Instagram', link: 'https://instagram.com/naveen.k_r' }
];

function App() {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [fidgetSettings, setFidgetSettings] = useState({
    multiTouch: true,
    pressure: true,
    gyro: false
  });

  const handleViewDashboard = (study) => {
    setSelectedStudy(study);
    setShowDashboard(true);
  };

  const handleSettingChange = (key, value) => {
    setFidgetSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleZenMode = () => {
    setIsZenMode(prev => !prev);
  };

  return (
    <>
      {/* Persist SplashCursor globally to prevent WebGL context loss on re-mounts */}
      <SplashCursor settings={fidgetSettings} />
      
      <FidgetSettings 
        settings={fidgetSettings} 
        onSettingChange={handleSettingChange}
        isZenMode={isZenMode}
        onToggleZen={toggleZenMode}
      />

      {isZenMode ? (
        <div style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden', position: 'relative', zIndex: 40 }}>
          <button 
            onClick={toggleZenMode}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1001,
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              color: 'white',
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ← Exit Canvas
          </button>
        </div>
      ) : (
        <SmoothScroll>
          <div className="app">
            <ScrollProgress />
            
            {/* Fixed Background - DotGrid handles its own positioning */}
            <DotGrid
              dotSize={5}
              gap={15}
              baseColor="#271e37"
              activeColor="#5227ff"
              proximity={120}
              shockRadius={250}
              shockStrength={5}
              resistance={750}
              returnDuration={2.5}
            />

            {/* Staggered Menu */}
            <StaggeredMenu
              position="right"
              items={menuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor="#fff"
              openMenuButtonColor="#fff"
              changeMenuColorOnOpen={true}
              colors={['#B19EEF', '#5227FF']}
              accentColor="#00f7ff"
              isFixed={true}
            />

            {/* Main Content */}
            <main className="main-content">
              <SectionReveal>
                <Hero />
              </SectionReveal>
              
              <SectionReveal delay={0.2}>
                <TechStack />
              </SectionReveal>
              
              <SectionReveal>
                <About />
              </SectionReveal>
              
              <SectionReveal>
                <CaseStudies onViewDashboard={handleViewDashboard} />
              </SectionReveal>
              
              <SectionReveal>
                <Experience />
              </SectionReveal>
              
              <SectionReveal>
                <Skills />
              </SectionReveal>
              
              <SectionReveal>
                <Projects />
              </SectionReveal>
              
              <SectionReveal>
                <Contact />
              </SectionReveal>
            </main>
          </div>
        </SmoothScroll>
      )}

      {showDashboard && (
        <CaseStudyDashboard 
          study={selectedStudy} 
          onClose={() => setShowDashboard(false)} 
        />
      )}
    </>
  )
}

export default App;


