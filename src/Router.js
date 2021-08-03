import React from "react";
import { BrowserRouter } from "react-router-dom";
import Home from "./Component/home/Home";

const Router = () => {
  return (
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

export default Router;
