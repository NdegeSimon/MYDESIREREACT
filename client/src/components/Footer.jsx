import React from "react"; // Fixed: lowercase "react"

function Footer() {
  return (
    <footer className="footer"> {/* Added semantic HTML and className */}
      <p>© 2025 PETLEYINC. All rights reserved</p> {/* Changed h1 to p for better semantics */}
    </footer>
  );
}

export default Footer;