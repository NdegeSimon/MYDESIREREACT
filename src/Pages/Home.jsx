import Navbar from "../components/Navbar";
import Carousel from "../components/carousel";
import "../App.css";

function Home() {
  // You still define slides here
  const slides = [
    {
      img: "images/p2.jpg",
      heading: (
        <>
          <span className="text-primary">MY </span>
          <br />
          <span className="text-white">DESIRE</span>
          <br />
          <span className="text-white">SALON</span>
        </>
      ),
    },
    {
      img: "images/p3.jpg",
      heading: (
        <>
          <span className="text-primary">MY </span>
          <br />
          <span className="text-white">DESIRE</span>
          <br />
          <span className="text-white">SALON</span>
        </>
      ),
    },
  ];

  return (
    <div className="bg-secondary text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Pass slides into Carousel */}
      <Carousel slides={slides} interval={5000} />
    </div>
  );
}

export default Home;
