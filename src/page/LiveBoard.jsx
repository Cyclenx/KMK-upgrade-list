import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Radio,
  ShieldCheck,
  Pin,
  Copy,
  Download,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { collection, doc, setDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import LogoJppKMK from "../logo kmk jpp.jpeg";

export const DEFAULT_KAFE_LIST = [
  {
    id: "kafe_a",
    tajuk: "Status Cafe A (Blok Seri Palas)",
    status: "Buka",
    tarikh_buka: "-",
    sebab: "Beroperasi seperti biasa dari 7:00 pagi hingga 10:00 malam.",
    masa: "Dikemas kini hari ini",
    susunan: 1,
  },
  {
    id: "kafe_b",
    tajuk: "Status Cafe B (Blok Seri Temin)",
    status: "Ditutup",
    tarikh_buka: "16 November 2026 (Isnin)",
    sebab: "Kerja-kerja penyelenggaraan bekalan air dan pembersihan berkala dapur.",
    masa: "Dikemas kini hari ini",
    susunan: 2,
  },
  {
    id: "kafe_c",
    tajuk: "Status Cafe C (Blok Seri Laka)",
    status: "Buka",
    tarikh_buka: "-",
    sebab: "Semua gerai makanan dan minuman dibuka untuk pelajar & staf.",
    masa: "Dikemas kini hari ini",
    susunan: 3,
  },
];

const DEFAULT_TIMELINE_LIST = [
  {
    id: "sample_1",
    tajuk: "Bekalan Air Blok Kediaman Kembali Pulih",
    status: "Selesai",
    sebab: "Tekanan air di semua aras blok kediaman telah stabil dan boleh digunakan seperti biasa.",
    masa: "10:45 AM",
    createdAtMs: 3,
  },
  {
    id: "sample_2",
    tajuk: "Pendaftaran Kokurikulum Minggu Ini",
    status: "Sedang Berlangsung",
    sebab: "Pelajar diminta melengkapkan pengesahan kehadiran kelab masing-masing sebelum jam 5:00 petang.",
    masa: "09:30 AM",
    createdAtMs: 2,
  },
  {
    id: "sample_3",
    tajuk: "Penutupan Sementara Cafe B (Blok Seri Temin)",
    status: "Makluman",
    sebab: "Pelajar sekitar Kolej Kediaman digalakkan menggunakan kemudahan di Cafe A (Blok Seri Palas) atau Cafe C (Blok Seri Laka) buat sementara waktu.",
    masa: "08:00 AM",
    createdAtMs: 1,
  },
];

/* ------------------------------------------------------------------ */
/* Pembantu dikongsi (digunakan juga oleh Admin.jsx)                   */
/* ------------------------------------------------------------------ */

// #20: Penunjuk masa relatif dalam Bahasa Melayu
export function formatRelativeTime(createdAtMs, now = Date.now()) {
  const ms = Number(createdAtMs);
  // Abaikan data contoh / nilai tidak sah (bukan cap masa sebenar)
  if (!ms || ms < 1e11) return "";

  const diffSec = Math.floor((now - ms) / 1000);
  if (diffSec < 60) return "Baru sebentar tadi";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} bulan lalu`;

  return `${Math.floor(diffMonth / 12)} tahun lalu`;
}

// Masa efektif sesuatu item timeline (ikut jadual terbitan jika ada)
export const getTimelineEffectiveMs = (entry) =>
  Number(entry?.publishAtMs) || Number(entry?.createdAtMs) || 0;

// #13 & #14: "scheduled" | "expired" | "active"
export function getTimelineStatus(entry, now = Date.now()) {
  if (entry?.publishAtMs && now < entry.publishAtMs) return "scheduled";
  if (entry?.expireAtMs && now >= entry.expireAtMs) return "expired";
  return "active";
}

// #12: Item disemat sentiasa di atas, kemudian terbaharu dahulu
export function sortTimeline(items) {
  return [...items].sort((a, b) => {
    const pinDiff = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
    if (pinDiff !== 0) return pinDiff;
    return getTimelineEffectiveMs(b) - getTimelineEffectiveMs(a);
  });
}

export function getVisibleTimeline(items, now = Date.now()) {
  return sortTimeline(
    items.filter((item) => getTimelineStatus(item, now) === "active")
  );
}

const kafeShortLabel = (kafe, idx) => {
  const match = (kafe?.tajuk || "").match(/(?:cafe|kafe)\s+[A-Z]\b/i);
  if (match) {
    const raw = match[0].replace(/\s+/g, " ");
    return raw.charAt(0).toUpperCase() + raw.slice(1, -1) + raw.slice(-1).toUpperCase();
  }
  return kafe?.tajuk || `Cafe ${String.fromCharCode(65 + idx)}`;
};

const kafeBlockName = (kafe) => {
  const match = (kafe?.tajuk || "").match(/\(([^)]+)\)/);
  return match ? match[1] : "";
};

const isKafeClosed = (kafe) =>
  (kafe?.status || "").trim().toLowerCase() === "ditutup";

const hasValidOpenDate = (kafe) =>
  Boolean(kafe?.tarikh_buka) && kafe.tarikh_buka.trim() !== "-";

// #15: Teks hebahan WhatsApp
export function buildWhatsappText(kafeItems, timelineItems) {
  const nowText = new Date().toLocaleString("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const kafeLines = kafeItems.map((kafe, idx) => {
    const label = kafeShortLabel(kafe, idx);
    const status = (kafe.status || "Buka").trim();
    const extra =
      isKafeClosed(kafe) && hasValidOpenDate(kafe)
        ? ` (Buka: ${kafe.tarikh_buka})`
        : "";
    return `• ${label}: ${status}${extra}`;
  });

  const timelineLines = timelineItems.map((item) =>
    item.sebab ? `• ${item.tajuk} - ${item.sebab}` : `• ${item.tajuk}`
  );

  return [
    "*📢 HEBAHAN RASMI JPP KMK*",
    `_Kemas kini: ${nowText}_`,
    "",
    "*🍽️ STATUS KAFE:*",
    ...(kafeLines.length ? kafeLines : ["• Tiada maklumat"]),
    "",
    "*📌 MAKLUMAN TERKINI:*",
    ...(timelineLines.length ? timelineLines : ["• Tiada makluman terkini"]),
    "",
    "🌐 Semak masa nyata: https://jppkmk.com/live-board",
  ].join("\n");
}

export async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("Clipboard API tidak tersedia");
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

/* ---------------- #16: Penjana Poster Instagram Story ---------------- */

const POSTER_W = 1080;
const POSTER_H = 1920;

const loadImageSafe = (src) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

function posterRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth) {
  let value = String(text || "");
  if (ctx.measureText(value).width <= maxWidth) return value;
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value.trimEnd()}…`;
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    trimmed[maxLines - 1] = fitText(
      ctx,
      `${trimmed[maxLines - 1]} ${lines.slice(maxLines).join(" ")}`,
      maxWidth
    );
    return trimmed;
  }
  return lines;
}

