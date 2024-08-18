import React from "react";
import { Outlet } from "react-router-dom";
import Navbars from "./components/Navbars";

function App() {
  return (
    <>
      <Navbars />
      <Outlet />
    </>
  );
}

export default App;
