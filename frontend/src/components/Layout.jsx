import React from 'react';
import Navigation from './Navbar';

const Layout = ({ children }) => {
  return (
    <div>
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

export default Layout;