import './Projects.css';
import FlowingMenu from '../FlowingMenu/FlowingMenu';

const projects = [
    {
        text: 'Hotel PMS System',
        link: 'https://hotelshardapalacepms.netlify.app',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop'
    },
    {
        text: 'Lancealot Freelancing',
        link: 'https://lancealot.in',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    },
    {
        text: 'AI Resume Creator',
        link: 'https://airesume-teal.vercel.app',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop'
    },
    {
        text: 'Cocktail Finder',
        link: 'https://cocktailfinderforbar.netlify.app',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop'
    },
    {
        text: 'Prince Startup QSR',
        link: 'https://princestartup.netlify.app',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop'
    },
    {
        text: 'Quality Inn Ayodhya',
        link: 'https://qualityinnayodhya.netlify.app',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'
    },
    {
        text: 'Financial Advisor Portfolio',
        link: 'https://navneetkr.netlify.app',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    },
    {
        text: 'Gyani AI Research',
        link: 'https://gyani-ai.netlify.app',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop'
    },
    {
        text: 'Drips & Cream Bakery',
        link: 'https://dripsandcream.netlify.app',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop'
    },
    {
        text: 'Aurumm Living PG',
        link: 'https://aurummliving.netlify.app',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    },
    {
        text: 'Harmony Hostel',
        link: 'https://harmonyhostel.netlify.app',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop'
    },
    {
        text: 'Cake-A-Way',
        link: 'https://cakeaway.netlify.app',
        image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop'
    },
    {
        text: 'Hospitality Stuff',
        link: 'https://hospitalitystuff.netlify.app',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop'
    },
    {
        text: 'Narayan Hardware',
        link: 'https://narayanhardware.netlify.app',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop'
    },
    {
        text: 'World of Wines',
        link: 'https://wofw.netlify.app',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop'
    },
    {
        text: 'Sharda Palace Hotel',
        link: 'https://hotelshardapalace.netlify.app',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop'
    },
    {
        text: 'Style by Rishh',
        link: 'https://stylebyrishh.netlify.app',
        image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=400&fit=crop'
    }
];

const Projects = () => {
    return (
        <section className="projects" id="projects">
            <div className="projects-container">
                <div className="projects-header">
                    <h2 className="projects-title">Projects</h2>
                    <p className="projects-subtitle">Some things I've built</p>
                </div>

                <div className="projects-menu-wrapper">
                    <FlowingMenu items={projects} />
                </div>
            </div>
        </section>
    );
};

export default Projects;

