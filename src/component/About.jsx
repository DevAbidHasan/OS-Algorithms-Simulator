import React from 'react';
import TechStack from './TechStack';
import Mission from './Mission';
import Summary from './Summary';

const About = () => {
    return (
        <div>
            <Summary></Summary>
            <TechStack></TechStack>
            <Mission></Mission>
        </div>
    );
};

export default About;