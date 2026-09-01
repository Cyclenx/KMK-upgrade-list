import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Phone,
  Home,
  Info,
  Globe,
  Users,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Share2,
  Volume2,
  PlayCircle,
  Accessibility,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";

import LogoJppKMK from "../logo kmk jpp.jpeg";

// Komponen Pembungkus Animasi Skrol Masuk (Intersection Observer)
function RevealOnScroll({
  children,
  direction = "bottom",
  delay = 0,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    const currentElem = domRef.current;
    if (currentElem) observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  const getDirectionClasses = () => {
    switch (direction) {
      case "left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-16 sm:-translate-x-24";
      case "right":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-16 sm:translate-x-24";
      case "top":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-16 sm:-translate-y-20";
      case "bottom":
      default:
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-16 sm:translate-y-20";
    }
  };

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-1000 ease-out will-change-transform ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMgmtSlide, setCurrentMgmtSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logo1_KPM =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/200px-Coat_of_arms_of_Malaysia.svg.png";
  const logo2_KMK = LogoJppKMK;
  const logo3_Tambahan =
    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=60";

  const slides = [
    {
      id: 0,
      tabTitle: "Solusi Pendidikan",
      headline: "Terus Memacu Kecemerlangan",
      description:
        "Semangat kami terhadap pendidikan berkualiti mendorong kami untuk mencipta ekosistem pembelajaran dinamik demi masa depan anak bangsa.",
      link: "/organisasi",
      linkText: "Ketahui lagi",
      image:
        "https://lh3.googleusercontent.com/d/1COQMYUgHouYdk8EmcI4RGMnEahzd71DM",
    },
    {
      id: 1,
      tabTitle: "Pembangunan Modal Insan",
      headline: "Sustainable Value Creation",
      description:
        "Sebagai institusi pra-universiti premier, kami membina sahsiah holistik dan pencapaian akademik berimpak tinggi merentasi sempadan.",
      link: "/Cadangan",
      linkText: "Ketahui lagi",
      image:
        "https://lh3.googleusercontent.com/d/1U3gHUUdKcm-wngszK2cuI-V0_dd5kILt",
    },
    {
      id: 2,
      tabTitle: "Inovasi & Teknologi",
      headline: "Memacu Digitalisasi Kampus",
      description:
        "Mengintegrasikan pembelajaran pintar dan aplikasi digital interaktif bagi memperkasa daya saing warga kolej ke peringkat global.",
      link: "/aplikasi",
      linkText: "Terokai portal",
      image:
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  const managementList = [
    {
      id: 0,
      jawatan: "Pengarah",
      nama: "Puan Zuriah binti Sulaiman",
      gelaran: "A.M.P",
      penerangan:
        "Memimpin kecemerlangan akademik, kepimpinan pelajar, dan pengurusan strategik Kolej Matrikulasi Kedah.",
      tel: "04-928 6100",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 1,
      jawatan: "PPHEP 1",
      subJawatan: "Pegawai Pengurusan Hal Ehwal Pelajar 1",
      nama: "Encik Ahmad bin Hassan",
      gelaran: "M.Ed",
      penerangan:
        "Menguruskan hal ehwal pembangunan sahsiah, disiplin, kepimpinan pelajar, serta aktiviti persatuan kolej.",
      tel: "04-928 6102",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop",
    },
    {
      id: 2,
      jawatan: "PPHEP 2",
      subJawatan: "Pegawai Pengurusan Hal Ehwal Pelajar 2",
      nama: "Puan Noraini binti Mohamed",
      gelaran: "K.M.N",
      penerangan:
        "Memantau kebajikan pelajar, pengurusan kediaman/kolej kediaman, kaunseling dan sukan pelajar.",
      tel: "04-928 6103",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const nextMgmtSlide = useCallback(() => {
    setCurrentMgmtSlide((prev) =>
      prev === managementList.length - 1 ? 0 : prev + 1
    );
  }, [managementList.length]);

  const prevMgmtSlide = () => {
    setCurrentMgmtSlide((prev) =>
      prev === 0 ? managementList.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    const mgmtTimer = setInterval(() => {
      nextMgmtSlide();
    }, 7000);
    return () => clearInterval(mgmtTimer);
  }, [nextMgmtSlide]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 relative overflow-x-hidden">
      {/* Floating Action Bar */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col bg-[#7b3f94] text-white rounded-l-2xl shadow-2xl overflow-hidden divide-y divide-purple-400/30">
        <button
          aria-label="Pengumuman"
          className="p-3.5 hover:bg-[#68327d] transition-colors flex items-center justify-center"
        >
          <Volume2 size={20} />
        </button>
        <button
          aria-label="Carian Pantas"
          className="p-3.5 hover:bg-[#68327d] transition-colors flex items-center justify-center"
        >
          <Search size={20} />
        </button>
        <button
          aria-label="Kongsi"
          className="p-3.5 hover:bg-[#68327d] transition-colors flex items-center justify-center"
        >
          <Share2 size={20} />
        </button>
      </aside>

      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] min-h-[600px] max-h-[900px] overflow-hidden bg-gray-950">
        {/* Header & Navigation */}
        <header className="absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          {/* Bar Atas Ringkas */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 hidden md:flex justify-end items-center gap-6 text-xs text-gray-200 border-b border-white/10">
            <div className="flex items-center gap-6">
              <a href="#about" className="hover:text-cyan-400 transition-colors">
                Perihal Kami
              </a>
              <a href="#news" className="hover:text-cyan-400 transition-colors">
                Berita & Media
              </a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">
                Hubungi Kami
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cyan-400">BM</span>
              <span className="text-gray-500">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">
                EN
              </span>
              <Globe size={14} className="ml-1 opacity-80" />
            </div>
          </div>

          {/* Bar Navigasi Utama */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            {/* Bekas 3 Logo */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/40 shrink-0">
              <img
                src={logo1_KPM}
                alt="Logo 1"
                className="h-6 sm:h-8 md:h-10 w-auto max-w-[36px] sm:max-w-[48px] object-contain shrink-0"
              />
              <div className="h-5 sm:h-6 w-[1px] bg-slate-300 shrink-0" />
              <img
                src={logo2_KMK}
                alt="Logo 2"
                className="h-6 sm:h-8 md:h-10 w-auto max-w-[36px] sm:max-w-[48px] object-contain shrink-0"
              />
              <div className="h-5 sm:h-6 w-[1px] bg-slate-300 shrink-0" />
              <img
                src={logo3_Tambahan}
                alt="Logo 3"
                className="h-6 sm:h-8 md:h-10 w-auto max-w-[36px] sm:max-w-[48px] object-contain shrink-0"
              />
            </div>

            {/* Menu Navigasi Desktop */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-white">
              <button
                onClick={() => navigate("/")}
                className="px-3 py-2 text-cyan-400 border-b-2 border-cyan-400 flex items-center gap-1.5"
              >
                <Home size={16} />
                <span>Utama</span>
              </button>

              <button
                onClick={() => navigate("/Cadangan")}
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-all flex items-center gap-1.5 text-gray-200"
              >
                <Info size={16} />
                <span>Cadangan</span>
              </button>

              <button
                onClick={() => navigate("/organisasi")}
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-all flex items-center gap-1.5 text-gray-200"
              >
                <Users size={16} />
                <span>Organisasi</span>
              </button>
            </nav>

            {/* Butang Hamburger Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Laci Menu Mobile dengan Animasi Slide & Fade */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out bg-indigo-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl ${
              mobileMenuOpen
                ? "max-h-80 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="px-6 py-5 text-white space-y-3">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-cyan-400 bg-white/5 font-semibold text-sm transition-transform active:scale-98"
              >
                <Home size={18} />
                <span>Utama</span>
              </button>

              <button
                onClick={() => {
                  navigate("/Cadangan");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-transform active:scale-98"
              >
                <Info size={18} />
                <span>Cadangan Penambahbaikan</span>
              </button>

              <button
                onClick={() => {
                  navigate("/organisasi");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-transform active:scale-98"
              >
                <Users size={18} />
                <span>Organisasi Kolej</span>
              </button>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Bahasa: <strong className="text-cyan-400">BM</strong> | EN
                </span>
                <span>KMK Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Gambar Hero Slider */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className={`w-full h-full object-cover transform transition-transform duration-[7000ms] ease-out ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/55 to-black/30 md:to-transparent" />
          </div>
        ))}

        {/* Teks Kandungan Hero */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-5 sm:px-6 lg:px-8 flex flex-col justify-center pt-16 pb-28 md:pb-24">
          <div className="max-w-xl text-white">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${
                  index === currentSlide
                    ? "block animate-[fadeIn_0.6s_ease-in-out]"
                    : "hidden"
                }`}
              >
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-tight drop-shadow-md">
                  {slide.headline}
                </h1>
                <p className="text-xs sm:text-base text-gray-200 mb-6 line-clamp-3 leading-relaxed font-normal drop-shadow">
                  {slide.description}
                </p>
                <button
                  onClick={() => navigate(slide.link)}
                  className="group inline-flex items-center gap-2.5 text-white text-sm sm:text-base font-semibold hover:text-cyan-400 transition-colors"
                >
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white group-hover:border-cyan-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                  </span>
                  <span>{slide.linkText}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigasi Bawah Slider */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-4 pb-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start gap-4 overflow-x-auto no-scrollbar border-b border-white/20 pb-2">
              {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`whitespace-nowrap pb-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 relative text-left shrink-0 ${
                      isActive
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span>{slide.tabTitle}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-cyan-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Kandungan Bahagian Bawah (Animasi Skrol Masuk) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 md:space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch overflow-hidden">
          {/* Video Korporat (Meluncur masuk dari Kiri) */}
          <RevealOnScroll direction="left" delay={150}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 border-cyan-500 inline-block">
                  Video Korporat
                </h2>
              </div>
              <div className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg aspect-video bg-gray-900 border border-gray-100 flex-1">
                <img
                  src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1000&auto=format&fit=crop"
                  alt="Corporate Video Thumbnail"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 p-4 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                      KMK
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xs sm:text-base leading-tight">
                        VIDEO KORPORAT KOLEJ MATRIKULASI KEDAH
                      </h3>
                      <p className="text-cyan-300 text-[10px] sm:text-xs">
                        KM KEDAH TV OFFICIAL
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-4xl font-black text-white/20 uppercase tracking-widest">
                      DEWAN KMK
                    </h4>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 transition-all duration-300 shadow-2xl">
                    <PlayCircle size={32} className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Slider Pengurusan Tertinggi (Meluncur masuk dari Kanan) */}
          <RevealOnScroll direction="right" delay={300}>
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-cyan-500">
                <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider inline-block">
                  Pengurusan Tertinggi
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevMgmtSlide}
                    aria-label="Profil Sebelumnya"
                    className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white text-gray-700 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1 px-1">
                    {managementList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentMgmtSlide(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentMgmtSlide
                            ? "w-5 bg-cyan-600"
                            : "w-2 bg-gray-300"
                        }`}
                        aria-label={`Ke profil ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={nextMgmtSlide}
                    aria-label="Profil Seterusnya"
                    className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white text-gray-700 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden min-h-[260px] sm:min-h-[280px] flex-1">
                {managementList.map((person, idx) => {
                  const isSelected = idx === currentMgmtSlide;
                  return (
                    <div
                      key={person.id}
                      className={`absolute inset-0 flex flex-col sm:flex-row transition-all duration-700 ease-in-out ${
                        isSelected
                          ? "opacity-100 z-10 translate-x-0"
                          : "opacity-0 z-0 pointer-events-none translate-x-6"
                      }`}
                    >
                      <div className="sm:w-2/5 bg-gradient-to-br from-indigo-900 to-[#1f1d6b] p-4 sm:p-6 flex flex-col items-center justify-center relative">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/90 shadow-lg bg-gray-200">
                          <img
                            src={person.image}
                            alt={person.nama}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-cyan-300 uppercase tracking-wider text-center">
                          {person.jawatan}
                        </span>
                      </div>

                      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-center bg-white">
                        <div className="mb-1">
                          <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest block">
                            {person.jawatan}
                          </span>
                          {person.subJawatan && (
                            <span className="text-[10px] text-gray-400 block font-medium">
                              {person.subJawatan}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                          {person.nama},{" "}
                          <span className="text-xs font-normal text-gray-500">
                            {person.gelaran}
                          </span>
                        </h3>
                        <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                          {person.penerangan}
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-cyan-600" />
                            <span>Tel: {person.tel}</span>
                          </div>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {idx + 1}/{managementList.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      {/* Footer (Meluncur Masuk Dari Bawah) */}
      <RevealOnScroll direction="bottom" delay={100}>
        <footer className="bg-[#1f1d6b] text-white pt-10 pb-6 border-t-4 border-cyan-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-indigo-400/30 pb-1">
                Mengenai KMK
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Kolej Matrikulasi Kedah (KMK) merupakan institusi pendidikan pra-universiti di bawah Kementerian Pendidikan Malaysia yang komited melahirkan modal insan cemerlang.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-indigo-400/30 pb-1">
                Visi & Misi
              </h3>
              <div className="text-xs sm:text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>
                  <span className="font-semibold text-cyan-400">Visi:</span> Penjana unggul pelajar pra-universiti berkualiti.
                </p>
                <p>
                  <span className="font-semibold text-cyan-400">Misi:</span> Membangunkan potensi pelajar dalam bidang sains & teknologi.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-indigo-400/30 pb-1">
                Hubungi Kami
              </h3>
              <address className="not-italic text-xs sm:text-sm text-gray-300 space-y-1 leading-relaxed">
                <p>Kolej Matrikulasi Kedah, 06010 Changlun, Kedah.</p>
                <p className="pt-1 text-gray-400">
                  Tel: 04-928 6100 | Faks: 04-928 6111
                </p>
              </address>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-indigo-900 text-center text-[11px] text-gray-400">
            © {new Date().getFullYear()} Kolej Matrikulasi Kedah. Hak Cipta Terpelihara.
          </div>
        </footer>
      </RevealOnScroll>

      {/* Butang Aksesibiliti */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          className="bg-indigo-900/90 backdrop-blur hover:bg-cyan-600 text-white p-2.5 rounded-full shadow-xl transition-all border border-white/20"
          aria-label="Pilihan Aksesibiliti"
        >
          <Accessibility size={20} />
        </button>
      </div>
    </div>
  );
}