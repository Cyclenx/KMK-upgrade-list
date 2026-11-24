import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  Radio,
  Calendar,
  Play,
  Pause,
  ChevronDown,
  ArrowDownRight,
  ArrowDownLeft,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router";

const TAKWIM_STATIONS = [
  {
    id: 1,
    date: "3 SEPT",
    title: "CAREER PATH DAY",
    code: "PRD",
    organizer: "Pembimbing Rakan Dinamik (PRD)",
    logo: "/logos/logo-prd.jpg",
    phase: "SEPTEMBER 2026",
    phaseKey: "SEPT 2026",
    info: "Pendedahan laluan kerjaya dan hala tuju pengajian tinggi untuk pelajar KMK.",
  },
  {
    id: 2,
    date: "6 - 16 SEPT",
    title: "KARNIVAL KEUSAHAWANAN KMK",
    code: "KRS",
    organizer: "Kelab Rakan Sukan (KRS)",
    logo: "/logos/logo-krs.jpg",
    phase: "SEPTEMBER 2026",
    phaseKey: "SEPT 2026",
    info: "Karnival jualan dan aktiviti keusahawanan mahasiswa sepanjang 6 hingga 16 September 2026.",
  },
  {
    id: 3,
    date: "10 - 11 SEPT",
    title: "KARNIVAL KERJAYA",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "SEPTEMBER 2026",
    phaseKey: "SEPT 2026",
    info: "Pameran kerjaya dan taklimat bidang profesional bersama agensi jemputan.",
  },
  {
    id: 4,
    date: "24 - 26 SEPT",
    title: "KAKUSMA + LITERASI KEWANGAN",
    code: "PRD",
    organizer: "Pembimbing Rakan Dinamik (PRD)",
    logo: "/logos/logo-prd.jpg",
    phase: "SEPTEMBER 2026",
    phaseKey: "SEPT 2026",
    info: "Program kaunseling kerjaya serta bengkel pengurusan kewangan bijak untuk pelajar.",
  },
  {
    id: 5,
    date: "26 SEPT",
    title: "FRIENDSHIP DAY",
    code: "KRP",
    organizer: "Kelab Rakan Pustaka (KRP)",
    logo: "/logos/logo-krp.jpg",
    phase: "SEPTEMBER 2026",
    phaseKey: "SEPT 2026",
    info: "Program mengeratkan ukhuwah dan perpaduan antara warga pelajar KMK.",
  },
  {
    id: 6,
    date: "10 OKT",
    title: "MENTAL HEALTH DAY",
    code: "PRD",
    organizer: "Pembimbing Rakan Dinamik (PRD)",
    logo: "/logos/logo-prd.jpg",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Sambutan Hari Kesihatan Mental Sedunia bagi memupuk kesedaran kesejahteraan emosi pelajar.",
  },
  {
    id: 7,
    date: "17 - 27 OKT",
    title: "MUET",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Ujian Malaysian University English Test (MUET) Sesi 3 bagi pelajar KMK.",
  },
  {
    id: 8,
    date: "22 OKT",
    title: "ZIARAH PSPM",
    code: "JPP",
    organizer: "Jawatankuasa Perwakilan Pelajar (JPP)",
    logo: "/logo-jpp.png",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Program ziarah kebajikan dan pemberian kata-kata semangat oleh barisan JPP menjelang peperiksaan PSPM.",
  },
  {
    id: 9,
    date: "23 OKT",
    title: "GOTONG ROYONG BLOK KEDIAMAN",
    code: "JKK",
    organizer: "Kolej Kediaman (JKK)",
    logo: "/logos/logo-jkk.jpg",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Aktiviti kebersihan dan keceriaan kawasan blok Seri Temin, Seri Laka, dan Seri Palas.",
  },
  {
    id: 10,
    date: "29 OKT - 5 NOV",
    title: "PSPM",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Peperiksaan Semester Program Matrikulasi (PSPM) Semester 1.",
  },
  {
    id: 11,
    date: "6 - 14 NOV",
    title: "CUTI ANTARA SEMESTER",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "OKTOBER | NOVEMBER 2026",
    phaseKey: "OKT–NOV",
    info: "Cuti pertengahan pengajian antara Semester 1 dan Semester 2.",
  },
  {
    id: 12,
    date: "20 NOV",
    title: "LAWATAN JPP KMK x KMP",
    code: "JPP",
    organizer: "Jawatankuasa Perwakilan Pelajar (JPP)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Lawatan penanda aras dan jaringan kepimpinan antara JPP KMK dan JPP Kolej Matrikulasi Perlis.",
  },
  {
    id: 13,
    date: "21 NOV",
    title: "THROUGH THE LENSE",
    code: "KMK",
    organizer: "Resident Media KMK",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Bengkel dan aktiviti fotografi serta videografi kreatif warga kampus.",
  },
  {
    id: 14,
    date: "27 NOV",
    title: "KHAZANAH WARISAN MADANI",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Program penghayatan seni budaya dan warisan kebangsaan warga kolej.",
  },
  {
    id: 15,
    date: "12 DEC",
    title: "COLOUR RUN",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Larian riadah komuniti kampus bagi menggalakkan gaya hidup sihat.",
  },
  {
    id: 16,
    date: "13 DEC",
    title: "KKA BRAINIAC ARENA",
    code: "KKA",
    organizer: "Ketua Kecemerlangan Akademik (KKA)",
    logo: "/logos/logo-kka.jpg",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Pertandingan kuiz dan cabaran minda akademik anjuran Ketua Kecemerlangan Akademik.",
  },
  {
    id: 17,
    date: "18 DEC",
    title: "SKILL BANK",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Bengkel pembangunan kemahiran insaniah dan teknikal pelajar.",
  },
  {
    id: 18,
    date: "25 DEC",
    title: "HARI KRISMAS",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Cuti umum sempena sambutan Hari Krismas.",
  },
  {
    id: 19,
    date: "26 DEC - 2 JAN",
    title: "CUTI KHAS SEMESTER 1",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "NOVEMBER | DECEMBER 2026",
    phaseKey: "NOV–DIS",
    info: "Cuti khas hujung tahun sebelum menyambung sesi kuliah baharu.",
  },
  {
    id: 20,
    date: "14 - 15 JAN",
    title: "MAHABBAH FEST",
    code: "SIC",
    organizer: "Student Islamic Council (SIC)",
    logo: "/logos/logo-sic.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Festival kerohanian, forum perdana, dan aktiviti dakwah anjuran Student Islamic Council.",
  },
  {
    id: 21,
    date: "17 JAN",
    title: "KKA RESEARCH SHOWCASE",
    code: "KKA",
    organizer: "Ketua Kecemerlangan Akademik (KKA)",
    logo: "/logos/logo-kka.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Pameran penyelidikan dan pembentangan inovasi akademik pelajar KMK.",
  },
  {
    id: 22,
    date: "21 JAN",
    title: "LAWATAN JPP IPTA",
    code: "JPP",
    organizer: "Jawatankuasa Perwakilan Pelajar (JPP)",
    logo: "/logo-jpp.png",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Lawatan pendedahan kampus universiti dan perkongsian kepimpinan bersama MPP IPTA.",
  },
  {
    id: 23,
    date: "21 - 23 JAN",
    title: "PRO MUKMIN / E-SPORT TOURNAMENT",
    code: "KRS",
    organizer: "Kelab Rakan Sukan (KRS)",
    logo: "/logos/logo-krs.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Kejohanan e-sukan dan pembangunan sahsiah belia anjuran Kelab Rakan Sukan.",
  },
  {
    id: 24,
    date: "5 - 13 FEB",
    title: "CUTI PERTENGAHAN SEMESTER",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Cuti pertengahan semester bagi sesi pengajian Semester 2.",
  },
  {
    id: 25,
    date: "14 - 23 FEB",
    title: "TRAVEL LOG RAMADHAN",
    code: "SIC",
    organizer: "Student Islamic Council (SIC)",
    logo: "/logos/logo-sic.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Program pengisian rohani dan penghayatan bulan mulia Ramadhan.",
  },
  {
    id: 26,
    date: "19 FEB",
    title: "EXPLORE WALK",
    code: "KRS",
    organizer: "Kelab Rakan Sukan (KRS)",
    logo: "/logos/logo-krs.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Aktiviti berjalan kaki rekreasi dan eksplorasi sekitar kampus KMK.",
  },
  {
    id: 27,
    date: "24 FEB",
    title: "TADARUS & NUZUL AL-QURAN",
    code: "SIC",
    organizer: "Student Islamic Council (SIC)",
    logo: "/logos/logo-sic.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Majlis khatam tadarus al-Quran dan ceramah sempena memperingati peristiwa Nuzul Al-Quran.",
  },
  {
    id: 28,
    date: "27 FEB",
    title: "IFTAR PERDANA",
    code: "SIC",
    organizer: "Student Islamic Council (SIC)",
    logo: "/logos/logo-sic.jpg",
    phase: "JANUARI | FEBRUARI 2027",
    phaseKey: "JAN–FEB",
    info: "Majlis berbuka puasa perdana menghimpunkan seluruh warga pelajar dan pensyarah.",
  },
  {
    id: 29,
    date: "5 - 13 MAC",
    title: "CUTI KHAS SEMESTER 2",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Cuti khas penggal Semester 2.",
  },
  {
    id: 30,
    date: "18 MAC",
    title: "SAMBUTAN AIDILFITRI",
    code: "JPP",
    organizer: "Jawatankuasa Perwakilan Pelajar (JPP)",
    logo: "/logo-jpp.png",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Majlis sambutan Hari Raya Aidilfitri peringkat kolej anjuran JPP KMK.",
  },
  {
    id: 31,
    date: "6 APRIL",
    title: "ZIARAH PSPM",
    code: "JPP",
    organizer: "Jawatankuasa Perwakilan Pelajar (JPP)",
    logo: "/logo-jpp.png",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Siri jelajah kebajikan barisan JPP menyantuni calon PSPM Semester 2 di blok kediaman.",
  },
  {
    id: 32,
    date: "8 APRIL",
    title: "MAJLIS RESTU ILMU SEM 2",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Majlis memohon keberkatan ilmu dan restu daripada barisan pensyarah sebelum peperiksaan akhir.",
  },
  {
    id: 33,
    date: "9 APRIL",
    title: "GOTONG-ROYONG BLOK KEDIAMAN",
    code: "JKK",
    organizer: "Kolej Kediaman (JKK)",
    logo: "/logos/logo-jkk.jpg",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Gotong-royong pembersihan blok kediaman sebelum minggu peperiksaan akhir.",
  },
  {
    id: 34,
    date: "19 - 26 APRIL",
    title: "PEPERIKSAAN SEMESTER 2",
    code: "KMK",
    organizer: "Kolej Matrikulasi Kedah (KMK)",
    logo: "/logo-jpp.png",
    phase: "MAC | APRIL 2027",
    phaseKey: "MAC–APR",
    info: "Peperiksaan akhir Semester 2 bagi semua pelajar Kolej Matrikulasi Kedah.",
  },
];

