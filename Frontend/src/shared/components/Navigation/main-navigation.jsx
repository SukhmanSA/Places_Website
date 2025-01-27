import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import MainHeader from './main-header';
import NavLinks from './nav-links';
import './main-navigation.css';
import SideDrawer from './side-drawer';
import Backdrop from './backdrop'; 

const MainNavigation = props => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  return (
    <>
      {drawerIsOpen && <Backdrop onClick={() => setDrawerIsOpen(false)} />}
      {drawerIsOpen && (
        <SideDrawer>
          <nav className="main-navigation__drawer-nav">
            <NavLinks />
          </nav>
        </SideDrawer>
      )}
      <MainHeader>
        <button
          onClick={() => setDrawerIsOpen(prevState => !prevState)}
          className="main-navigation__menu-btn"
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="main-navigation__title">
          <Link to="/">YourPlaces</Link>
        </h1>
        <nav className="main-navigation__header-nav">
          <NavLinks />
        </nav>
      </MainHeader>
    </>
  );
};

export default MainNavigation;
