import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router";

// Import logo anda di sini:
import LogoJppKMK from "../logo kmk jpp.jpeg";
// import LogoKPM from "../logo-kpm.png";       // Nyah-komen dan masukkan path fail anda
// import LogoTambahan from "../logo-lain.png"; // Nyah-komen dan masukkan path fail anda

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMgmtSlide, setCurrentMgmtSlide] = useState(0);
  const navigate = useNavigate();

  // URL placeholder untuk logo 1 & logo 3 (Gantikan dengan gambar/import sebenar anda)
  const logo1_KPM = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/200px-Coat_of_arms_of_Malaysia.svg.png";
  const logo2_KMK = LogoJppKMK;
  const logo3_Tambahan = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=60";

  // Data Slaid Hero Utama
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
    {
      id: 3,
      tabTitle: "Pengurusan Berkualiti",
      headline: "Kepimpinan Dinamik & Progresif",
      description:
        "Tadbir urus berintegriti dan komitmen pengurusan tertinggi dalam memastikan piawaian kecemerlangan sentiasa di tahap optimum.",
      link: "/organisasi",
      linkText: "Lihat struktur",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  // Data Slider Pengurusan Tertinggi
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
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 relative">
      {/* Floating Side Action Bar */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col bg-[#7b3f94] text-white rounded-l-2xl shadow-2xl overflow-hidden divide-y divide-purple-400/30">
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
      <div className="relative w-full h-[85vh] min-h-[620px] max-h-[900px] overflow-hidden bg-gray-950">
        {/* Header & Navigation Bar */}
        <header className="absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
          {/* Bar Atas Ringkas */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-end items-center gap-6 text-xs text-gray-200 border-b border-white/10">
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="hover:text-cyan-400 transition-colors">
                Perihal Kami
              </a>
              <a href="#news" className="hover:text-cyan-400 transition-colors">
                Berita & Media
              </a>
              <a href="#careers" className="hover:text-cyan-400 transition-colors">
                Kerjaya
              </a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">
                Hubungi Kami
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-cyan-400 cursor-pointer">BM</span>
              <span className="text-gray-500">|</span>
              <span className="hover:text-white cursor-pointer transition-colors">EN</span>
              <Globe size={14} className="ml-1 opacity-80" />
            </div>
          </div>

          {/* Bar Navigasi Utama */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-4">
            
            {/* TIGA LOGO DI PENJURU ATAS KIRI */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/40">
                {/* Logo 1 (Cth: Jata/KPM) */}
                <img
                  src={logo1_KPM}
                  alt="Logo 1"
                  className="h-8 sm:h-11 w-auto object-contain transition-transform hover:scale-105"
                />

                <div className="h-7 w-[1px] bg-slate-300" />

                {/* Logo 2 (Cth: KMK JPP) */}
                <img
                  src={logo2_KMK}
                  alt="Logo 2"
                  className="h-8 sm:h-11 w-auto object-contain transition-transform hover:scale-105"
                />

                <div className="h-7 w-[1px] bg-slate-300" />

                {/* Logo 3 (Cth: Logo Tambahan / Kelab / Inovasi) */}
                <img
                  src={logo3_Tambahan}
                  alt="Logo 3"
                  className="h-8 sm:h-11 w-auto object-contain transition-transform hover:scale-105"
                />
              </div>

              {/* Teks Nama Kolej */}
              <div className="hidden xl:block text-left text-white leading-tight">
                <span className="text-sm font-bold tracking-wider block drop-shadow">
                  KOLEJ MATRIKULASI KEDAH
                </span>
                <span className="text-[11px] text-gray-300 drop-shadow">
                  Kementerian Pendidikan Malaysia
                </span>
              </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex items-center gap-1 sm:gap-4 lg:gap-6 text-sm font-medium text-white">
              <button
                onClick={() => navigate("/")}
                className="px-2.5 sm:px-3 py-2 text-cyan-400 border-b-2 border-cyan-400 flex items-center gap-1.5 transition-all"
              >
                <Home size={16} />
                <span>Utama</span>
              </button>

              <button
                onClick={() => navigate("/Cadangan")}
                className="px-2.5 sm:px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-all flex items-center gap-1.5 text-gray-200"
              >
                <Info size={16} />
                <span>Cadangan</span>
              </button>

              <div className="relative group cursor-pointer hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-2 text-gray-200 hover:text-cyan-300">
                <span>Korporat</span>
                <ChevronDown size={14} className="opacity-70 group-hover:rotate-180 transition-transform" />
              </div>

              <button
                onClick={() => navigate("/organisasi")}
                className="px-2.5 sm:px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-all flex items-center gap-1.5 text-gray-200"
              >
                <Users size={16} />
                <span>Organisasi</span>
              </button>

              <a
                href="#aplikasi"
                className="px-2.5 sm:px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-all hidden lg:flex items-center gap-1.5 text-gray-200"
              >
                <LayoutGrid size={16} />
                <span>e-Aplikasi</span>
              </a>
            </nav>
          </div>
        </header>

        {/* Gambar Hero Slaid */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.headline}
              className={`w-full h-full object-cover transform transition-transform duration-[7000ms] ease-out ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        ))}

        {/* Teks Hero Slaid */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-24">
          <div className="max-w-2xl text-white">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${
                  index === currentSlide
                    ? "block animate-[fadeIn_0.8s_ease-in-out]"
                    : "hidden"
                }`}
              >
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-tight drop-shadow-md">
                  {slide.headline}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-8 line-clamp-3 leading-relaxed font-light drop-shadow">
                  {slide.description}
                </p>
                <button
                  onClick={() => navigate(slide.link)}
                  className="group inline-flex items-center gap-3 text-white text-base font-semibold hover:text-cyan-400 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full border-2 border-white group-hover:border-cyan-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                  </span>
                  <span>{slide.linkText}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigasi Bawah Hero Slaid */}
        <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-6 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-start lg:justify-between gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-white/20 pb-2">
              {slides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`whitespace-nowrap pb-2 text-xs sm:text-sm font-semibold transition-all duration-300 relative text-left ${
                      isActive
                        ? "text-cyan-400 scale-100"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <span>{slide.tabTitle}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Kandungan Bahagian Bawah */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          {/* Kad Video Korporat */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-[#1f1d6b] text-xl font-bold uppercase tracking-wider mb-6 pb-2 border-b-2 border-cyan-500 inline-block">
                Video Korporat
              </h2>
            </div>
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-xl aspect-video bg-gray-900 border border-gray-100 h-full max-h-[340px]">
              <img
                src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1000&auto=format&fit=crop"
                alt="Corporate Video Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 p-6 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                    KMK
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                      VIDEO KORPORAT KOLEJ MATRIKULASI KEDAH
                    </h3>
                    <p className="text-cyan-300 text-xs mt-0.5">KM KEDAH TV OFFICIAL</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl sm:text-4xl font-black text-white/20 uppercase tracking-widest">
                    DEWAN KMK
                  </h4>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 transition-all duration-300 shadow-2xl">
                  <PlayCircle size={40} className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Slider Pengurusan Tertinggi */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-cyan-500">
              <h2 className="text-[#1f1d6b] text-xl font-bold uppercase tracking-wider inline-block">
                Pengurusan Tertinggi
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMgmtSlide}
                  aria-label="Profil Sebelumnya"
                  className="p-1.5 rounded-full bg-slate-200 hover:bg-cyan-500 hover:text-white text-gray-700 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5 px-2">
                  {managementList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMgmtSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentMgmtSlide
                          ? "w-6 bg-cyan-600"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
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
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 overflow-hidden h-full min-h-[280px]">
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
                    <div className="sm:w-2/5 bg-gradient-to-br from-indigo-900 to-[#1f1d6b] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/90 shadow-xl relative z-10 bg-gray-200">
                        <img
                          src={person.image}
                          alt={person.nama}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="mt-3 text-[11px] font-semibold text-cyan-300 uppercase tracking-widest text-center relative z-10">
                        {person.jawatan}
                      </span>
                    </div>

                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center bg-white">
                      <div className="mb-2">
                        <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest block">
                          {person.jawatan}
                        </span>
                        {person.subJawatan && (
                          <span className="text-[11px] text-gray-400 block font-medium">
                            {person.subJawatan}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                        {person.nama},{" "}
                        <span className="text-xs font-normal text-gray-500">
                          {person.gelaran}
                        </span>
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-2.5 leading-relaxed">
                        {person.penerangan}
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-cyan-600" />
                          <span>Tel: {person.tel}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {idx + 1} daripada {managementList.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1f1d6b] text-white pt-14 pb-8 border-t-4 border-cyan-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider mb-4 border-b border-indigo-400/30 pb-2">
              Mengenai KMK
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Kolej Matrikulasi Kedah (KMK) merupakan institusi pendidikan pra-universiti di bawah Kementerian Pendidikan Malaysia yang komited melahirkan modal insan cemerlang.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold uppercase tracking-wider mb-4 border-b border-indigo-400/30 pb-2">
              Visi & Misi
            </h3>
            <div className="text-sm text-gray-300 space-y-2.5 leading-relaxed">
              <p>
                <span className="font-semibold text-cyan-400">Visi:</span> Penjana unggul pelajar pra-universiti berkualiti ke peringkat pengajian tinggi.
              </p>
              <p>
                <span className="font-semibold text-cyan-400">Misi:</span> Membangunkan potensi pelajar dalam bidang sains, teknologi, dan profesionalisme.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold uppercase tracking-wider mb-4 border-b border-indigo-400/30 pb-2">
              Hubungi Kami
            </h3>
            <address className="not-italic text-sm text-gray-300 space-y-1.5 leading-relaxed">
              <p>Kolej Matrikulasi Kedah,<br />06010 Changlun, Kedah Darul Aman.</p>
              <p className="pt-2 text-xs text-gray-400">
                Tel: 04-928 6100 | Faks: 04-928 6111
              </p>
            </address>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-indigo-900 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Kolej Matrikulasi Kedah. Hak Cipta Terpelihara.
        </div>
      </footer>

      {/* Butang Aksesibiliti */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          className="bg-indigo-900/90 backdrop-blur hover:bg-cyan-600 text-white p-3 rounded-full shadow-2xl transition-all border border-white/20"
          aria-label="Pilihan Aksesibiliti"
        >
          <Accessibility size={22} />
        </button>
      </div>
    </div>
  );
}