import { useState } from 'react';
import CaseStudyCard from './CaseStudyCard';
import AirbnbLogoMorph from './AirbnbLogoMorph';
import GlassShader from './GlassShader';
import CaseStudyModal from './CaseStudyModal';
import { FaApple, FaAirbnb, FaWindows } from 'react-icons/fa';
import { SiFlipkart } from 'react-icons/si';
import './CaseStudies.css';

const caseStudiesData = [
    {
        id: 'apple',
        title: 'Apple Glass',
        subtitle: 'Immersive Refraction & Spatial Design',
        icon: FaApple,
        color: '#5227ff',
        background: 'Apple Vision Pro marks the beginning of spatial computing. This study explores the gap in design frameworks for 3D physical space.',
        problem: 'Current UI conventions are designed for 2D rectangles. On Apple Glass, there is no rectangle, leading to disorienting experiences.',
        solution: 'Depth-Based Content Hierarchy, Physically Accurate Refractive Materials, and Gaze-Mapped Interaction Zones.',
        impact: 'Reduced eye strain in spatial apps and established a reproducible spatial design system.',
        tech: ['Three.js', 'WebXR', 'GLSL Shaders', 'React 19'],
        detailed: {
            metrics: [
                { name: 'Eye Strain', value: 85, full: 100 },
                { name: 'Session Duration', value: 65, full: 100 },
                { name: 'Cognitive Load', value: 40, full: 100 }
            ],
            trends: [
                { name: 'W1', value: 20 },
                { name: 'W2', value: 45 },
                { name: 'W3', value: 70 },
                { name: 'W4', value: 95 }
            ]
        }
    },
    {
        id: 'airbnb',
        title: 'Airbnb Logo',
        subtitle: 'Geometric Evolution & Path Morphing',
        icon: FaAirbnb,
        color: '#ff385c',
        background: 'The Airbnb Bélo encodes four symbolic forms—person, location, heart, and A—within a single continuous SVG path.',
        problem: 'Brand storytelling relies on static assets, leaving the geometric intelligence of the mark invisible to the audience.',
        solution: 'Interactive Geometric Deconstruction, Live Path Morphing, and User-Controlled Scrub Interactions.',
        impact: 'Effective communication of design intent for onboarding and investor presentations.',
        tech: ['Anime.js', 'Framer Motion', 'SVG Path', 'React 19'],
        detailed: {
            metrics: [
                { name: 'Brand Recall', value: 92, full: 100 },
                { name: 'Education', value: 78, full: 100 },
                { name: 'Engagement', value: 88, full: 100 }
            ],
            trends: [
                { name: 'Jan', value: 300 },
                { name: 'Feb', value: 500 },
                { name: 'Mar', value: 450 },
                { name: 'Apr', value: 850 }
            ]
        }
    },
    {
        id: 'windows',
        title: 'Windows Design',
        subtitle: 'Glassmorphism & Material System',
        icon: FaWindows,
        color: '#0078d4',
        background: 'Windows 11 introduced Mica and Acrylic—material languages that respond to wallpaper and ambient lighting.',
        problem: 'Web-based "glassmorphism" often misses the adaptive, context-responsive behavior that makes Fluent Design work.',
        solution: 'Adaptive Mica Simulation, Perceptually Accurate Acrylic Layer, and Cursor-Tracked Reveal Highlights.',
        impact: 'Browser-accurate Fluent library providing a trustworthy reference for web developers.',
        tech: ['CSS Houdini', 'GSAP', 'Framer Motion', 'Figma Tokens'],
        detailed: {
            metrics: [
                { name: 'Accuracy', value: 95, full: 100 },
                { name: 'Performance', value: 90, full: 100 },
                { name: 'Adoption', value: 70, full: 100 }
            ],
            trends: [
                { name: 'Q1', value: 200 },
                { name: 'Q2', value: 400 },
                { name: 'Q3', value: 650 },
                { name: 'Q4', value: 900 }
            ]
        }
    },
    {
        id: 'flipkart',
        title: 'Flipkart AR',
        subtitle: 'E-commerce Spatial Interactions',
        icon: SiFlipkart,
        color: '#2874f0',
        background: 'Flipkart users in Tier 2/3 India often struggle with high return rates due to spatial misjudgments on entry-level devices.',
        problem: 'Existing AR solutions assume high-end hardware and fast internet, making them inaccessible to Flipkart’s median user.',
        solution: 'Draco-Compressed 3D Pipeline, Native AR Delivery via <model-viewer>, and Single-Tap Placement UX.',
        impact: 'Significant reduction in furniture return rates and increased purchase confidence at scale.',
        tech: ['React Native', 'model-viewer', 'WebXR', 'Draco'],
        detailed: {
            metrics: [
                { name: 'Return Rate', value: 22, full: 100 },
                { name: 'Load Time', value: 95, full: 100 },
                { name: 'Accessibility', value: 98, full: 100 }
            ],
            trends: [
                { name: 'Week 1', value: 1000 },
                { name: 'Week 2', value: 2500 },
                { name: 'Week 3', value: 5000 },
                { name: 'Week 4', value: 12000 }
            ]
        }
    }
];

const CaseStudies = ({ onViewDashboard }) => {
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (study) => {
        setSelectedStudy(study);
        setIsModalOpen(true);
    };

    const handleViewDashboard = () => {
        setIsModalOpen(false);
        onViewDashboard(selectedStudy);
    };

    return (
        <section className="case-studies" id="case-studies">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Case Studies</h2>
                    <p className="section-subtitle">Exploring the boundaries of digital interaction</p>
                </div>
                
                <div className="case-studies-grid">
                    {caseStudiesData.map((study) => (
                        <CaseStudyCard 
                            key={study.id}
                            {...study}
                            onClick={() => openModal(study)}
                        >
                            {study.id === 'airbnb' && <AirbnbLogoMorph />}
                            {study.id === 'apple' && <GlassShader />}
                        </CaseStudyCard>
                    ))}
                </div>
            </div>

            <CaseStudyModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                study={selectedStudy} 
                onViewDashboard={handleViewDashboard}
            />
        </section>
    );
};

export default CaseStudies;
