import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Phone,
  Home,
  Info,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Share2,
  Volume2,
  Accessibility,
  Menu,
  X,
  ExternalLink,
  Coffee,
  Clock,
  Calculator,
  Radio,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_KAFE_LIST } from "./LiveBoard";

// 174 slide banner
// 217 pengurusan tertinggi
//
//
//
//
//
//
//
//

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
      className={`transform transition-[transform,opacity] overflow-hidden duration-[650ms] ease-editorial will-change-transform motion-reduce:transition-none ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMgmtSlide, setCurrentMgmtSlide] = useState(0);
  const [currentGaleriSlide, setCurrentGaleriSlide] = useState(0);
  const [galeriPreview, setGaleriPreview] = useState(null);
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
      image: Banner1

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
      image: Banner1

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
      image: Banner1

    },
  ];

  const DEFAULT_GALERI_LIST = [
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

  const [galeriList, setGaleriList] = useState(DEFAULT_GALERI_LIST);

  const DEFAULT_JPP_ACTIVITIES = [
    {
      id: "act_1",
      title: "Minggu Haluan Pelajar & Suai Kenal Sesi 2026/2027",
      dateStr: "2026-10-14",
      category: "Kebajikan",
      location: "Dewan Sri Ledang, KMK",
      participants: "1,200 Pelajar",
      description:
        "Program orientasi bersepadu bagi menyambut pelajar baharu, memperkenalkan budaya akademik kolej serta barisan kepimpinan JPP KMK.",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
      reportUrl: "https://drive.google.com/",
    },
    {
      id: "act_2",
      title: "Klinik Pecutan Akhir PSPM & Peer Tutoring",
      dateStr: "2026-09-28",
      category: "Akademik",
      location: "Bilik Kuliah Utama & Perpustakaan KMK",
      participants: "450 Pelajar",
      description:
        "Sesi bimbingan rakan sebaya dan bengkel teknik menjawab soalan peperiksaan bersama pelajar cemerlang dan pensyarah pakar.",
      image:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop",
      reportUrl: "https://drive.google.com/",
    },
    {
      id: "act_3",
      title: "Karnival Sukan Antara Kolej Kediaman (SUKKOM)",
      dateStr: "2026-08-19",
      category: "Sukan dan Kebudayaan",
      location: "Kompleks Sukan Kolej Matrikulasi Kedah",
      participants: "800 Pelajar",
      description:
        "Kejohanan sukan tahunan merangkumi bola sepak, bola jaring, badminton dan e-sukan bagi memupuk semangat kesukanan warga kampus.",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop",
      reportUrl: "https://drive.google.com/",
    },
  ];

  const ACTIVITY_CATEGORIES = [
    "Semua",
    "Kebajikan",
    "Kerohanian",
    "Sukan dan Kebudayaan",
    "Penerbitan dan Penerangan",
    "Perhubungan Luar",
    "Akademik",
    "Keselamatan dan Sahsiah",
  ];

  const getCategoryBadgeClasses = (category) => {
    switch (category) {
      case "Kebajikan":
        return "text-rose-800 bg-rose-50 border-rose-200";
      case "Kerohanian":
        return "text-emerald-800 bg-emerald-50 border-emerald-200";
      case "Sukan dan Kebudayaan":
        return "text-amber-800 bg-amber-50 border-amber-200";
      case "Penerbitan dan Penerangan":
        return "text-purple-800 bg-purple-50 border-purple-200";
      case "Perhubungan Luar":
        return "text-sky-800 bg-sky-50 border-sky-200";
      case "Akademik":
        return "text-indigo-800 bg-indigo-50 border-indigo-200";
      case "Keselamatan dan Sahsiah":
        return "text-teal-800 bg-teal-50 border-teal-200";
      default:
        return "text-cyan-800 bg-cyan-50 border-cyan-200";
    }
  };

  const [jppActivities, setJppActivities] = useState(DEFAULT_JPP_ACTIVITIES);
  const [selectedActivityCat, setSelectedActivityCat] = useState("Semua");
  const [activeActivityModal, setActiveActivityModal] = useState(null);

  const formatActivityDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("ms-MY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const [kafeMiniList, setKafeMiniList] = useState(DEFAULT_KAFE_LIST);
  const [tickerItems, setTickerItems] = useState([
    {
      id: "default_1",
      tajuk: "Selamat Datang ke Portal Rasmi JPP Kolej Matrikulasi Kedah",
      status: "Makluman",
      isPinned: true,
    },
    {
      id: "default_2",
      tajuk: "Semak status operasi Kafe A, B & C secara masa nyata di Live Board",
      status: "Info",
    },
  ]);
  const [countdownInfo, setCountdownInfo] = useState({
    title: "Peperiksaan Semester Program Matrikulasi (PSPM)",
    targetDate: "2027-03-15T08:00:00",
  });
  const [countdownLeft, setCountdownLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // State Kalkulator Sasaran PNGK (4 Subjek Teras)
  const GRADE_OPTIONS = [
    { label: "A (4.00)", value: 4.0 },
    { label: "A- (3.67)", value: 3.67 },
    { label: "B+ (3.33)", value: 3.33 },
    { label: "B (3.00)", value: 3.0 },
    { label: "B- (2.67)", value: 2.67 },
    { label: "C+ (2.33)", value: 2.33 },
    { label: "C (2.00)", value: 2.0 },
    { label: "C- (1.67)", value: 1.67 },
    { label: "D+ (1.33)", value: 1.33 },
    { label: "D (1.00)", value: 1.0 },
    { label: "F (0.00)", value: 0.0 },
  ];
  const [gpaSubjects, setGpaSubjects] = useState([
    { name: "Subjek Teras 1", grade: 4.0, credit: 5 },
    { name: "Subjek Teras 2", grade: 4.0, credit: 5 },
    { name: "Subjek Teras 3", grade: 3.67, credit: 4 },
    { name: "Subjek Teras 4", grade: 4.0, credit: 4 },
  ]);

  const totalCredits = gpaSubjects.reduce(
    (sum, s) => sum + Number(s.credit || 0),
    0
  );
  const totalPoints = gpaSubjects.reduce(
    (sum, s) => sum + Number(s.grade) * Number(s.credit || 0),
    0
  );
  const calculatedPngk =
    totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  const numericPngk = parseFloat(calculatedPngk);
  const pngkStatus =
    numericPngk >= 3.75
      ? {
          label: "Calculator",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        }
      : numericPngk >= 3.5
      ? {
          label: "Cemerlang",
          cls: "bg-cyan-50 text-cyan-800 border-cyan-200",
        }
      : {
          label: "Lulus",
          cls: "bg-indigo-50 text-[#1f1d6b] border-indigo-200",
        };

  useEffect(() => {
    const handleListenerError = (error) =>
      console.error("Firestore listener error:", error);

    const unsubGaleri = onSnapshot(
      collection(db, "galeri_events"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          setGaleriList(docs);
          setCurrentGaleriSlide((prev) => (prev >= docs.length ? 0 : prev));
        } else {
          setGaleriList(DEFAULT_GALERI_LIST);
        }
      },
      handleListenerError
    );

    const unsubTimeline = onSnapshot(
      collection(db, "liveboard_timeline"),
      (snapshot) => {
        if (!snapshot.empty) {
          const nowMs = Date.now();
          const activeDocs = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter(
              (item) =>
                (!item.publishAtMs || nowMs >= item.publishAtMs) &&
                (!item.expireAtMs || nowMs < item.expireAtMs)
            );
          activeDocs.sort((a, b) => {
            const pinDiff =
              Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
            if (pinDiff !== 0) return pinDiff;
            return (b.createdAtMs || 0) - (a.createdAtMs || 0);
          });
          if (activeDocs.length > 0) {
            setTickerItems(activeDocs.slice(0, 3));
          }
        }
      },
      handleListenerError
    );

    const unsubKafe = onSnapshot(
      collection(db, "liveboard_kafe"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          docs.sort((a, b) => (a.susunan || 99) - (b.susunan || 99));
          setKafeMiniList(docs);
        } else {
          setKafeMiniList(DEFAULT_KAFE_LIST);
        }
      },
      handleListenerError
    );

    const unsubCountdown = onSnapshot(
      doc(db, "system_settings", "countdown"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCountdownInfo({
            title:
              data.title ||
              "Peperiksaan Semester Program Matrikulasi (PSPM)",
            targetDate: data.targetDate || "2027-03-15T08:00:00",
          });
        }
      },
      handleListenerError
    );

    const unsubActivities = onSnapshot(
      collection(db, "jpp_activities"),
      (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          docs.sort((a, b) => {
            const cmp = String(b.dateStr || "").localeCompare(
              String(a.dateStr || "")
            );
            if (cmp !== 0) return cmp;
            return (b.createdAtMs || 0) - (a.createdAtMs || 0);
          });
          setJppActivities(docs);
        } else {
          setJppActivities(DEFAULT_JPP_ACTIVITIES);
        }
      },
      handleListenerError
    );

    return () => {
      unsubGaleri();
      unsubTimeline();
      unsubKafe();
      unsubCountdown();
      unsubActivities();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kiraan detik setiap saat menuju targetDate PSPM
  useEffect(() => {
    const updateTimer = () => {
      const targetMs = new Date(countdownInfo.targetDate).getTime();
      const diff = Math.max(0, targetMs - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdownLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [countdownInfo.targetDate]);

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

      {/* Ticker Berita Bergerak (Marquee) di atas Hero */}
      <div
        onClick={() => navigate("/live-board")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") navigate("/live-board");
        }}
        className="bg-[#1f1d6b] text-white border-b border-cyan-400/40 py-2 px-4 cursor-pointer overflow-hidden relative z-50 hover:bg-indigo-950 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-400/50 text-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span>TERKINI</span>
          </span>

          <div className="overflow-hidden flex-1">
            <div className="animate-marquee-ticker text-xs font-medium text-gray-100">
              {[...tickerItems, ...tickerItems].map((item, idx) => (
                <span key={`${item.id}-${idx}`} className="mx-6 inline-flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">
                    [{item.isPinned ? "DISEMAT" : item.status || "Info"}]
                  </span>
                  <span>{item.tajuk}</span>
                </span>
              ))}
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 shrink-0">
            <span>Live Board</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[100dvh] min-h-[600px] max-h-[900px] overflow-hidden bg-gray-950">
        {/* Header & Navigation */}
        <header className="absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
          {/* Bar Atas Rasmi */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-white/15">
            <span className="text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white drop-shadow-sm">
              Laman Web Rasmi JABATAN PERWAKILAN PELAJAR KOLEJ MATRIKULASI KEDAH
            </span>
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

              <button
                onClick={() => navigate("/takwim")}
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-colors duration-300 ease-editorial flex items-center gap-1.5 text-gray-200 motion-reduce:transition-none"
              >
                <Calendar size={16} />
                <span>Takwim</span>
              </button>

              <button
                onClick={() => navigate("/live-board")}
                className="px-3 py-2 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-400 transition-colors duration-300 ease-editorial flex items-center gap-2 text-gray-200 motion-reduce:transition-none"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span>Live Board</span>
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
              ? "max-h-96 opacity-100 translate-y-0"
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

              <button
                onClick={() => {
                  navigate("/takwim");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-[transform,background-color,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
              >
                <Calendar size={18} />
                <span>Takwim</span>
              </button>

              <button
                onClick={() => {
                  navigate("/live-board");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-200 hover:bg-white/5 hover:text-white font-medium text-sm transition-[transform,background-color,color] duration-200 active:scale-[0.98] motion-reduce:transition-none"
              >
                <span className="relative flex h-2.5 w-2.5 ml-0.5 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span>Live Board</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12 md:space-y-16">
        {/* Widget Mini Status Kafe */}
        <RevealOnScroll direction="bottom" delay={50}>
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1f1d6b] text-cyan-300 flex items-center justify-center shrink-0">
                  <Coffee size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#1f1d6b] leading-tight">
                    Status Operasi Kafe Semasa
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Kemas kini masa nyata daripada Live Board JPP KMK
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/live-board")}
                className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-cyan-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Radio size={14} />
                <span>Lihat Live Board Penuh</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {kafeMiniList.slice(0, 3).map((kafe, idx) => {
                const isClosed =
                  (kafe.status || "").trim().toLowerCase() === "ditutup";
                return (
                  <div
                    key={kafe.id || idx}
                    onClick={() => navigate("/live-board")}
                    className={`rounded-2xl border p-4 flex items-center justify-between gap-3 cursor-pointer transition-transform duration-300 ease-editorial hover:-translate-y-0.5 ${
                      isClosed
                        ? "bg-red-50/80 border-red-200"
                        : "bg-slate-50/80 border-slate-200/80 hover:border-cyan-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#1f1d6b] truncate">
                        {kafe.tajuk}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {isClosed && kafe.tarikh_buka && kafe.tarikh_buka !== "-"
                          ? `Ditutup sehingga: ${kafe.tarikh_buka}`
                          : kafe.sebab || "Beroperasi seperti biasa"}
                      </p>
                    </div>

                    {isClosed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 shrink-0">
                        <AlertTriangle size={11} />
                        <span>Ditutup</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <CheckCircle2 size={11} />
                        <span>Buka</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </RevealOnScroll>

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
                    const driveHref = String(
                      item.driveLink || item.driveUrl || item.link || ""
                    ).trim();
                    const hasDrive =
                      driveHref.length > 0 && driveHref !== "#";
                    const CardTag = hasDrive ? "a" : "div";
                    const cardProps = hasDrive
                      ? {
                          href: driveHref,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          "aria-label": `Buka album ${item.tajuk} di Google Drive`,
                        }
                      : {
                          role: "button",
                          onClick: () => setGaleriPreview(item),
                          onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setGaleriPreview(item);
                            }
                          },
                          "aria-label": `Pratonton gambar ${item.tajuk}`,
                        };
                    return (
                      <CardTag
                        key={item.id}
                        {...cardProps}
                        tabIndex={isSelected ? 0 : -1}
                        aria-hidden={!isSelected}
                        className={`group absolute inset-0 block cursor-pointer transition-[transform,opacity] duration-500 ease-editorial motion-reduce:transition-none ${isSelected
                          ? "opacity-100 z-10 translate-x-0 pointer-events-auto"
                          : "opacity-0 z-0 pointer-events-none translate-x-4"
                          }`}
                      >
                        <img
                          src={resolveGaleriImage(item.image)}
                          alt={item.tajuk}
                          className="w-full h-full object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />

                        {/* Lencana Google Drive (hanya jika pautan wujud) */}
                        {hasDrive && (
                          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/25 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-white group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-colors duration-300 ease-editorial motion-reduce:transition-none">
                            <span>Lihat Album Drive</span>
                            <ExternalLink size={12} />
                          </span>
                        )}

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
                      </CardTag>
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

        {/* Seksyen Jejak Aktiviti JPP KMK (Vertical Interactive Timeline) */}
        <RevealOnScroll direction="bottom" delay={120}>
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-cyan-500 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">
                  Garis Masa Program &amp; Inisiatif
                </span>
                <h2 className="text-[#1f1d6b] text-lg sm:text-2xl font-extrabold uppercase tracking-wider mt-0.5">
                  Jejak Aktiviti JPP KMK
                </h2>
              </div>

              {/* Bar Penapis Kategori */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {ACTIVITY_CATEGORIES.map((cat) => {
                  const isSelected = selectedActivityCat === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedActivityCat(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#1f1d6b] text-cyan-300 shadow-sm"
                          : "bg-white text-gray-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const filteredActivities =
                selectedActivityCat === "Semua"
                  ? jppActivities
                  : jppActivities.filter(
                      (a) => a.category === selectedActivityCat
                    );

              if (filteredActivities.length === 0) {
                return (
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs sm:text-sm text-gray-500">
                    Tiada rekod aktiviti untuk kategori{" "}
                    <strong>{selectedActivityCat}</strong> buat masa ini.
                  </div>
                );
              }

              return (
                <div className="relative border-l-2 border-[#1f1d6b] ml-3 sm:ml-5 pl-6 sm:pl-8 space-y-6">
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Titik Nod Cyan */}
                      <span className="absolute -left-[31px] sm:-left-[39px] top-5 h-4 w-4 rounded-full bg-cyan-400 border-4 border-[#1f1d6b] shadow-sm transition-transform duration-300 group-hover:scale-125" />

                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start">
                        {act.image && (
                          <div className="w-full md:w-48 aspect-[4/2] md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                            <img
                              src={resolveGaleriImage(act.image)}
                              alt={act.title}
                              className="w-full h-full object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.03]"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f1d6b] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                              <Calendar size={11} />
                              <span>{formatActivityDate(act.dateStr)}</span>
                            </span>
                            {act.category && (
                              <span
                                className={`inline-flex items-center text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(
                                  act.category
                                )}`}
                              >
                                {act.category}
                              </span>
                            )}
                            {act.participants && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                <Users size={11} />
                                <span>{act.participants}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-extrabold text-[#1f1d6b] leading-snug">
                            {act.title}
                          </h3>

                          {act.location && (
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                              <MapPin size={13} className="text-cyan-600 shrink-0" />
                              <span>{act.location}</span>
                            </p>
                          )}

                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {act.description}
                          </p>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setActiveActivityModal(act)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f1d6b] hover:text-cyan-600 transition-colors cursor-pointer"
                            >
                              <span>Lihat Butiran / Laporan</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>
        </RevealOnScroll>

        {/* Seksyen Hab Pelajar KMK (3 Kolum) */}
        <RevealOnScroll direction="bottom" delay={150}>
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-cyan-500 pb-2">
              <h2 className="text-[#1f1d6b] text-lg sm:text-2xl font-extrabold uppercase tracking-wider">
                Hab Pelajar KMK
              </h2>
              <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
                Utiliti &amp; Akademik
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Kad 1: Countdown PSPM */}
              <div className="bg-gradient-to-br from-[#1f1d6b] via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    <span>Kiraan Detik Akademik</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold mt-3 leading-snug text-white">
                    {countdownInfo.title}
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2.5 my-6">
                  {[
                    { label: "Hari", value: countdownLeft.days },
                    { label: "Jam", value: countdownLeft.hours },
                    { label: "Minit", value: countdownLeft.minutes },
                    { label: "Saat", value: countdownLeft.seconds },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl py-3 px-2 text-center"
                    >
                      <span className="block text-xl sm:text-2xl font-black text-cyan-300 tabular-nums">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-indigo-200 text-center">
                  Sasaran:{" "}
                  {new Date(countdownInfo.targetDate).toLocaleDateString(
                    "ms-MY",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              {/* Kad 2: Kalkulator Sasaran PNGK Matrikulasi */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-base font-extrabold text-[#1f1d6b] flex items-center gap-2">
                      <Calculator size={18} className="text-cyan-600" />
                      <span>Kalkulator Sasaran PNGK</span>
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pngkStatus.cls}`}
                    >
                      {pngkStatus.label}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {gpaSubjects.map((sub, idx) => (
                      <div
                        key={sub.name}
                        className="grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        <span className="col-span-5 font-semibold text-gray-700 truncate">
                          {sub.name}
                        </span>
                        <select
                          aria-label={`Gred ${sub.name}`}
                          value={sub.grade}
                          onChange={(e) => {
                            const updated = [...gpaSubjects];
                            updated[idx] = {
                              ...sub,
                              grade: parseFloat(e.target.value),
                            };
                            setGpaSubjects(updated);
                          }}
                          className="col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-[#1f1d6b] bg-slate-50"
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g.label} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label={`Jam Kredit ${sub.name}`}
                          value={sub.credit}
                          onChange={(e) => {
                            const updated = [...gpaSubjects];
                            updated[idx] = {
                              ...sub,
                              credit: parseInt(e.target.value, 10),
                            };
                            setGpaSubjects(updated);
                          }}
                          className="col-span-3 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-gray-700 bg-slate-50"
                        >
                          <option value={4}>4 Jam</option>
                          <option value={5}>5 Jam</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Anggaran PNGK Semasa:
                  </span>
                  <span className="text-2xl font-black text-[#1f1d6b] tabular-nums">
                    {calculatedPngk}
                  </span>
                </div>
              </div>

              {/* Kad 3: Pautan Pantas Rasmi KPM */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#1f1d6b] mb-1">
                    Pautan Pantas Rasmi KPM
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Akses terus ke portal akademik &amp; perkhidmatan pelajar
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Portal Rasmi BMKPM (KPM)",
                        url: "https://www.moe.gov.my",
                      },
                      {
                        label: "Sistem Pembelajaran DELIMa",
                        url: "https://d2.delima.edu.my",
                      },
                      {
                        label: "Semakan Keputusan Matrikulasi",
                        url: "https://matrikulasi.moe.gov.my",
                      },
                      {
                        label: "e-Mel Rasmi Pelajar (Google Workspace)",
                        url: "https://mail.google.com",
                      },
                    ].map((item) => (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50/70 hover:bg-cyan-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 hover:text-[#1f1d6b] transition-colors"
                      >
                        <span className="truncate">{item.label}</span>
                        <ExternalLink
                          size={14}
                          className="text-gray-400 group-hover:text-cyan-600 shrink-0"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </main>

      {/* Footer (Meluncur Masuk Dari Bawah) */}
      <RevealOnScroll direction="bottom" delay={100}>
        <footer
          id="about"
          className="bg-[#1f1d6b] text-white pt-10 pb-6 border-t-4 border-cyan-400"
        >
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
                Visi &amp; Misi
              </h3>
              <div className="text-xs sm:text-sm text-gray-300 space-y-2 leading-relaxed">
                <p>
                  <span className="font-semibold text-cyan-400">Visi:</span> Penjana unggul pelajar pra-universiti berkualiti.
                </p>
                <p>
                  <span className="font-semibold text-cyan-400">Misi:</span> Membangunkan potensi pelajar dalam bidang sains &amp; teknologi.
                </p>
              </div>
            </div>

            <div id="contact">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-indigo-400/30 pb-1">
                Hubungi Kami
              </h3>
              <address className="not-italic text-xs sm:text-sm text-gray-300 space-y-1 leading-relaxed">
                <p>
                  Kolej Matrikulasi Kedah, Kementerian Pendidikan Malaysia, 06010 Changlun, Kedah Darul Aman.
                </p>
                <p className="pt-1 text-gray-300">
                  Tel: 04-928 6100 | Faks: 04-924 2186
                </p>
                <p>
                  E-mel:{" "}
                  <a
                    href="mailto:info@kmk.matrik.edu.my"
                    className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                  >
                    info@kmk.matrik.edu.my
                  </a>
                </p>
              </address>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <a
                  href="https://www.kmk.matrik.edu.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-300 ease-editorial"
                >
                  <span>Portal Rasmi KMK</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => navigate("/live-board")}
                  className="inline-flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-400/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-300 ease-editorial cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span>Buka Live Board</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-4 border-t border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
            <p>
              © {new Date().getFullYear()} Kolej Matrikulasi Kedah. Hak Cipta Terpelihara.
            </p>
            <p className="text-gray-300">
              Dibangunkan oleh{" "}
              <span className="font-semibold text-cyan-400">
                Muhammad Hafizhan Haziq
              </span>{" "}
              • Biro Penerangan &amp; Penerbitan JPP KMK
            </p>
          </div>
        </footer>
      </RevealOnScroll>

      {/* Modal Pratonton Gambar Galeri (di luar RevealOnScroll supaya fixed inset-0 meliputi skrin penuh) */}
      {galeriPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pratonton ${galeriPreview.tajuk}`}
          onClick={() => setGaleriPreview(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full"
          >
            <button
              type="button"
              onClick={() => setGaleriPreview(null)}
              aria-label="Tutup pratonton"
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white text-gray-800 shadow-lg hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <img
              src={resolveGaleriImage(galeriPreview.image)}
              alt={galeriPreview.tajuk}
              className="w-full max-h-[80vh] object-contain rounded-2xl bg-black"
            />
            <div className="mt-3 text-white">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                {galeriPreview.kategori}
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                {galeriPreview.tajuk}
              </h3>
              {galeriPreview.penerangan && (
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  {galeriPreview.penerangan}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Butiran Aktiviti JPP */}
      {activeActivityModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveActivityModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {activeActivityModal.image && (
              <div className="relative aspect-[4/2] w-full bg-slate-100">
                <img
                  src={resolveGaleriImage(activeActivityModal.image)}
                  alt={activeActivityModal.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setActiveActivityModal(null)}
                  aria-label="Tutup modal"
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#1f1d6b] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {formatActivityDate(activeActivityModal.dateStr)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${getCategoryBadgeClasses(
                      activeActivityModal.category
                    )}`}
                  >
                    {activeActivityModal.category}
                  </span>
                </div>
                {!activeActivityModal.image && (
                  <button
                    onClick={() => setActiveActivityModal(null)}
                    aria-label="Tutup modal"
                    className="p-1 rounded-lg text-gray-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-[#1f1d6b] leading-snug">
                {activeActivityModal.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                {activeActivityModal.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-cyan-600" />
                    <span>{activeActivityModal.location}</span>
                  </span>
                )}
                {activeActivityModal.participants && (
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} className="text-cyan-600" />
                    <span>{activeActivityModal.participants}</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
                {activeActivityModal.description}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                {activeActivityModal.reportUrl && (
                  <a
                    href={activeActivityModal.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <span>Buka Album / Laporan Penuh</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveActivityModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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