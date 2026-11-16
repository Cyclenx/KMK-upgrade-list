import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

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

export default function LiveBoard() {
  const navigate = useNavigate();
  const [kafeItems, setKafeItems] = useState(DEFAULT_KAFE_LIST);
  const [timelineItems, setTimelineItems] = useState(DEFAULT_TIMELINE_LIST);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
                {timelineItems.length} Kemas Kini
              </span>
            </div>

            {timelineItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-gray-500">
                Tiada kemas kini timeline buat masa ini.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7">
                <div className="relative border-l-2 border-cyan-400/70 ml-2.5 pl-6 space-y-7">
                  {timelineItems.map((entry, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={entry.id || `${entry.tajuk}-${idx}`}
                        className="relative"
                      >
                        <span
                          className={`absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                            isFirst ? "bg-cyan-500" : "bg-[#1f1d6b]"
                          }`}
                        />

                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {entry.masa && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f1d6b] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                              <Clock size={11} />
                              <span>{entry.masa}</span>
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
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
