import React, { useState } from "react";
import {
  User,
  Phone,
  Hash,
  MessageSquareText,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Home,
  Users,
  Info,
  LayoutGrid,
  ChevronDown,
  Globe,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import LogoJppKMK from "../logo kmk jpp.jpeg";

export default function Cadangan() {
  const navigate = useNavigate();

  // State borang
  const [nama, setNama] = useState("");
  const [noMatrix, setNoMatrix] = useState("");
  const [noTel, setNoTel] = useState("");
  const [cadangan, setCadangan] = useState("");

  // State status penghantaran
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // URL Logo Penjuru Atas Kiri
  const logo1_KPM =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/200px-Coat_of_arms_of_Malaysia.svg.png";
  const logo2_KMK = LogoJppKMK;
  const logo3_Tambahan =
    "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=60";

  const handleSend = async (e) => {
    e.preventDefault();

    if (!nama || !noMatrix || !noTel || !cadangan) {
      setStatusMessage({
        type: "error",
        text: "Sila lengkapkan semua maklumat sebelum menghantar.",
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("https://jpp-api.yeke-hub.dev/Hantar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Nama: nama,
          NoMatrix: noMatrix,
          NoTel: noTel,
          Cadangan: cadangan,
        }),
      });

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Cadangan anda telah berjaya dihantar. Terima kasih atas maklum balas!",
        });
        setNama("");
        setNoMatrix("");
        setNoTel("");
        setCadangan("");
      } else {
        throw new Error("Ralat respons pelayan.");
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({
        type: "error",
        text: "Gagal menghantar cadangan. Sila cuba sebentar lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 flex flex-col justify-between">
      {/* Header Korporat (Sama Seperti Halaman Utama) */}
      <header className="bg-[#1f1d6b] text-white shadow-lg sticky top-0 z-50">
        {/* Bar Atas Ringkas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-end items-center gap-6 text-xs text-gray-300 border-b border-white/10">
          <div className="hidden md:flex items-center gap-6">
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
          <div className="flex items-center gap-3">
            <span className="font-semibold text-cyan-400 cursor-pointer">BM</span>
            <span className="text-gray-500">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">EN</span>
            <Globe size={14} className="ml-1 opacity-80" />
          </div>
        </div>

        {/* Bar Navigasi Utama */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
          {/* Tiga Logo KMK & Kementerian */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/40">
              <img
                src={logo1_KPM}
                alt="Logo KPM"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div className="h-6 w-[1px] bg-slate-300" />
              <img
                src={logo2_KMK}
                alt="Logo KMK"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div className="h-6 w-[1px] bg-slate-300" />
              <img
                src={logo3_Tambahan}
                alt="Logo 3"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Navigasi */}
          <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Home size={16} />
              <span>Utama</span>
            </button>

            <button
              onClick={() => navigate("/Cadangan")}
              className="px-3 py-2 text-cyan-400 border-b-2 border-cyan-400 flex items-center gap-1.5 font-semibold"
            >
              <Info size={16} />
              <span>Cadangan</span>
            </button>

            <button
              onClick={() => navigate("/organisasi")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Users size={16} />
              <span>Organisasi</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Banner Sub-Halaman */}
      <div className="bg-gradient-to-r from-[#171457] via-[#1f1d6b] to-[#2a278d] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-cyan-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          <button
            onClick={() => navigate("/")}
            className="self-start mb-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-100 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Laman Utama</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            Suara Mahasiswa & Warga Kolej
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mb-2">
            Portal Cadangan Penambahbaikan
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
            Sumbangkan idea dan pandangan anda untuk memperkasa kualiti pengurusan,
            kemudahan fasiliti, dan ekosistem pembelajaran di Kolej Matrikulasi Kedah.
          </p>
        </div>
      </div>

      {/* Bahagian Borang Utama */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-10 backdrop-blur-lg">
          {/* Mesej Status Notifikasi */}
          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm transition-all ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Nama */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <User size={15} className="text-cyan-600" />
                  <span>Nama Penuh</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Ali bin Abu"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>

              {/* Input No. Matrik */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Hash size={15} className="text-cyan-600" />
                  <span>No. Matrik</span>
                </label>
                <input
                  type="text"
                  value={noMatrix}
                  onChange={(e) => setNoMatrix(e.target.value)}
                  placeholder="Contoh: MS2412345678"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Input No. Telefon */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Phone size={15} className="text-cyan-600" />
                <span>No. Telefon (WhatsApp)</span>
              </label>
              <input
                type="tel"
                value={noTel}
                onChange={(e) => setNoTel(e.target.value)}
                placeholder="Contoh: 012-3456789"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all shadow-inner"
                required
              />
            </div>

            {/* Input Cadangan */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <MessageSquareText size={15} className="text-cyan-600" />
                <span>Cadangan Penambahbaikan</span>
              </label>
              <textarea
                value={cadangan}
                onChange={(e) => setCadangan(e.target.value)}
                placeholder="Tuliskan cadangan anda secara terperinci di sini..."
                rows={5}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all resize-none shadow-inner leading-relaxed"
                required
              />
            </div>

            {/* Butang Hantar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <span className="text-xs text-gray-400">
                * Maklum balas anda dijamin kerahsiaannya oleh pihak pengurusan JPP KMK.
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1f1d6b] hover:bg-[#161452] active:scale-95 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all border border-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Hantar Cadangan</span>
                    <Send size={16} className="text-cyan-400" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Korporat */}
      <footer className="bg-[#1f1d6b] text-white pt-10 pb-6 border-t-4 border-cyan-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-200">
              Kolej Matrikulasi Kedah
            </span>
            <span>|</span>
            <span>Jawatankuasa Perwakilan Pelajar (JPP)</span>
          </div>
          <div>
            © {new Date().getFullYear()} Hak Cipta Terpelihara.
          </div>
        </div>
      </footer>
    </div>
  );
}