import React from "react";
import GodAppBar from "../god/god-components/GodAppBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <GodAppBar />
      {children}
    </>
  );
};

export default Layout;
