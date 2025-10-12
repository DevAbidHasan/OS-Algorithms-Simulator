import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import Features from './Features';
import Community from './Community';
import CTA from './CTA';


const Home = () => {
    
    return (
       <div>
        <Hero></Hero>
        <Features></Features>
        <Community></Community>
        <CTA></CTA>
       </div>
    );
};

export default Home;