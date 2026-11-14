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
  Accessibility,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router";

// renew gambar dekat sni
import LogoJppKMK from "../logo kmk jpp.jpeg";
import QrImage from "../image/sampah ii/qr.jpg";
import Banner1 from "../image/sampah ii/dji 1.jpg";
import Banner2 from "../image/sampah ii/dji 2.jpg";
import Banner3 from "../image/sampah ii/dji 3.jpg";

// Pembantu untuk menyokong laluan gambar tempatan (src/image/...) dan URL luar
let localImageContext = null;
try {
  localImageContext = require.context(
    "../image",
    true,
    /\.(png|jpe?g|webp|gif)$/i
  );
} catch {
  localImageContext = null;
}

function resolveGaleriImage(imageSource) {
  if (!imageSource || typeof imageSource !== "string") return imageSource;
  if (
    /^(https?:|data:|blob:|\/static\/)/i.test(imageSource) ||
    !localImageContext
  ) {
    return imageSource;
  }

  const normalized = imageSource
    .replace(/^(\.\.\/)+src\/image\//i, "./")
    .replace(/^src\/image\//i, "./")
    .replace(/^\.\.\/image\//i, "./")
    .replace(/^(?!\.\/)/, "./");

  try {
    const asset = localImageContext(normalized);
    return asset && typeof asset === "object" && "default" in asset
      ? asset.default
      : asset;
  } catch {
    return imageSource;
  }
}

// Komponen Pembungkus Animasi Skrol Masuk (Intersection Observer)
function RevealOnScroll({
  children,
  direction = "bottom",
  delay = 0,
  className = "",
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);
  const domRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) setIsVisible(true);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    if (mediaQuery.matches) {
      setIsVisible(true);
      return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentElem = domRef.current;
    if (currentElem) observer.observe(currentElem);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  const getDirectionClasses = () => {
    if (prefersReducedMotion || isVisible) {
      return "opacity-100 translate-x-0 translate-y-0";
    }

    switch (direction) {
      case "left":
        return "opacity-0 -translate-x-8 sm:-translate-x-10";
      case "right":
        return "opacity-0 translate-x-8 sm:translate-x-10";
      case "top":
        return "opacity-0 -translate-y-8 sm:-translate-y-10";
      case "bottom":
      default:
        return "opacity-0 translate-y-8 sm:translate-y-10";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: prefersReducedMotion ? "0ms" : `${delay}ms`,
      }}
      className={`transform transition-[transform,opacity] duration-[650ms] ease-editorial will-change-transform motion-reduce:transition-none ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMgmtSlide, setCurrentMgmtSlide] = useState(0);
  const [currentGaleriSlide, setCurrentGaleriSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logoJppKMK = LogoJppKMK;

  const slides = [
    {
      id: 0,
      tabTitle: "Solusi Pendidikan",
      headline: "Terus Memacu Kecemerlangan",
      description:
        "Semangat kami terhadap pendidikan berkualiti mendorong kami untuk mencipta ekosistem pembelajaran dinamik demi masa depan anak bangsa.",
      link: "/organisasi",
      linkText: "Ketahui lagi",
      image: Banner1,
    },
    {
      id: 1,
      tabTitle: "Pembangunan Modal Insan",
      headline: "Sustainable Value Creation",
      description:
        "Sebagai institusi pra-universiti premier, kami membina sahsiah holistik dan pencapaian akademik berimpak tinggi merentasi sempadan.",
      link: "/Cadangan",
      linkText: "Ketahui lagi",
      image: Banner2
        
    },
    {
      id: 2,
      tabTitle: "Inovasi & Teknologi",
      headline: "Memacu Digitalisasi Kampus",
      description:
        "Mengintegrasikan pembelajaran pintar dan aplikasi digital interaktif bagi memperkasa daya saing warga kolej ke peringkat global.",
      link: "/aplikasi",
      linkText: "Terokai portal",
      image: Banner3,
    },
    {
      id: 3,
      tabTitle: "Inovasi",
      headline: "Memacu Digitalisas",
      description:
        "Mengintegrasikan pembelajaran pintar dan aplikasi digital interaktif bagi memperkasa daya saing warga kolej ke peringkat global.",
      image:
        "zawir.jpg",
    }
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

  const galeriList = [
    {
      id: 0,
      tajuk: "Hari Pendaftaran Pelajar Baharu",
      kategori: "Aktiviti Kampus",
      penerangan:
        "Suasana meriah menyambut kehadiran pelajar baharu sesi akademik ke Kolej Matrikulasi Kedah.",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
      driveLink: "https://drive.google.com/drive/folders/GANTIKAN_ID_FOLDER_1",
    },
    {
      id: 1,
      tajuk: "Majlis Anugerah Kecemerlangan",
      kategori: "Akademik",
      penerangan:
        "Pengiktirafan kepada pelajar cemerlang yang berjaya mencatatkan keputusan PNGK terbaik.",
      image:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop",
      driveLink: "https://drive.google.com/drive/folders/GANTIKAN_ID_FOLDER_2",
    },
    {
      id: 2,
      tajuk: "Kejohanan Sukan Antara Kolej",
      kategori: "Kokurikulum",
      penerangan:
        "Semangat kesukanan dan kerjasama berpasukan warga KMK di peringkat kebangsaan.",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
      driveLink: "https://drive.google.com/drive/folders/GANTIKAN_ID_FOLDER_3",
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

  const nextGaleriSlide = useCallback(() => {
    setCurrentGaleriSlide((prev) =>
      prev === galeriList.length - 1 ? 0 : prev + 1
    );
  }, [galeriList.length]);

  const prevGaleriSlide = () => {
    setCurrentGaleriSlide((prev) =>
      prev === 0 ? galeriList.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide, nextSlide]);

  useEffect(() => {
    const mgmtTimer = setTimeout(() => {
      nextMgmtSlide();
    }, 7000);
    return () => clearTimeout(mgmtTimer);
  }, [currentMgmtSlide, nextMgmtSlide]);

  useEffect(() => {
    const galeriTimer = setTimeout(() => {
      nextGaleriSlide();
    }, 7500);
    return () => clearTimeout(galeriTimer);
  }, [currentGaleriSlide, nextGaleriSlide]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 relative overflow-x-hidden">
      {/* Floating Action Bar */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col bg-[#7b3f94] text-white rounded-l-2xl shadow-2xl overflow-hidden divide-y divide-purple-400/30">
        <button
          aria-label="Pengumuman"
          className="p-3.5 hover:bg-[#68327d] active:scale-95 transition-[transform,background-color] duration-300 ease-editorial flex items-center justify-center motion-reduce:transition-none"
        >
          <Volume2 size={20} />
        </button>
        <button
          aria-label="Carian Pantas"
          className="p-3.5 hover:bg-[#68327d] active:scale-95 transition-[transform,background-color] duration-300 ease-editorial flex items-center justify-center motion-reduce:transition-none"
        >
          <Search size={20} />
        </button>
        <button
          aria-label="Kongsi"
          className="p-3.5 hover:bg-[#68327d] active:scale-95 transition-[transform,background-color] duration-300 ease-editorial flex items-center justify-center motion-reduce:transition-none"
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
            {/* Logo JPP KMK */}
            <div className="flex items-center bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md shrink-0">
              <img
                src={logoJppKMK}
                alt="Logo JPP KMK"
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[160px] sm:max-w-[200px] object-contain shrink-0"
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
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-colors duration-300 ease-editorial flex items-center gap-1.5 text-gray-200 motion-reduce:transition-none"
              >
                <Info size={16} />
                <span>Cadangan</span>
              </button>

              <button
                onClick={() => navigate("/organisasi")}
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-colors duration-300 ease-editorial flex items-center gap-1.5 text-gray-200 motion-reduce:transition-none"
              >
                <Users size={16} />
                <span>Organisasi</span>
              </button>
            </nav>

            {/* Butang Hamburger Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 active:scale-95 transition-[transform,background-color] duration-300 ease-editorial motion-reduce:transition-none"
                aria-label="Buka Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Laci Menu Mobile dengan Animasi Slide & Fade */}
          <div
            className={`md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-editorial bg-indigo-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl motion-reduce:transition-none ${mobileMenuOpen
              ? "max-h-80 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-3 pointer-events-none"
              }`}
          >
            <div className="px-6 py-5 text-white space-y-3">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-cyan-400 bg-white/5 font-semibold text-sm transition-transform duration-200 active:scale-[0.98] motion-reduce:transition-none"
              >
                <Home size={18} />
                <span>Utama</span>
              </button>

              <button
                onClick={() => {
                  navigate("/Cadangan");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-[transform,background-color,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
              >
                <Info size={18} />
                <span>Cadangan Penambahbaikan</span>
              </button>

              <button
                onClick={() => {
                  navigate("/organisasi");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-[transform,background-color,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
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
            className={`absolute inset-0 transition-opacity duration-700 ease-editorial motion-reduce:transition-none ${index === currentSlide
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className={`w-full h-full object-cover transform transition-transform duration-700 ease-editorial motion-reduce:transition-none motion-reduce:scale-100 ${index === currentSlide ? "scale-[1.03]" : "scale-100"
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
                className={index === currentSlide ? "block" : "hidden"}
              >
                <h1
                  style={{ animationDelay: "0ms" }}
                  className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 leading-tight drop-shadow-md ${index === currentSlide ? "animate-hero-in" : ""
                    }`}
                >
                  {slide.headline}
                </h1>
                <p
                  style={{ animationDelay: "100ms" }}
                  className={`text-xs sm:text-base text-gray-200 mb-6 line-clamp-3 leading-relaxed font-normal drop-shadow ${index === currentSlide ? "animate-hero-in" : ""
                    }`}
                >
                  {slide.description}
                </p>
                {slide.link && (
                  <button
                    style={{ animationDelay: "180ms" }}
                    onClick={() => navigate(slide.link)}
                    className={`group inline-flex items-center gap-2.5 text-white text-sm sm:text-base font-semibold hover:text-cyan-400 transition-colors duration-300 ease-editorial motion-reduce:transition-none ${index === currentSlide ? "animate-hero-in" : ""
                      }`}
                  >
                    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white group-hover:border-cyan-400 group-hover:bg-cyan-400/15 flex items-center justify-center group-hover:translate-x-1 transition-[transform,border-color,background-color] duration-300 ease-editorial motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                      <ArrowRight size={16} />
                    </span>
                    <span>{slide.linkText || "Ketahui lagi"}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigasi Bawah Slider */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-6 pb-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-white/20 pb-2">
              {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`whitespace-nowrap pb-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ease-editorial relative text-left shrink-0 motion-reduce:transition-none ${isActive
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-gray-200"
                      }`}
                  >
                    <span>{slide.tabTitle}</span>
                    {isActive && (
                      <span
                        key={`progress-${currentSlide}`}
                        className="absolute bottom-0 left-0 w-full h-[2.5px] bg-white/20 rounded-full overflow-hidden"
                      >
                        <span className="block w-full h-full bg-cyan-400 rounded-full animate-tab-progress" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Peralihan Kecerunan Lembut antara Hero & Kandungan Utama */}
      <div
        aria-hidden="true"
        className="h-6 bg-gradient-to-b from-gray-950/15 to-transparent pointer-events-none"
      />

      {/* Kandungan Bahagian Bawah (Animasi Skrol Masuk) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start overflow-hidden">
          {/* Gambar Kiri (Ratio 1:1, Untuk setup lain nanti) */}
          <RevealOnScroll
            direction="left"
            delay={100}
            className="order-2 lg:order-1"
          >
            <div className="relative group rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white aspect-square w-full">
              <img
                src={QrImage}
                alt="QR Kolej Matrikulasi Kedah"
                className="w-full h-full object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </RevealOnScroll>

          {/* Lajur Kanan: Galeri KMK di atas Pengurusan Tertinggi */}
          <div className="order-1 lg:order-2 flex flex-col gap-10">
            {/* Slider Galeri KMK (Ratio 4:2) */}
            <RevealOnScroll direction="right" delay={100}>
              <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-cyan-500">
                  <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider inline-block">
                    Galeri KMK
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevGaleriSlide}
                      aria-label="Galeri Sebelumnya"
                      className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white active:scale-95 text-gray-700 transition-[transform,background-color,color] duration-300 ease-editorial motion-reduce:transition-none"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex gap-1 px-1">
                      {galeriList.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentGaleriSlide(idx)}
                          className={`h-2 rounded-full transition-[width,background-color] duration-300 ease-editorial motion-reduce:transition-none ${idx === currentGaleriSlide
                            ? "w-5 bg-cyan-600"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                          aria-label={`Ke galeri ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextGaleriSlide}
                      aria-label="Galeri Seterusnya"
                      className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white active:scale-95 text-gray-700 transition-[transform,background-color,color] duration-300 ease-editorial motion-reduce:transition-none"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden aspect-[4/2] w-full">
                  {galeriList.map((item, idx) => {
                    const isSelected = idx === currentGaleriSlide;
                    return (
                      <a
                        key={item.id}
                        href={item.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isSelected ? 0 : -1}
                        aria-hidden={!isSelected}
                        aria-label={`Buka album ${item.tajuk} di Google Drive`}
                        className={`group absolute inset-0 block transition-[transform,opacity] duration-500 ease-editorial motion-reduce:transition-none ${isSelected
                          ? "opacity-100 z-10 translate-x-0 pointer-events-auto"
                          : "opacity-0 z-0 pointer-events-none translate-x-4"
                          }`}
                      >
                        <img
                          src={resolveGaleriImage(item.image)}
                          alt={item.tajuk}
                          className="w-full h-full object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />

                        {/* Petunjuk pautan luar di bucu atas kanan */}
                        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/25 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-colors duration-300 ease-editorial motion-reduce:transition-none">
                          <span>Lihat Album Penuh</span>
                          <ExternalLink size={12} />
                        </span>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 sm:p-6 flex flex-col justify-end">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                              {item.kategori}
                            </span>
                            <span className="text-[10px] bg-white/15 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                              {idx + 1}/{galeriList.length}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-lg font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors duration-300 ease-editorial motion-reduce:transition-none">
                            {item.tajuk}
                          </h3>
                          <p className="text-gray-200 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {item.penerangan}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </RevealOnScroll>

            {/* Slider Pengurusan Tertinggi */}
            <RevealOnScroll direction="right" delay={200}>
              <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-cyan-500">
                  <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider inline-block">
                    Pengurusan Tertinggi
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevMgmtSlide}
                      aria-label="Profil Sebelumnya"
                      className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white active:scale-95 text-gray-700 transition-[transform,background-color,color] duration-300 ease-editorial motion-reduce:transition-none"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex gap-1 px-1">
                      {managementList.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentMgmtSlide(idx)}
                          className={`h-2 rounded-full transition-[width,background-color] duration-300 ease-editorial motion-reduce:transition-none ${idx === currentMgmtSlide
                            ? "w-5 bg-cyan-600"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                            }`}
                          aria-label={`Ke profil ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextMgmtSlide}
                      aria-label="Profil Seterusnya"
                      className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white active:scale-95 text-gray-700 transition-[transform,background-color,color] duration-300 ease-editorial motion-reduce:transition-none"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden min-h-[260px] sm:min-h-[280px]">
                  {managementList.map((person, idx) => {
                    const isSelected = idx === currentMgmtSlide;
                    return (
                      <div
                        key={person.id}
                        className={`absolute inset-0 flex flex-col sm:flex-row transition-[transform,opacity] duration-500 ease-editorial motion-reduce:transition-none ${isSelected
                          ? "opacity-100 z-10 translate-x-0"
                          : "opacity-0 z-0 pointer-events-none translate-x-4"
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
          </div>
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
          className="bg-indigo-900/90 backdrop-blur hover:bg-cyan-600 hover:scale-105 active:scale-95 text-white p-2.5 rounded-full shadow-xl transition-[transform,background-color] duration-300 ease-editorial border border-white/20 motion-reduce:transition-none motion-reduce:hover:scale-100"
          aria-label="Pilihan Aksesibiliti"
        >
          <Accessibility size={20} />
        </button>
      </div>
    </div>
  );
}