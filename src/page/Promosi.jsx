import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  Info,
  Users,
  Calendar,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Plus,
  X,
  MapPin,
  Clock,
  Tag,
  ExternalLink,
  MessageCircle,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Menu,
  ZoomIn,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import LogoJppKMK from "../jppkmklogo.png";

const JURUSAN_LIST = [
  "Sains Fizikal",
  "Sains Hayat",
  "Sains Teknologi",
  "Perakaunan",
  "Sains Komputer",
];

const MENU_CATEGORIES = ["Makanan", "Minuman", "Combo"];

function compressPosterToWebP(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas tidak disokong oleh pelayar ini."));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal memampatkan gambar poster."));
              return;
            }
            resolve(blob);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Fail gambar tidak sah."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca fail gambar."));
    reader.readAsDataURL(file);
  });
}

function buildContactHref(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    return { href: value, isWhatsapp: /wa\.me|whatsapp\.com/i.test(value) };
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 9) {
    const normalized = digits.startsWith("60")
      ? digits
      : digits.startsWith("0")
        ? `6${digits}`
        : `60${digits}`;
    return { href: `https://wa.me/${normalized}`, isWhatsapp: true };
  }
  return { href: `https://${value}`, isWhatsapp: false };
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Promosi() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data promosi diluluskan
  const [promotions, setPromotions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Kawalan tab & penapis
  const [activeJenis, setActiveJenis] = useState("aktiviti");
  const [selectedJurusan, setSelectedJurusan] = useState("Semua Jurusan");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("nearest");

  // Lightbox poster
  const [lightboxItem, setLightboxItem] = useState(null);

  // Modal borang pelajar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [formData, setFormData] = useState({
    jenis: "aktiviti",
    jurusan: "Sains Fizikal",
    tajuk: "",
    tarikh: "",
    masa: "",
    lokasi: "",
    yuran: "",
    penerangan: "",
    namaPenganjur: "",
    hubungan: "",
  });
  const [menuItems, setMenuItems] = useState([
    { kategori: "Makanan", nama: "", harga: "" },
  ]);

  useEffect(() => {
    const q = query(
      collection(db, "promotions"),
      where("status", "==", "approved")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPromotions(docs);
        setLoadingList(false);
      },
      (err) => {
        console.error("Gagal memuatkan promosi:", err);
        setLoadingList(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredPromotions = useMemo(() => {
    const list = promotions.filter((item) => {
      if (item.jenis !== activeJenis) return false;
      if (
        selectedJurusan !== "Semua Jurusan" &&
        item.jurusan !== selectedJurusan
      ) {
        return false;
      }
      if (filterDate && item.tarikh !== filterDate) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === "nearest") {
        const dateA = a.tarikh || "9999-12-31";
        const dateB = b.tarikh || "9999-12-31";
        const cmp = dateA.localeCompare(dateB);
        if (cmp !== 0) return cmp;
      }
      return (b.createdAtMs || 0) - (a.createdAtMs || 0);
    });
  }, [promotions, activeJenis, selectedJurusan, filterDate, sortOrder]);

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPosterFile(null);
      setPosterPreview("");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleAddMenuRow = () => {
    setMenuItems((prev) => [
      ...prev,
      { kategori: "Makanan", nama: "", harga: "" },
    ]);
  };

  const handleRemoveMenuRow = (idx) => {
    setMenuItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
  };

  const handleMenuChange = (idx, field, value) => {
    setMenuItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const resetForm = (jenisDefault = activeJenis) => {
    setFormData({
      jenis: jenisDefault,
      jurusan: "Sains Fizikal",
      tajuk: "",
      tarikh: "",
      masa: "",
      lokasi: "",
      yuran: "",
      penerangan: "",
      namaPenganjur: "",
      hubungan: "",
    });
    setMenuItems([{ kategori: "Makanan", nama: "", harga: "" }]);
    setPosterFile(null);
    setPosterPreview("");
  };

  const handleOpenModal = () => {
    setSubmitStatus(null);
    resetForm(activeJenis);
    setIsModalOpen(true);
  };

  const handleSubmitPromotion = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (
      !formData.tajuk.trim() ||
      !formData.tarikh ||
      !formData.namaPenganjur.trim() ||
      !formData.hubungan.trim()
    ) {
      setSubmitStatus({
        type: "error",
        message: "Sila lengkapkan semua medan wajib bertanda (*).",
      });
      return;
    }

    let cleanedMenu = [];
    if (formData.jenis === "jualan") {
      cleanedMenu = menuItems
        .map((item) => ({
          kategori: item.kategori || "Makanan",
          nama: item.nama.trim(),
          harga: item.harga !== "" ? Number(item.harga).toFixed(2) : "",
        }))
        .filter((item) => item.nama && item.harga !== "");

      if (cleanedMenu.length === 0) {
        setSubmitStatus({
          type: "error",
          message:
            "Sila masukkan sekurang-kurangnya satu item menu/produk jualan.",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      let posterUrl = "";
      let posterPath = "";

      if (posterFile) {
        const compressedBlob = await compressPosterToWebP(
          posterFile,
          1200,
          0.82
        );
        const safeName = posterFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        posterPath = `promotions_posters/${Date.now()}_${safeName}.webp`;
        const storageRef = ref(storage, posterPath);
        await uploadBytes(storageRef, compressedBlob, {
          contentType: "image/webp",
        });
        posterUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "promotions"), {
        jenis: formData.jenis,
        jurusan: formData.jurusan,
        tajuk: formData.tajuk.trim(),
        tarikh: formData.tarikh,
        masa: formData.masa.trim(),
        lokasi: formData.lokasi.trim(),
        yuran: formData.jenis === "aktiviti" ? formData.yuran.trim() : "",
        penerangan:
          formData.jenis === "aktiviti" ? formData.penerangan.trim() : "",
        menuItems: formData.jenis === "jualan" ? cleanedMenu : [],
        namaPenganjur: formData.namaPenganjur.trim(),
        hubungan: formData.hubungan.trim(),
        posterUrl,
        posterPath,
        status: "pending",
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      });

      setSubmitStatus({
        type: "success",
        message:
          "Promosi anda telah berjaya dihantar dan kini menunggu kelulusan Admin/Developer sebelum dipaparkan secara umum.",
      });
      resetForm(formData.jenis);
    } catch (err) {
      console.error("Gagal menghantar promosi:", err);
      setSubmitStatus({
        type: "error",
        message:
          err?.message ||
          "Ralat berlaku semasa menghantar promosi. Sila cuba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Bar Navigasi Utama */}
      <header className="sticky top-0 z-40 bg-[#1f1d6b] text-white shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={LogoJppKMK}
              alt="Logo JPP KMK"
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 bg-white"
            />
            <div>
              <span className="text-sm sm:text-base font-extrabold tracking-tight block leading-none">
                PORTAL JPP KMK
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold tracking-widest uppercase">
                Kolej Matrikulasi Kedah
              </span>
            </div>
          </div>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Home size={16} />
              <span>Utama</span>
            </button>
            <button
              onClick={() => navigate("/Cadangan")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
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
            <button
              onClick={() => navigate("/takwim")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <Calendar size={16} />
              <span>Takwim</span>
            </button>
            <button
              onClick={() => navigate("/promosi")}
              className="px-3 py-2 text-cyan-400 border-b-2 border-cyan-400 flex items-center gap-1.5 font-semibold"
            >
              <Megaphone size={16} />
              <span>Promosi</span>
            </button>
            <button
              onClick={() => navigate("/live-board")}
              className="px-3 py-2 text-gray-200 hover:text-cyan-300 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span>Live Board</span>
            </button>
          </nav>

          {/* Hamburger Mobile */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg bg-white/10 border border-white/15 text-white"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-950 border-t border-white/10 px-4 py-4 space-y-2 text-sm">
            {[
              { label: "Utama", path: "/", icon: Home },
              { label: "Cadangan", path: "/Cadangan", icon: Info },
              { label: "Organisasi", path: "/organisasi", icon: Users },
              { label: "Takwim", path: "/takwim", icon: Calendar },
              {
                label: "Promosi",
                path: "/promosi",
                icon: Megaphone,
                active: true,
              },
              { label: "Live Board", path: "/live-board", icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold ${
                    item.active
                      ? "bg-white/10 text-cyan-300"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#171457] via-[#1f1d6b] to-[#0f172a] text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-cyan-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/15 border border-cyan-300/30 px-3 py-1 rounded-full mb-3">
              <Megaphone size={13} />
              <span>Hab Komuniti Pelajar KMK</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ruang Promosi Aktiviti &amp; Jualan Pelajar KMK
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-2.5 leading-relaxed">
              Terokai program pelajar, bengkel jurusan dan gerai jualan mahasiswa di Kolej Matrikulasi Kedah, atau serahkan promosi anda untuk disiarkan di portal.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-[#0f172a] font-extrabold text-sm px-5 py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>+ Hantar Promosi Anda</span>
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Suis Interaktif 2 Seksyen Utama di Bahagian Paling Atas */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveJenis("aktiviti")}
            className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl border-2 text-xs sm:text-base font-extrabold transition-all cursor-pointer ${
              activeJenis === "aktiviti"
                ? "bg-[#1f1d6b] border-[#1f1d6b] text-cyan-300 shadow-md"
                : "bg-white border-slate-200 text-gray-700 hover:border-cyan-400"
            }`}
          >
            <Calendar size={20} className="shrink-0" />
            <span>Aktiviti &amp; Program</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveJenis("jualan")}
            className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl border-2 text-xs sm:text-base font-extrabold transition-all cursor-pointer ${
              activeJenis === "jualan"
                ? "bg-[#1f1d6b] border-[#1f1d6b] text-cyan-300 shadow-md"
                : "bg-white border-slate-200 text-gray-700 hover:border-cyan-400"
            }`}
          >
            <ShoppingBag size={20} className="shrink-0" />
            <span>Jualan Pelajar</span>
          </button>
        </div>

        {/* Bar Penapis 5 Jurusan & Tarikh */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            {["Semua Jurusan", ...JURUSAN_LIST].map((jurusan) => {
              const active = selectedJurusan === jurusan;
              return (
                <button
                  key={jurusan}
                  type="button"
                  onClick={() => setSelectedJurusan(jurusan)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  {jurusan}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-tarikh"
                className="text-xs font-bold text-gray-600"
              >
                Tapis Tarikh:
              </label>
              <input
                id="filter-tarikh"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-gray-800 bg-slate-50"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate("")}
                  className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
                >
                  Reset Tarikh
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "nearest" ? "latest" : "nearest"
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f1d6b] bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
            >
              <ArrowUpDown size={14} />
              <span>
                Susunan:{" "}
                {sortOrder === "nearest"
                  ? "Tarikh Terdekat"
                  : "Terbaru Dihantar"}
              </span>
            </button>
          </div>
        </div>

        {/* Senarai Kad Promosi */}
        {loadingList ? (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-[#1f1d6b]" />
            <span className="text-sm font-medium">
              Memuatkan senarai promosi...
            </span>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
            <p className="text-base font-bold text-[#1f1d6b]">
              Tiada{" "}
              {activeJenis === "aktiviti"
                ? "aktiviti atau program"
                : "jualan pelajar"}{" "}
              ditemui buat masa ini.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Cuba tukar penapis jurusan/tarikh atau jadilah yang pertama menghantar promosi anda!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((item) => {
              const contact = buildContactHref(item.hubungan);
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
                >
                  {/* Poster Multi-Ratio Anti-Crop (Pilihan) */}
                  {item.posterUrl && (
                    <div
                      onClick={() => setLightboxItem(item)}
                      className="relative h-64 w-full overflow-hidden bg-slate-900 rounded-t-xl cursor-pointer group"
                    >
                      <img
                        src={item.posterUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-45"
                      />
                      <img
                        src={item.posterUrl}
                        alt={item.tajuk}
                        className="relative z-10 w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2.5 right-2.5 z-20 inline-flex items-center gap-1 bg-black/65 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full opacity-90 group-hover:opacity-100">
                        <ZoomIn size={12} />
                        <span>Lihat Penuh</span>
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-[#1f1d6b] border border-indigo-200">
                          {item.jurusan}
                        </span>
                        <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                          {formatDisplayDate(item.tarikh)}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-gray-900 leading-snug">
                        {item.tajuk}
                      </h3>

                      <div className="space-y-1.5 text-xs text-gray-600">
                        {item.masa && (
                          <div className="flex items-center gap-2">
                            <Clock
                              size={14}
                              className="text-cyan-600 shrink-0"
                            />
                            <span>{item.masa}</span>
                          </div>
                        )}
                        {item.lokasi && (
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={14}
                              className="text-cyan-600 shrink-0"
                            />
                            <span>{item.lokasi}</span>
                          </div>
                        )}
                        {item.jenis === "aktiviti" && item.yuran && (
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-cyan-600 shrink-0" />
                            <span className="font-semibold text-gray-800">
                              Yuran / Syarat: {item.yuran}
                            </span>
                          </div>
                        )}
                      </div>

                      {item.jenis === "aktiviti" && item.penerangan && (
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {item.penerangan}
                        </p>
                      )}

                      {item.jenis === "jualan" &&
                        Array.isArray(item.menuItems) &&
                        item.menuItems.length > 0 && (
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-gray-600 font-bold">
                                <tr>
                                  <th className="px-3 py-2">Kategori</th>
                                  <th className="px-3 py-2">Produk</th>
                                  <th className="px-3 py-2 text-right">
                                    Harga
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {item.menuItems.map((m, idx) => (
                                  <tr key={idx} className="bg-white">
                                    <td className="px-3 py-2">
                                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-gray-700">
                                        {m.kategori}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-gray-800">
                                      {m.nama}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-[#1f1d6b] whitespace-nowrap">
                                      RM {Number(m.harga || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <p className="text-xs text-gray-500">
                        {item.jenis === "aktiviti" ? "Penganjur" : "Penjual"}:{" "}
                        <strong className="text-gray-800">
                          {item.namaPenganjur}
                        </strong>
                      </p>

                      {contact && (
                        <a
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                            contact.isWhatsapp
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-[#1f1d6b] hover:bg-indigo-900 text-cyan-300"
                          }`}
                        >
                          {contact.isWhatsapp ? (
                            <>
                              <MessageCircle size={15} />
                              <span>
                                {item.jenis === "jualan"
                                  ? "WhatsApp Penjual"
                                  : "Hubungi via WhatsApp"}
                              </span>
                            </>
                          ) : (
                            <>
                              <ExternalLink size={15} />
                              <span>Pautan Pendaftaran</span>
                            </>
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Lightbox Skrin Penuh */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxItem(null)}
            aria-label="Tutup poster"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxItem.posterUrl}
            alt={lightboxItem.tajuk}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Modal Borang Penghantaran Pelajar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-[#1f1d6b] text-white px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold">
                  Hantar Promosi Anda
                </h2>
                <p className="text-[11px] text-cyan-300">
                  Semua kiriman akan disemak oleh Admin/Developer sebelum dipaparkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitPromotion}
              className="p-5 sm:p-6 space-y-4"
            >
              {submitStatus && (
                <div
                  role="alert"
                  className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
                    submitStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                  ) : (
                    <AlertCircle
                      size={18}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              {/* Jenis Promosi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Jenis Promosi *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, jenis: "aktiviti" }))
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      formData.jenis === "aktiviti"
                        ? "bg-[#1f1d6b] border-[#1f1d6b] text-cyan-300"
                        : "bg-slate-50 border-slate-200 text-gray-700"
                    }`}
                  >
                    Aktiviti / Program
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, jenis: "jualan" }))
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      formData.jenis === "jualan"
                        ? "bg-[#1f1d6b] border-[#1f1d6b] text-cyan-300"
                        : "bg-slate-50 border-slate-200 text-gray-700"
                    }`}
                  >
                    Jualan Pelajar
                  </button>
                </div>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Jurusan Penganjur / Penjual *
                </label>
                <select
                  required
                  value={formData.jurusan}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      jurusan: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-slate-50"
                >
                  {JURUSAN_LIST.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Muat Naik Poster (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Muat Naik Poster (Pilihan / Optional)
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl px-4 py-3 text-xs font-semibold text-gray-600 cursor-pointer bg-slate-50">
                  <Upload size={16} className="text-cyan-600" />
                  <span>
                    {posterFile
                      ? posterFile.name
                      : "Pilih gambar poster (dimampatkan automatik ke WebP)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
                {posterPreview && (
                  <div className="mt-2 relative h-36 w-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={posterPreview}
                      alt="Pratonton poster"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Tajuk Aktiviti / Nama Gerai */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  {formData.jenis === "aktiviti"
                    ? "Tajuk Aktiviti / Program *"
                    : "Nama Gerai / Projek Jualan *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.tajuk}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tajuk: e.target.value }))
                  }
                  placeholder={
                    formData.jenis === "aktiviti"
                      ? "cth: Bengkel Asas Python F2"
                      : "cth: Gerai Nasi Ayam Gepuk P1T1"
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Tarikh & Masa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Tarikh *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tarikh}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tarikh: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Masa
                  </label>
                  <input
                    type="text"
                    value={formData.masa}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, masa: e.target.value }))
                    }
                    placeholder="cth: 8.30 malam - 10.30 malam"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  {formData.jenis === "aktiviti"
                    ? "Lokasi / Tempat"
                    : "Lokasi / Kawasan COD"}
                </label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lokasi: e.target.value }))
                  }
                  placeholder={
                    formData.jenis === "aktiviti"
                      ? "cth: Dewan Kuliah 1 (DK1)"
                      : "cth: Foyer Kafe B / COD Blok Kediaman"
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Medan Khusus Aktiviti atau Jualan */}
              {formData.jenis === "aktiviti" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Yuran / Syarat
                    </label>
                    <input
                      type="text"
                      value={formData.yuran}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          yuran: e.target.value,
                        }))
                      }
                      placeholder="cth: Percuma / RM 3.00 seorang"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                      Penerangan Ringkas
                    </label>
                    <textarea
                      rows={3}
                      value={formData.penerangan}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          penerangan: e.target.value,
                        }))
                      }
                      placeholder="Terangkan objektif, sasaran peserta, dan maklumat penting program..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                      Senarai Menu / Produk (3 Kolum) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMenuRow}
                      className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>+ Tambah Item</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {menuItems.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200"
                      >
                        <select
                          value={row.kategori}
                          onChange={(e) =>
                            handleMenuChange(idx, "kategori", e.target.value)
                          }
                          className="col-span-4 sm:col-span-3 rounded-lg border border-slate-200 px-2 py-2 text-xs bg-white"
                        >
                          {MENU_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Nama Produk (cth: Nasi Ayam Gepuk)"
                          value={row.nama}
                          onChange={(e) =>
                            handleMenuChange(idx, "nama", e.target.value)
                          }
                          className="col-span-5 sm:col-span-5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white"
                        />
                        <input
                          type="number"
                          step="0.10"
                          min="0"
                          placeholder="6.50"
                          value={row.harga}
                          onChange={(e) =>
                            handleMenuChange(idx, "harga", e.target.value)
                          }
                          className="col-span-2 sm:col-span-3 rounded-lg border border-slate-200 px-2.5 py-2 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMenuRow(idx)}
                          disabled={menuItems.length === 1}
                          aria-label="Buang item"
                          className="col-span-1 flex items-center justify-center p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nama Penuh & Kelas / Praktikum */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Nama Penuh &amp; Kelas / Praktikum *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaPenganjur}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      namaPenganjur: e.target.value,
                    }))
                  }
                  placeholder="cth: Hafizhan (P1T1)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* No. Telefon WhatsApp / Pautan Borang */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  No. Telefon WhatsApp / Pautan Borang *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hubungan}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hubungan: e.target.value,
                    }))
                  }
                  placeholder="cth: 0123456789 atau https://forms.gle/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-gray-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[#1f1d6b] hover:bg-indigo-900 disabled:opacity-60 text-cyan-300 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Menghantar...</span>
                    </>
                  ) : (
                    <span>Hantar untuk Kelulusan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
