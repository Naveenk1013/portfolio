import TrueFocus from '../TrueFocus/TrueFocus';
import './About.css';

const About = () => {
    return (
        <section className="about" id="about">
            <div className="about-container">

                <div className="about-content">
                    <TrueFocus
                        sentence="ABOUT-ME"
                        manualMode={true}
                        blurAmount={2}
                        borderColor="#00f7ff"
                        glowColor="rgba(0, 247, 255, 0.4)"
                        animationDuration={0.3}
                        pauseBetweenAnimations={1}
                    />
                </div>

                <div className="about-content">
                    <TrueFocus
                        fontSize={10}
                        sentence="What are you trying to find here?  I'm just exploring fun stuff!! Nothing fancy, just a curious soul who loves to tinker with technology"
                        manualMode={true}
                        blurAmount={10}
                        borderColor="#00f7ff"
                        glowColor="rgba(0, 247, 255, 0.4)"
                        animationDuration={0.3}
                        pauseBetweenAnimations={1}

                    />
                </div>


            </div>
        </section>
    );
};

export default About;
