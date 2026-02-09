import DotGrid from './components/DotGrid/DotGrid';
import StaggeredMenu from './components/StaggeredMenu/StaggeredMenu';
import Hero from './components/Hero/Hero';
import TechStack from './components/TechStack/TechStack';
import About from './components/About/About';
import Experience from './components/Experience/Experience';
import Skills from './components/Skills/Skills';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import SplashCursor from './components/SplashCursor/SplashCursor';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';
import ScrollProgress from './components/ui/ScrollProgress';
import SectionReveal from './components/ui/SectionReveal';
import './App.css'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home section', link: '#home' },
  { label: 'About', ariaLabel: 'Learn about me', link: '#about' },
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
  return (
    <SmoothScroll>
      <div className="app">
        <ScrollProgress />
        
        {/* Splash Cursor Effect */}
        <SplashCursor />

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
  )
}

export default App


