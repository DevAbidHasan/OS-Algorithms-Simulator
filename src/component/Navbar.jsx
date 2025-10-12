import React from "react";
import Banner from "./Banner";
import { Link } from "react-router";
import Menu from "./Menu";
import Hero from "./Hero";

const Navbar = () => {
  return (
    <div>
      <Banner></Banner>
        <Menu></Menu>
        
    </div>
  );
};

export default Navbar;