export async function generatePosterDataUrl(kafeItems, timelineItems) {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_W;
  canvas.height = POSTER_H;
  const ctx = canvas.getContext("2d");
  const FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  // Latar belakang
  const bg = ctx.createLinearGradient(0, 0, 0, POSTER_H);
  bg.addColorStop(0, "#1f1d6b");
  bg.addColorStop(1, "#0c0a38");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, POSTER_W, POSTER_H);

  ctx.fillStyle = "rgba(34, 211, 238, 0.10)";
  ctx.beginPath();
  ctx.arc(POSTER_W - 60, 120, 340, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, POSTER_H - 120, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(0, 0, POSTER_W, 14);

  // Logo
  const logo = await loadImageSafe(LogoJppKMK);
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  posterRoundRect(ctx, 80, 80, 210, 210, 36);
  ctx.fill();
  if (logo) {
    const ratio = Math.min(170 / logo.width, 170 / logo.height);
    const lw = logo.width * ratio;
    const lh = logo.height * ratio;
    ctx.drawImage(logo, 80 + (210 - lw) / 2, 80 + (210 - lh) / 2, lw, lh);
  }

  // Tajuk
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#22d3ee";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("HEBAHAN RASMI", 330, 150);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 92px ${FONT}`;
  ctx.fillText("JPP KMK", 330, 240);
  ctx.fillStyle = "#c7d2fe";
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText("Kolej Matrikulasi Kedah", 330, 285);

  // Lencana LIVE
  ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
  posterRoundRect(ctx, 80, 340, 330, 70, 35);
  ctx.fill();
  ctx.strokeStyle = "rgba(248, 113, 113, 0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(125, 375, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fecaca";
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText("LIVE BOARD", 155, 387);

  const nowText = new Date().toLocaleString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  ctx.fillStyle = "#a5b4fc";
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(`Kemas kini: ${nowText}`, 80, 470);

  // Seksyen: Status Kafe
  ctx.fillStyle = "#22d3ee";
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText("STATUS KAFE", 80, 560);
  ctx.fillRect(80, 578, 120, 6);

  const kafeToShow = kafeItems.slice(0, 3);
  kafeToShow.forEach((kafe, idx) => {
    const x = 80;
    const y = 616 + idx * 214;
    const w = 920;
    const h = 190;
    const closed = isKafeClosed(kafe);

    ctx.fillStyle = closed
      ? "rgba(239, 68, 68, 0.18)"
      : "rgba(16, 185, 129, 0.16)";
    posterRoundRect(ctx, x, y, w, h, 32);
    ctx.fill();
    ctx.strokeStyle = closed ? "#f87171" : "#34d399";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 46px ${FONT}`;
    ctx.fillText(kafeShortLabel(kafe, idx), x + 44, y + 74);

    ctx.fillStyle = "#c7d2fe";
    ctx.font = `500 32px ${FONT}`;
    ctx.fillText(fitText(ctx, kafeBlockName(kafe), 520), x + 44, y + 122);

    if (closed) {
      ctx.fillStyle = "#fecaca";
      ctx.font = `600 28px ${FONT}`;
      ctx.fillText(
        fitText(
          ctx,
          hasValidOpenDate(kafe)
            ? `Buka semula: ${kafe.tarikh_buka}`
            : "Buka semula: akan dimaklumkan",
          w - 88
        ),
        x + 44,
        y + 164
      );
    }

    const pillW = 220;
    const pillX = x + w - pillW - 40;
    ctx.fillStyle = closed ? "#dc2626" : "#059669";
    posterRoundRect(ctx, pillX, y + 40, pillW, 70, 35);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 34px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(closed ? "DITUTUP" : "BUKA", pillX + pillW / 2, y + 87);
    ctx.textAlign = "left";
  });

  // Seksyen: Makluman Terkini
  ctx.fillStyle = "#22d3ee";
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText("MAKLUMAN TERKINI", 80, 1330);
  ctx.fillRect(80, 1348, 120, 6);

  const infoToShow = timelineItems.slice(0, 2);
  if (infoToShow.length === 0) {
    ctx.fillStyle = "#a5b4fc";
    ctx.font = `500 32px ${FONT}`;
    ctx.fillText("Tiada makluman terkini buat masa ini.", 80, 1420);
  }
  infoToShow.forEach((item, idx) => {
    const x = 80;
    const y = 1386 + idx * 214;
    const w = 920;
    const h = 190;

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    posterRoundRect(ctx, x, y, w, h, 32);
    ctx.fill();
    ctx.strokeStyle = item.isPinned ? "#fbbf24" : "rgba(34, 211, 238, 0.55)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = item.isPinned ? "#fbbf24" : "#22d3ee";
    ctx.font = `700 26px ${FONT}`;
    ctx.fillText(
      `${item.isPinned ? "DISEMAT • " : ""}${(item.status || "Makluman").toUpperCase()}${
        item.masa ? ` • ${item.masa}` : ""
      }`,
      x + 44,
      y + 50
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 38px ${FONT}`;
    ctx.fillText(fitText(ctx, item.tajuk, w - 88), x + 44, y + 102);

    ctx.fillStyle = "#c7d2fe";
    ctx.font = `500 28px ${FONT}`;
    wrapLines(ctx, item.sebab, w - 88, 2).forEach((line, lineIdx) => {
      ctx.fillText(line, x + 44, y + 146 + lineIdx * 36);
    });
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#22d3ee";
  ctx.font = `700 36px ${FONT}`;
  ctx.fillText("jppkmk.com/live-board", POSTER_W / 2, 1862);
  ctx.fillStyle = "#818cf8";
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("Semak status masa nyata di portal rasmi JPP KMK", POSTER_W / 2, 1900);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export function PosterModal({ open, onClose, kafeItems, timelineItems }) {
  const [posterUrl, setPosterUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const latestDataRef = useRef({ kafeItems, timelineItems });
  latestDataRef.current = { kafeItems, timelineItems };

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setIsGenerating(true);
    setPosterUrl("");

    generatePosterDataUrl(
      latestDataRef.current.kafeItems,
      latestDataRef.current.timelineItems
    )
      .then((url) => {
        if (!cancelled) {
          setPosterUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((error) => {
        console.error("Gagal menjana poster:", error);
        if (!cancelled) setIsGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratonton Poster Story"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <h3 className="text-sm sm:text-base font-bold text-[#1f1d6b]">
            Poster Story (1080 × 1920)
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center">
          {isGenerating && (
            <p className="text-xs text-gray-500 py-16">Menjana poster...</p>
          )}
          {!isGenerating && posterUrl && (
            <img
              src={posterUrl}
              alt="Pratonton poster Instagram Story JPP KMK"
              className="max-h-[68vh] w-auto rounded-xl shadow-lg"
              style={{ aspectRatio: "9 / 16" }}
            />
          )}
          {!isGenerating && !posterUrl && (
            <p className="text-xs text-red-600 py-16">
              Gagal menjana poster. Sila cuba lagi.
            </p>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200">
          <a
            href={posterUrl || undefined}
            download="poster-story-jppkmk.png"
            aria-disabled={!posterUrl}
            className={`w-full inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors ${
              posterUrl
                ? "bg-[#1f1d6b] hover:bg-indigo-900 text-white cursor-pointer"
                : "bg-slate-200 text-slate-400 pointer-events-none"
            }`}
          >
            <Download size={16} />
            <span>Muat Turun Gambar (PNG)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LiveBoard() {
  const navigate = useNavigate();
  const [kafeItems, setKafeItems] = useState(DEFAULT_KAFE_LIST);
  const [timelineItems, setTimelineItems] = useState(DEFAULT_TIMELINE_LIST);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [now, setNow] = useState(Date.now());
  const [toastMessage, setToastMessage] = useState("");
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  // Segarkan masa relatif, jadual terbitan & tempoh luput setiap 30 saat
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  // Pembilang Pelawat Harian (sekali setiap sesi pelayar)
  useEffect(() => {
    try {
      if (sessionStorage.getItem("kmk_lb_counted")) return;
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const todayYYYYMMDD = `${yyyy}-${mm}-${dd}`;

      sessionStorage.setItem("kmk_lb_counted", "1");
      setDoc(
        doc(db, "liveboard_stats", todayYYYYMMDD),
        { views: increment(1), date: todayYYYYMMDD },
        { merge: true }
      ).catch(() => {
        // Abaikan jika peraturan keselamatan menyekat kiraan tanpa log masuk
      });
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
  }, []);

  const visibleTimeline = useMemo(
    () => getVisibleTimeline(timelineItems, now),
    [timelineItems, now]
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopyWhatsapp = async () => {
    const ok = await copyTextToClipboard(
      buildWhatsappText(kafeItems, visibleTimeline)
    );
    showToast(
      ok
        ? "Hebahan WhatsApp telah disalin ke papan keratan."
        : "Gagal menyalin teks. Sila cuba lagi."
    );
  };

  useEffect(() => {
    const unsubKafe = onSnapshot(
      collection(db, "liveboard_kafe"),
      (snapshot) => {
        setIsRealtimeConnected(true);
        setLastUpdated(new Date());
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          docs.sort((a, b) => (a.susunan || 99) - (b.susunan || 99));
          setKafeItems(docs);
        } else {
          setKafeItems(DEFAULT_KAFE_LIST);
        }
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setIsRealtimeConnected(false);
      }
    );

    const unsubTimeline = onSnapshot(
      collection(db, "liveboard_timeline"),
      (snapshot) => {
        setIsRealtimeConnected(true);
        setLastUpdated(new Date());
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          docs.sort(
            (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)
          );
          setTimelineItems(docs);
        } else {
          setTimelineItems(DEFAULT_TIMELINE_LIST);
        }
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setIsRealtimeConnected(false);
      }
    );

    return () => {
      unsubKafe();
      unsubTimeline();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-16 selection:bg-cyan-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#1f1d6b]/95 backdrop-blur-md text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-md border-b-2 border-cyan-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span>Kembali ke Laman Utama</span>
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Lencana LIVE BOARD Merah Berkelip */}
            <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-400/40 text-red-200 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span>LIVE BOARD</span>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck size={14} className="text-cyan-300" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        {/* Header Ringkas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 mb-2">
              <Radio size={14} />
              <span>Makluman Masa Nyata Kolej</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1f1d6b] tracking-tight">
              Papan Informasi &amp; Status Kafe
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Disambung secara langsung ke pangkalan data • Kemas kini terakhir:{" "}
              <span className="font-semibold text-gray-700">
                {lastUpdated.toLocaleTimeString("ms-MY", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
              isRealtimeConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isRealtimeConnected ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {isRealtimeConnected ? "Masa Nyata Aktif" : "Menyambung..."}
          </span>
        </div>

        {/* Butang Perkongsian: WhatsApp & Poster Story */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8 -mt-3">
          <button
            onClick={handleCopyWhatsapp}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Copy size={15} />
            <span>Salin Hebahan WhatsApp</span>
          </button>
          <button
            onClick={() => setIsPosterOpen(true)}
            className="inline-flex items-center gap-2 bg-[#1f1d6b] hover:bg-indigo-900 text-cyan-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <ImageIcon size={15} />
            <span>Jana Poster Story</span>
          </button>
        </div>

        {/* Grid 2 Bahagian: Kiri (Status Operasi Kafe) & Kanan (Timeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Bahagian Kiri: Status Operasi Kafe */}
          <section className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-cyan-500 pb-2">
              <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <Coffee size={20} className="text-cyan-600" />
                <span>Status Operasi Kafe</span>
              </h2>
              <span className="text-xs font-semibold bg-indigo-50 text-[#1f1d6b] px-2.5 py-0.5 rounded-full border border-indigo-100">
                {kafeItems.length} Kafe
              </span>
            </div>

            <div className="space-y-4">
              {kafeItems.map((kafe, idx) => {
                const statusText = (kafe.status || "Buka").trim();
                const isClosed = statusText.toLowerCase() === "ditutup";
                const isOpen = statusText.toLowerCase() === "buka";

                return (
                  <div
                    key={kafe.id || `${kafe.tajuk}-${idx}`}
                    className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                      isClosed
                        ? "bg-red-50/90 border-red-200"
                        : "bg-white border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className={`text-base sm:text-lg font-bold leading-snug ${
                            isClosed ? "text-red-950" : "text-[#1f1d6b]"
                          }`}
                        >
                          {kafe.tajuk}
                        </h3>
                        {kafe.masa && (
                          <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            <span>{kafe.masa}</span>
                          </p>
                        )}
                      </div>

                      {isClosed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 shrink-0">
                          <AlertTriangle size={12} />
                          <span>Ditutup</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${
                            isOpen
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isOpen && <CheckCircle2 size={12} />}
                          <span>{statusText}</span>
                        </span>
                      )}
                    </div>

                    {isClosed ? (
                      <div className="mt-3.5 rounded-xl bg-white/90 border border-red-200/90 p-3.5 text-xs sm:text-sm space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-red-800">
                          <CalendarClock size={15} className="shrink-0" />
                          <span>
                            Ditutup sehingga:{" "}
                            {kafe.tarikh_buka && kafe.tarikh_buka !== "-"
                              ? kafe.tarikh_buka
                              : "Akan dimaklumkan"}
                          </span>
                        </div>
                        {kafe.sebab && (
                          <p className="text-red-700 leading-relaxed">
                            <span className="font-semibold">Sebab:</span>{" "}
                            {kafe.sebab}
                          </p>
                        )}
                      </div>
                    ) : (
                      kafe.sebab && (
                        <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {kafe.sebab}
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bahagian Kanan: Timeline Perkembangan Semasa */}
          <section className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-cyan-500 pb-2">
              <h2 className="text-[#1f1d6b] text-lg sm:text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <Clock size={20} className="text-cyan-600" />
                <span>Timeline Perkembangan Semasa</span>
              </h2>
              <span className="text-xs font-semibold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200">
                {visibleTimeline.length} Kemas Kini
              </span>
            </div>

            {visibleTimeline.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-gray-500">
                Tiada kemas kini timeline buat masa ini.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7">
                <div className="relative border-l-2 border-cyan-400/70 ml-2.5 pl-6 space-y-7">
                  {visibleTimeline.map((entry, idx) => {
                    const isFirst = idx === 0;
                    const isPinned = Boolean(entry.isPinned);
                    const relativeText = formatRelativeTime(
                      getTimelineEffectiveMs(entry),
                      now
                    );
                    return (
                      <div
                        key={entry.id || `${entry.tajuk}-${idx}`}
                        className="relative"
                      >
                        <span
                          className={`absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                            isPinned
                              ? "bg-amber-500"
                              : isFirst
                              ? "bg-cyan-500"
                              : "bg-[#1f1d6b]"
                          }`}
                        />

                        <div
                          className={
                            isPinned
                              ? "rounded-xl border border-amber-300 bg-amber-50/80 p-3.5 -mt-1"
                              : ""
                          }
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {isPinned && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-amber-900 bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full">
                                <Pin size={10} />
                                <span>DISEMAT</span>
                              </span>
                            )}
                            {entry.masa && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f1d6b] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                <Clock size={11} />
                                <span>{entry.masa}</span>
                              </span>
                            )}
                            {relativeText && (
                              <span className="text-[11px] font-medium text-gray-500">
                                {relativeText}
                              </span>
                            )}
                            {entry.status && (
                              <span className="inline-flex items-center text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                                {entry.status}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                            {entry.tajuk}
                          </h3>
                          {entry.sebab && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                              {entry.sebab}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] bg-[#1f1d6b] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-cyan-400/40">
          {toastMessage}
        </div>
      )}

      <PosterModal
        open={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        kafeItems={kafeItems}
        timelineItems={visibleTimeline}
      />
    </div>
  );
}
