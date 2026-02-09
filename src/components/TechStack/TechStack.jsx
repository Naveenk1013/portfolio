import LogoLoop from '../LogoLoop/LogoLoop';
import {
    SiHtml5,
    SiCss3,
    SiJavascript,
    SiReact,
    SiNodedotjs,
    SiMongodb,
    SiGit,
    SiGithub,
    SiFigma,
    SiCanva,
    SiNpm,
    SiExpress,
    SiTailwindcss,
    SiBootstrap,
    SiPython,
    SiMysql,
    SiFirebase
} from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';
import { FaServer } from 'react-icons/fa';
import './TechStack.css';

// Combine all logos into a single array
const allLogos = [
    { node: <SiHtml5 />, title: "HTML5" },
    { node: <SiCss3 />, title: "CSS3" },
    { node: <SiJavascript />, title: "JavaScript" },
    { node: <SiReact />, title: "React" },
    { node: <SiTailwindcss />, title: "Tailwind CSS" },
    { node: <SiBootstrap />, title: "Bootstrap" },
    { node: <SiNodedotjs />, title: "Node.js" },
    { node: <SiExpress />, title: "Express.js" },
    { node: <SiMongodb />, title: "MongoDB" },
    { node: <SiMysql />, title: "MySQL" },
    { node: <FaServer />, title: "REST API" },
    { node: <SiPython />, title: "Python" },
    { node: <SiGit />, title: "Git" },
    { node: <SiGithub />, title: "GitHub" },
    { node: <VscCode />, title: "VS Code" },
    { node: <SiFigma />, title: "Figma" },
    { node: <SiCanva />, title: "Canva" },
    { node: <SiFirebase />, title: "Firebase" },
    { node: <SiNpm />, title: "NPM" },
];

const TechStack = () => {
    return (
        <section className="tech-stack">
            <div className="tech-stack-container">
                <div className="tech-stack-header">
                    <span className="tech-stack-label">Technologies I Work With</span>
                </div>

                <div className="tech-stack-loops">
                    <div className="tech-loop-row">
                        <LogoLoop
                            logos={allLogos}
                            speed={50}
                            direction="left"
                            logoHeight={45}
                            gap={60}
                            hoverSpeed={10}
                            scaleOnHover
                            fadeOut
                            fadeOutColor="#0a0a0f"
                            ariaLabel="Tech Stack"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechStack;
