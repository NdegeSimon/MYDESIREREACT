import React from "react";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import routes from "./routes/routes"; // not being used yet

function App() {
  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}

export default App;
