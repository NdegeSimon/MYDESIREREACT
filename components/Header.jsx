import React from "react";
import { Link } from "react-router-dom"; // use if you’re using React Router
// import logo from "src/logo.png";

function Header() {
  return (
    <div className="fixed top-0 left-0 p-8 z-50 flex items-center justify-between w-full bg-transparent">
      {/* Logo */}
      <div>
        <Link to="/">
          <img
            src="/images/lg.png" // put lg.png in /public/images
            alt="My Desire Salon Logo"
            className="h-24 w-auto brightness-0 invert hover:scale-110 transition-transform cursor-pointer"
          />
        </Link>
      </div>

      {/* Buttons */}
      <div className="button-container flex gap-4">
        <Link to="/signup">
          <button
            className="btn bg-primary hover:bg-red-700 text-white px-6 py-3 text-base font-bold rounded-lg transition-all hover:scale-105"
            style={{ fontFamily: "'Backsteal', sans-serif" }}
          >
            SIGN UP
          </button>
        </Link>
        <Link to="/login">
          <button
            className="btn bg-primary hover:bg-red-700 text-white px-6 py-3 text-base font-bold rounded-lg transition-all hover:scale-105"
            style={{ fontFamily: "'Backsteal', sans-serif" }}
          >
            LOG IN
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Header;
