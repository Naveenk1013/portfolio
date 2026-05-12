import './Skills.css';

import InfiniteMenu from '../InfiniteMenu/InfiniteMenu';

const items = [
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        link: 'https://react.dev/',
        title: 'React',
        description: 'Building interactive UIs'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        title: 'JavaScript',
        description: 'The language of the web'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        title: 'HTML5',
        description: 'Structural foundation'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
        link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
        title: 'CSS3',
        description: 'Styling and layout'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        link: 'https://nodejs.org/',
        title: 'Node.js',
        description: 'Server-side JavaScript'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        link: 'https://www.python.org/',
        title: 'Python',
        description: 'Versatile and powerful'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
        link: 'https://www.mongodb.com/',
        title: 'MongoDB',
        description: 'NoSQL Database'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        link: 'https://www.typescriptlang.org/',
        title: 'TypeScript',
        description: 'Typed JavaScript'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
        link: 'https://git-scm.com/',
        title: 'Git',
        description: 'Version Control'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
        link: 'https://www.figma.com/',
        title: 'Figma',
        description: 'Design Tool'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
        link: 'https://www.docker.com/',
        title: 'Docker',
        description: 'Containerization'
    },
    {
        image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
        link: 'https://code.visualstudio.com/',
        title: 'VS Code',
        description: 'Code Editor'
    }
];

const Skills = () => {
    return (
        <section className="skills" id="skills">
            <div className="skills-container">
                <div className="skills-header">
                    <h2 className="skills-title">Skills</h2>
                    <p className="skills-subtitle">Drag the icons to see more</p>
                </div>

                <div className="infinite-menu-container" style={{ height: '600px', position: 'relative', marginTop: '2rem' }}>
                    <InfiniteMenu items={items} />
                </div>
            </div>
        </section>
    );
};

export default Skills;
