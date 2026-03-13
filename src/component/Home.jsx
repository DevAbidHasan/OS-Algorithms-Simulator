import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import Features from './Features';
import Community from './Community';
import CTA from './CTA';
import Stats from './Stats';
import Output from './Output';
import Algorithms from './Algorithms';
import Platform from './Platform';
import HowToUse from './HowToUse';
import FAQ from './FAQ';


const Home = () => {
    
    return (
       <div>
        <Hero></Hero>
        <Stats></Stats>
        <Platform></Platform>
        <Output></Output>
        <Algorithms></Algorithms>
        <HowToUse></HowToUse>
        <FAQ></FAQ>
       </div>
    );
};

export default Home;