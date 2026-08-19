import React, { useState, useEffect } from "react";
import {
  Search,
  Phone,
  Mail,
  BarChart,
  Network,
  Home,
  Info,
  Globe,
  Users,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Accessibility,
} from "lucide-react";

import { useNavigate } from "react-router";

import LogoJppKMK from "../logo kmk jpp.jpeg"; 

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const Navigation = useNavigate();

  // Placeholder images for the carousel to make it functional
  const carouselImages = [
    "https://lh3.googleusercontent.com/d/1COQMYUgHouYdk8EmcI4RGMnEahzd71DM", // Simulated campus/outdoor sign
    "https://lh3.googleusercontent.com/d/1COQMYUgHouYdk8EmcI4RGMnEahzd71DM", // University building
    "https://lh3.googleusercontent.com/d/1U3gHUUdKcm-wngszK2cuI-V0_dd5kILt", // Students
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1,
    );
  };

  // Auto-advance carousel (optional, but makes it feel more "fully functional")
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {}
      <header className="bg-white py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Title area */}
          <div className="flex items-center gap-4">
            <img src={LogoJppKMK} alt="Logo KMK" className="h-24 w-auto" />
          </div>

          {/* Right side interactions */}
          <div className="flex items-center gap-6">
            {/* Top small icons */}
            <div className="hidden lg:flex items-center gap-3 text-indigo-900">
              <button
                className="hover:text-blue-600 transition-colors"
                aria-label="Sitemap"
              >
                <Network size={18} />
              </button>
              <button
                className="hover:text-blue-600 transition-colors"
                aria-label="Phone"
              >
                <Phone size={18} />
              </button>
              <button
                className="hover:text-blue-600 transition-colors"
                aria-label="Mail"
              >
                <Mail size={18} />
              </button>
              <button
                className="hover:text-blue-600 transition-colors"
                aria-label="Statistics"
              >
                <BarChart size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
              <div className="flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-text">
                <Search size={18} className="absolute left-2" />
                <input
                  type="text"
                  placeholder="Carian"
                  className="pl-8 pr-4 py-1.5 w-32 md:w-48 bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-600 text-sm text-gray-700 transition-all focus:w-40 md:focus:w-56"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {}
      <nav className="bg-[#1f1d6b] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <ul className="flex items-center justify-center md:justify-center min-w-max">
            {/* Active Item */}
            <li className="relative group">
              <a
                href="#"
                className="flex items-center gap-2 px-6 py-4 text-orange-500 text-sm font-medium border-b-2 border-orange-500 hover:text-orange-400 transition-colors"
              >
                <Home size={16} />
                <span>Utama</span>
              </a>
            </li>

            {/* Other Items */}
            <li className="relative group">
              <a
                onClick={() => {
                  Navigation("/Cadangan");
                }}
                className="hover:cursor-pointer flex items-center gap-2 px-6 py-4 text-gray-200 text-sm font-medium hover:text-white transition-colors border-b-2 border-transparent hover:border-gray-400"
              >
                <Info size={16} />
                <span>Cadangan</span>
              </a>
            </li>

            <li className="relative group cursor-pointer">
              <div className="flex items-center gap-2 px-6 py-4 text-gray-200 text-sm font-medium hover:text-white transition-colors border-b-2 border-transparent hover:border-gray-400">
                <Globe size={16} />
                <span>Korporat</span>
                <ChevronDown size={14} className="ml-1 opacity-70" />
              </div>
            </li>

            <li className="relative group">
            
              <div
               onClick={() => {
                Navigation("/organisasi");
               }}
              className="flex items-center gap-2 px-6 py-4 text-gray-200 text-sm font-medium hover:text-white transition-colors border-b-2 border-transparent hover:border-gray-400">
                <Users size={16} />
                <span>Organisasi</span>
                <ChevronDown size={14} className="ml-1 opacity-70" />
              </div>
            </li>

            <li className="relative group">
              <a
                href="#"
                className="flex items-center gap-2 px-6 py-4 text-gray-200 text-sm font-medium hover:text-white transition-colors border-b-2 border-transparent hover:border-gray-400"
              >
                <LayoutGrid size={16} />
                <span>e-Aplikasi</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Carousel Section */}
        <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] rounded-xl overflow-hidden shadow-lg group">
          {/* Images */}
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Optional slight gradient overlay for better text readability if there was text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          ))}

          {/* Simulated content for the main slide based on screenshot */}
          {currentSlide === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* This mimics the 3D text in the image. Since it's baked into the photo in reality, 
                  this is just a fallback visual approximation if the image fails to load, 
                  but we rely mainly on the background image itself. */}
              {/* <h2 className="text-white text-7xl md:text-9xl font-black drop-shadow-2xl">I ❤️ KMK</h2> */}
            </div>
          )}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 text-white hover:bg-white/50 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={32} />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm
                  ${
                    index === currentSlide
                      ? "bg-white scale-125 border-2 border-white"
                      : "bg-transparent border-2 border-white/70 hover:bg-white/50"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-12">
          {/* Left Column: Video Card */}
          <div className="flex flex-col">
            <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md aspect-video">
              <img
                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1000&auto=format&fit=crop"
                alt="Corporate Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay styling to match screenshot */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 p-6 flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-gray-600">
                    <span className="text-white text-xs font-bold">KMK</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      VIDEO KORPORAT KOLEJ MATRIKULASI KEDAH
                    </h3>
                    <p className="text-gray-300 text-sm">KM KEDAH TV</p>
                  </div>
                </div>

                {/* Simulated Youtube branding or large text */}
                <div className="text-white">
                  <h4 className="text-4xl font-extrabold uppercase tracking-widest opacity-90">
                    Dewan
                  </h4>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle
                  size={64}
                  className="text-white/80 drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Top Management */}
          <div className="flex flex-col">
            <h2 className="text-[#1f1d6b] text-xl font-bold uppercase tracking-wide mb-6 border-b-2 border-gray-100 pb-2">
              Pengurusan Tertinggi
            </h2>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
              {/* Image side - simulating the decorative background shown in the screenshot */}
              <div
                className="w-2/5 md:w-1/3 relative bg-gray-50 flex items-end justify-center pt-6 px-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 C 20 0 50 0 100 100 Z' fill='%23f1f5f9'/%3E%3C/svg%3E")`,
                  backgroundSize: "cover",
                }}
              >
                {/* Decorative lines simulated via CSS */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, transparent 48%, #cbd5e1 49%, #cbd5e1 51%, transparent 52%)",
                    backgroundSize: "20px 20px",
                  }}
                ></div>

                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10 -mb-4 bg-gray-200">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                    alt="Pengarah"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Details side */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">
                  Pengarah
                </h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  Puan Zuriah binti Sulaiman,{" "}
                  <span className="text-xs text-gray-500 ml-1">A.M.P</span>
                </p>
                {/* Simulated contact info based on typical site structures */}
                <p className="text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">
                  Tel :{" "}
                  <span className="font-medium text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
                    04-9286100
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          className="bg-[#3b5998] hover:bg-[#2d4373] text-white p-3 rounded shadow-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b5998]"
          aria-label="Accessibility Options"
        >
          <Accessibility size={24} />
        </button>
      </div>
    </div>
  );
}