const ORG_FILTERS = ["Semua", "JPP", "PRD", "KKA", "KRS", "SIC", "JKK", "KRP", "KMK"];

const PHASE_JUMPS = [
  { key: "SEPT 2026", label: "SEPT 2026", watermark: "SEPT 2026" },
  { key: "OKT–NOV", label: "OKT–NOV", watermark: "OKT • NOV" },
  { key: "NOV–DIS", label: "NOV–DIS", watermark: "NOV • DIS" },
  { key: "JAN–FEB", label: "JAN–FEB", watermark: "JAN • FEB 2027" },
  { key: "MAC–APR", label: "MAC–APR", watermark: "MAC • APR" },
];

const ORG_THEMES = {
  JPP: {
    aurora: "bg-cyan-500/10",
    auroraSecondary: "bg-indigo-600/12",
    accentText: "text-cyan-300",
    badge: "bg-cyan-500/15 text-cyan-200 border-cyan-400/40",
    borderActive: "border-cyan-400/70",
    shadow: "0 0 24px -6px rgba(34, 211, 238, 0.22)",
    beam: "#22d3ee",
    nodeBg: "bg-cyan-400",
  },
  PRD: {
    aurora: "bg-rose-500/10",
    auroraSecondary: "bg-fuchsia-600/10",
    accentText: "text-rose-300",
    badge: "bg-rose-500/15 text-rose-200 border-rose-400/40",
    borderActive: "border-rose-400/70",
    shadow: "0 0 24px -6px rgba(244, 63, 94, 0.22)",
    beam: "#fb7185",
    nodeBg: "bg-rose-400",
  },
  KKA: {
    aurora: "bg-violet-500/10",
    auroraSecondary: "bg-indigo-500/12",
    accentText: "text-violet-300",
    badge: "bg-violet-500/15 text-violet-200 border-violet-400/40",
    borderActive: "border-violet-400/70",
    shadow: "0 0 24px -6px rgba(139, 92, 246, 0.22)",
    beam: "#a78bfa",
    nodeBg: "bg-violet-400",
  },
  KRS: {
    aurora: "bg-amber-500/10",
    auroraSecondary: "bg-orange-600/10",
    accentText: "text-amber-300",
    badge: "bg-amber-500/15 text-amber-200 border-amber-400/40",
    borderActive: "border-amber-400/70",
    shadow: "0 0 24px -6px rgba(245, 158, 11, 0.22)",
    beam: "#fbbf24",
    nodeBg: "bg-amber-400",
  },
  SIC: {
    aurora: "bg-emerald-500/10",
    auroraSecondary: "bg-teal-600/10",
    accentText: "text-emerald-300",
    badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
    borderActive: "border-emerald-400/70",
    shadow: "0 0 24px -6px rgba(16, 185, 129, 0.22)",
    beam: "#34d399",
    nodeBg: "bg-emerald-400",
  },
  JKK: {
    aurora: "bg-teal-500/10",
    auroraSecondary: "bg-cyan-600/10",
    accentText: "text-teal-300",
    badge: "bg-teal-500/15 text-teal-200 border-teal-400/40",
    borderActive: "border-teal-400/70",
    shadow: "0 0 24px -6px rgba(20, 184, 166, 0.22)",
    beam: "#2dd4bf",
    nodeBg: "bg-teal-400",
  },
  KRP: {
    aurora: "bg-sky-500/10",
    auroraSecondary: "bg-blue-600/10",
    accentText: "text-sky-300",
    badge: "bg-sky-500/15 text-sky-200 border-sky-400/40",
    borderActive: "border-sky-400/70",
    shadow: "0 0 24px -6px rgba(56, 189, 248, 0.22)",
    beam: "#38bdf8",
    nodeBg: "bg-sky-400",
  },
  KMK: {
    aurora: "bg-blue-500/10",
    auroraSecondary: "bg-indigo-600/12",
    accentText: "text-blue-300",
    badge: "bg-blue-500/15 text-blue-200 border-blue-400/40",
    borderActive: "border-blue-400/70",
    shadow: "0 0 24px -6px rgba(59, 130, 246, 0.22)",
    beam: "#60a5fa",
    nodeBg: "bg-blue-400",
  },
};

