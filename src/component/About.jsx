import React from 'react';
import { Link } from 'react-router';

const About = () => {
    return (
        <div>
            <h2>this is the demo about page</h2>
            <Link to="/">
                <button>Back to Home</button>
            </Link>
        </div>
    );
};

export default About;