export default function Takwim() {
  const navigate = useNavigate();

  const [selectedOrg, setSelectedOrg] = useState("Semua");
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  // Flowchart container, card refs, and SVG S-curve geometry
  const flowContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const nodeRefs = useRef([]);
  const svgPathRef = useRef(null);
  const [svgData, setSvgData] = useState({
    width: 0,
    height: 0,
    d: "",
    length: 1,
  });

  const filteredStations = useMemo(() => {
    if (selectedOrg === "Semua") return TAKWIM_STATIONS;
    return TAKWIM_STATIONS.filter((s) => s.code === selectedOrg);
  }, [selectedOrg]);

  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(0, filteredStations.length - 1)
  );
  const activeStation =
    filteredStations[safeActiveIndex] || TAKWIM_STATIONS[0];
  const activeTheme = ORG_THEMES[activeStation.code] || ORG_THEMES.JPP;

  // Reset activeIndex on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedOrg]);

  // Measure S-curve SVG path connecting all visible station nodes
  const computeSvgPath = useCallback(() => {
    const container = flowContainerRef.current;
    if (!container || filteredStations.length === 0) return;

    const cRect = container.getBoundingClientRect();
    const points = [];

    for (let i = 0; i < filteredStations.length; i += 1) {
      const nodeEl = nodeRefs.current[i];
      if (!nodeEl) continue;
      const nRect = nodeEl.getBoundingClientRect();
      points.push({
        x: nRect.left - cRect.left + nRect.width / 2,
        y: nRect.top - cRect.top + nRect.height / 2,
      });
    }

    if (points.length < 2) {
      setSvgData({
        width: cRect.width,
        height: cRect.height,
        d: "",
        length: 1,
      });
      return;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }

    setSvgData((prev) => ({
      ...prev,
      width: cRect.width,
      height: cRect.height,
      d,
    }));
  }, [filteredStations]);

  useEffect(() => {
    const raf = requestAnimationFrame(computeSvgPath);
    window.addEventListener("resize", computeSvgPath);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", computeSvgPath);
    };
  }, [computeSvgPath]);

  // Measure total SVG stroke length whenever path `d` updates
  useEffect(() => {
    if (svgPathRef.current && svgData.d) {
      try {
        const len = svgPathRef.current.getTotalLength();
        if (len > 0) {
          setSvgData((prev) =>
            Math.abs(prev.length - len) > 1 ? { ...prev, length: len } : prev
          );
        }
      } catch {
        // ignore
      }
    }
  }, [svgData.d]);

  // Scroll scrubbing + Auto-Focus active station via requestAnimationFrame + getBoundingClientRect
  useEffect(() => {
    let rafId = null;

    const handleScrollUpdate = () => {
      rafId = null;

      const container = flowContainerRef.current;
      if (!container) return;

      const cRect = container.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.48;

      // Compute scroll progress through the flowchart container
      const rawProgress =
        (viewportCenter - cRect.top) / Math.max(1, cRect.height - 120);
      setScrollProgress(Math.max(0, Math.min(1, rawProgress)));

      // Find closest station card to viewport center
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < filteredStations.length; i += 1) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setActiveIndex(bestIdx);
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(handleScrollUpdate);
      }
    };

    handleScrollUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [filteredStations]);

  // Scroll to specific station index
  const scrollToStation = useCallback((idx) => {
    const el = cardRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Jump to first station in a phase
  const handleJumpPhase = (phaseKey) => {
    setAutoPlay(false);
    const targetIdx = filteredStations.findIndex(
      (s) => s.phaseKey === phaseKey
    );
    if (targetIdx !== -1) {
      scrollToStation(targetIdx);
    } else if (selectedOrg !== "Semua") {
      setSelectedOrg("Semua");
      setTimeout(() => {
        const allIdx = TAKWIM_STATIONS.findIndex(
          (s) => s.phaseKey === phaseKey
        );
        if (allIdx !== -1) scrollToStation(allIdx);
      }, 120);
    }
  };

  // Auto-Play Jelajah mode (stops automatically on manual scroll/touch)
  useEffect(() => {
    if (!autoPlay || filteredStations.length <= 1) return;

    const stopOnUserAction = () => setAutoPlay(false);
    window.addEventListener("wheel", stopOnUserAction, { passive: true });
    window.addEventListener("touchstart", stopOnUserAction, { passive: true });

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next >= filteredStations.length) {
          setAutoPlay(false);
          return prev;
        }
        scrollToStation(next);
        return next;
      });
    }, 2600);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("wheel", stopOnUserAction);
      window.removeEventListener("touchstart", stopOnUserAction);
    };
  }, [autoPlay, filteredStations.length, scrollToStation]);

  const progressPercent = Math.round(
    ((safeActiveIndex + 1) / Math.max(1, filteredStations.length)) * 100
  );

  return (
    <div className="bg-[#050811] min-h-screen text-slate-100 relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#050811]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1 shrink-0"
              />
              <span>Laman Utama</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/organisasi")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              <Users size={13} className="text-cyan-400" />
              <span>Organisasi</span>
            </button>
            <button
              onClick={() => navigate("/live-board")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              <Radio size={13} className="text-red-400" />
              <span>Live Board</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header & Bar Kawalan Interaktif */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-widest mb-3">
              <Sparkles size={13} />
              <span>Peta Alir Interaktif Sesi 2026/2027</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Takwim Badan Kepimpinan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                KMK
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Jelajahi 34 stesen program rasmi Kolej Matrikulasi Kedah secara
              berurutan dari September 2026 hingga April 2027. Tatal atau klik
              mana-mana stesen untuk melihat perincian di pentas utama.
            </p>
          </div>

          {/* Butang Auto-Play Jelajah */}
          <button
            onClick={() => setAutoPlay((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer self-start lg:self-auto ${
              autoPlay
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                : "bg-white/5 hover:bg-white/10 text-cyan-300 border-cyan-400/40"
            }`}
          >
            {autoPlay ? <Pause size={15} /> : <Play size={15} />}
            <span>{autoPlay ? "Hentikan Jelajah" : "Auto-Play Jelajah"}</span>
          </button>
        </div>

        {/* Bar Kawalan: Penapis Badan Kepimpinan & Lompat Fasa Bulan */}
        <div className="mt-7 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-3.5">
          {/* Penapis Badan */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
              Badan:
            </span>
            {ORG_FILTERS.map((code) => {
              const active = selectedOrg === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setAutoPlay(false);
                    setSelectedOrg(code);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    active
                      ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.4)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>

          {/* Lompat Fasa Bulan */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
              Lompat Fasa:
            </span>
            {PHASE_JUMPS.map((phase) => {
              const isCurrentPhase = activeStation.phaseKey === phase.key;
              return (
                <button
                  key={phase.key}
                  onClick={() => handleJumpPhase(phase.key)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all cursor-pointer border ${
                    isCurrentPhase
                      ? "bg-indigo-500/30 text-cyan-200 border-cyan-400/60"
                      : "bg-white/[0.03] text-slate-400 border-white/10 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {phase.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main 2-Column Scrollytelling Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* KOLUM KIRI: Scrollytelling Sticky Stage */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
            <div
              className={`relative rounded-3xl bg-slate-900/95 border p-6 sm:p-8 transition-colors duration-300 ${activeTheme.borderActive}`}
            >
              {/* Holographic Top Accent Line */}
              <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="text-[11px] font-mono font-extrabold tracking-widest uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3 py-1 rounded-full">
                  STESEN {String(activeStation.id).padStart(2, "0")} /{" "}
                  {TAKWIM_STATIONS.length}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${activeTheme.badge}`}
                >
                  {activeStation.code}
                </span>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {activeStation.phase}
              </div>

              {/* Tarikh & Tajuk */}
              <div className="mt-2 flex items-center gap-2 text-cyan-300 text-sm font-extrabold">
                <Calendar size={15} />
                <span>{activeStation.date}</span>
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                {activeStation.title}
              </h2>

              {/* Logo Besar Badan Penganjur */}
              <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-16 h-16 rounded-full bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/20">
                  <img
                    src={activeStation.logo}
                    alt={activeStation.organizer}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo-jpp.png";
                    }}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Badan Penganjur
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white leading-snug">
                    {activeStation.organizer}
                  </p>
                </div>
              </div>

              {/* Penerangan */}
              <p className="mt-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeStation.info}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
                <MapPin size={13} className="text-cyan-400" />
                <span>Kolej Matrikulasi Kedah • Sesi 2026/2027</span>
              </div>

              {/* Bar Kemajuan Peratusan Takwim */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Kemajuan Takwim</span>
                  <span className="font-mono text-cyan-300">
                    {progressPercent}% ({safeActiveIndex + 1}/
                    {filteredStations.length})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* KOLUM KANAN: Peta Alir Berliku S-Curve + Scroll Scrubbing */}
          <section
            ref={flowContainerRef}
            className="lg:col-span-7 relative py-4"
          >
            {/* SVG S-Curve Laluan & Laser Beam Scroll Scrubbing */}
            {svgData.d && (
              <svg
                aria-hidden="true"
                width={svgData.width}
                height={svgData.height}
                className="absolute inset-0 pointer-events-none z-0 overflow-visible"
              >
                {/* Laluan Asas Malap */}
                <path
                  d={svgData.d}
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.16)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
                {/* Garisan Kemajuan Skrol */}
                <path
                  ref={svgPathRef}
                  d={svgData.d}
                  fill="none"
                  stroke={activeTheme.beam}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: svgData.length,
                    strokeDashoffset:
                      svgData.length * (1 - Math.max(0.02, scrollProgress)),
                    transition: "stroke 300ms ease",
                  }}
                />
              </svg>
            )}

            {/* Stesen Berselang-Seli (Ganjil Kiri, Genap Kanan) */}
            <div className="relative z-10 space-y-10 sm:space-y-12">
              {filteredStations.map((station, idx) => {
                const isOdd = idx % 2 === 0; // Stesen 01 (idx 0) di kiri, Stesen 02 (idx 1) di kanan
                const isActive = idx === safeActiveIndex;
                const theme = ORG_THEMES[station.code] || ORG_THEMES.JPP;
                const showPhaseHeader =
                  idx === 0 ||
                  filteredStations[idx - 1].phase !== station.phase;

                return (
                  <div key={station.id} className="space-y-5">
                    {showPhaseHeader && (
                      <div className="flex items-center justify-center">
                        <span className="px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-white/5 border border-white/15 text-cyan-300 backdrop-blur-md">
                          {station.phase}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col sm:flex-row items-center gap-4 ${
                        isOdd ? "sm:justify-start" : "sm:justify-end"
                      }`}
                    >
                      <div
                        ref={(el) => {
                          cardRefs.current[idx] = el;
                        }}
                        onClick={() => {
                          setAutoPlay(false);
                          scrollToStation(idx);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setAutoPlay(false);
                            scrollToStation(idx);
                          }
                        }}
                        className={`relative w-full sm:w-[78%] rounded-2xl border p-5 cursor-pointer transition-colors duration-300 ${
                          isActive
                            ? `bg-slate-900 opacity-100 ${theme.borderActive}`
                            : "bg-slate-900/75 border-white/10 opacity-85 hover:opacity-100"
                        }`}
                      >
                        {/* Titik Nod Bernombor untuk Sambungan SVG */}
                        <div
                          ref={(el) => {
                            nodeRefs.current[idx] = el;
                          }}
                          className={`absolute -top-3.5 ${
                            isOdd ? "left-5 sm:right-5 sm:left-auto" : "left-5"
                          } w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-mono font-black border-2 transition-colors duration-300 ${
                            isActive
                              ? `${theme.nodeBg} text-slate-950 border-white`
                              : "bg-slate-800 text-slate-300 border-slate-600"
                          }`}
                        >
                          {String(station.id).padStart(2, "0")}
                        </div>

                        <div className="flex items-start justify-between gap-3 pt-1">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-xs font-extrabold text-cyan-300">
                                {station.date}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}
                              >
                                {station.code}
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                              {station.title}
                            </h3>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {station.info}
                            </p>
                          </div>

                          <div className="w-10 h-10 rounded-full bg-white p-1 shrink-0 flex items-center justify-center border border-white/20">
                            <img
                              src={station.logo}
                              alt={station.organizer}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/logo-jpp.png";
                              }}
                              className="w-full h-full object-contain rounded-full"
                            />
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate">{station.organizer}</span>
                          {idx < filteredStations.length - 1 && (
                            <span className="text-cyan-400/80 shrink-0 ml-2">
                              {isOdd ? (
                                <ArrowDownRight size={14} />
                              ) : (
                                <ArrowDownLeft size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Penunjuk Arah Aliran Mobile */}
                    {idx < filteredStations.length - 1 && (
                      <div className="flex sm:hidden justify-center text-cyan-400/50 -my-2">
                        <ChevronDown size={18} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
