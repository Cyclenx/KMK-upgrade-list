import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Coffee,
  Image as ImageIcon,
  Users,
  Wrench,
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  auth,
  googleProvider,
  db,
  SUPER_ADMIN_EMAIL,
} from "../firebase";
import { DEFAULT_KAFE_LIST } from "./LiveBoard";

const ALL_TABS = [
  { id: "kafe_timeline", label: "Kafe & Timeline", icon: Coffee },
  { id: "galeri", label: "Galeri", icon: ImageIcon },
  { id: "exco_users", label: "Pengurusan E-mel Exco", icon: Users, superOnly: true },
  { id: "maintenance", label: "Suis Penyelenggaraan", icon: Wrench },
  { id: "logs", label: "Log Aktiviti", icon: Activity },
];

const ASSIGNABLE_MODULES = [
  { id: "kafe_timeline", label: "Kafe & Timeline" },
  { id: "galeri", label: "Galeri KMK" },
  { id: "maintenance", label: "Suis Penyelenggaraan" },
  { id: "logs", label: "Log Aktiviti" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [allowedModules, setAllowedModules] = useState([]);
  const [permLoading, setPermLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("kafe_timeline");
  const [statusBanner, setStatusBanner] = useState("");

  // State: Kafe & Timeline
  const [kafeList, setKafeList] = useState(DEFAULT_KAFE_LIST);
  const [timelineList, setTimelineList] = useState([]);
  const [newTimeline, setNewTimeline] = useState({
    tajuk: "",
    status: "Makluman",
    sebab: "",
    masa: "",
  });

  // State: Galeri
  const [galeriItems, setGaleriItems] = useState([]);
  const [newGaleri, setNewGaleri] = useState({
    tajuk: "",
    kategori: "Aktiviti Kampus",
    penerangan: "",
    image: "",
    driveLink: "",
  });

  // State: Exco Admin Users
  const [excoUsers, setExcoUsers] = useState([]);
  const [newExco, setNewExco] = useState({
    email: "",
    nama: "",
    biro: "",
    modules: ["kafe_timeline"],
  });

  // State: Suis Penyelenggaraan
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: "Portal JPP KMK sedang dalam penyelenggaraan berkala.",
    estimatedTime: "",
  });

  // State: Activity Logs
  const [activityLogs, setActivityLogs] = useState([]);

  const isSuperAdmin =
    Boolean(user?.email) &&
    user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const showToast = (msg) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(""), 4000);
  };

  const recordLog = async (action, details) => {
    if (!user?.email) return;
    try {
      await addDoc(collection(db, "audit_logs"), {
        email: user.email,
        name: user.displayName || user.email,
        action,
        details,
        timestampText: new Date().toLocaleString("ms-MY"),
        createdAtMs: Date.now(),
      });
    } catch {
      // Abaikan jika log gagal ditulis
    }
  };

  // Pantau status log masuk
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setRole(null);
        setAllowedModules([]);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Semak peranan & kebenaran exco dalam koleksi `admin_users`
  useEffect(() => {
    if (authLoading || !user?.email) {
      setRole(null);
      setAllowedModules([]);
      return;
    }

    if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      setRole("super_admin");
      setAllowedModules(ALL_TABS.map((t) => t.id));
      setPermLoading(false);
      return;
    }

    setPermLoading(true);
    const emailKey = user.email.toLowerCase();
    const unsubUserDoc = onSnapshot(
      doc(db, "admin_users", emailKey),
      (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : null;
        const mods = Array.isArray(data?.allowedModules)
          ? data.allowedModules
          : [];
        setAllowedModules(mods);
        setRole(mods.length > 0 ? "exco" : null);
        if (mods.length > 0 && !mods.includes(activeTab)) {
          setActiveTab(mods[0]);
        }
        setPermLoading(false);
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setRole(null);
        setAllowedModules([]);
        setPermLoading(false);
      }
    );

    return () => unsubUserDoc();
  }, [authLoading, user, activeTab]);

  // Langgan data Firestore hanya selepas user & role disahkan
  useEffect(() => {
    if (!user || !role) return;

    const handleListenerError = (error) =>
      console.error("Firestore listener error:", error);

    const unsubKafe = onSnapshot(
      collection(db, "liveboard_kafe"),
      (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (a.susunan || 99) - (b.susunan || 99));
          setKafeList(docs);
        } else {
          setKafeList(DEFAULT_KAFE_LIST);
        }
      },
      handleListenerError
    );

    const unsubTimeline = onSnapshot(
      collection(db, "liveboard_timeline"),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        setTimelineList(docs);
      },
      handleListenerError
    );

    const unsubGaleri = onSnapshot(
      collection(db, "galeri_events"),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        setGaleriItems(docs);
      },
      handleListenerError
    );

    const unsubMaint = onSnapshot(
      doc(db, "system_settings", "maintenance"),
      (snap) => {
        if (snap.exists()) {
          setMaintenance((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      handleListenerError
    );

    const unsubExco =
      role === "super_admin"
        ? onSnapshot(
            collection(db, "admin_users"),
            (snap) => {
              setExcoUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            },
            handleListenerError
          )
        : () => {};

    const unsubLogs =
      role === "super_admin" || allowedModules.includes("logs")
        ? onSnapshot(
            collection(db, "audit_logs"),
            (snap) => {
              const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
              docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
              setActivityLogs(docs.slice(0, 50));
            },
            handleListenerError
          )
        : () => {};

    return () => {
      unsubKafe();
      unsubTimeline();
      unsubGaleri();
      unsubExco();
      unsubMaint();
      unsubLogs();
    };
  }, [user, role, allowedModules]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      showToast(`Log masuk gagal: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Simpan perubahan Kafe
  const handleSaveKafe = async (kafe) => {
    try {
      const masaSekarang = `Dikemas kini ${new Date().toLocaleTimeString("ms-MY", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      await setDoc(doc(db, "liveboard_kafe", kafe.id), {
        ...kafe,
        masa: masaSekarang,
      });
      await recordLog(
        "Kemas Kini Status Kafe",
        `${kafe.tajuk} -> ${kafe.status}`
      );
      showToast(`${kafe.tajuk} berjaya dikemas kini!`);
    } catch (err) {
      showToast(`Ralat menyimpan kafe: ${err.message}`);
    }
  };

  // Tambah item Timeline
  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!newTimeline.tajuk.trim()) return;
    try {
      const masaText =
        newTimeline.masa.trim() ||
        new Date().toLocaleTimeString("ms-MY", {
          hour: "2-digit",
          minute: "2-digit",
        });

      await addDoc(collection(db, "liveboard_timeline"), {
        tajuk: newTimeline.tajuk.trim(),
        status: newTimeline.status.trim() || "Makluman",
        sebab: newTimeline.sebab.trim(),
        masa: masaText,
        createdAtMs: Date.now(),
      });
      await recordLog("Tambah Timeline", newTimeline.tajuk.trim());
      setNewTimeline({ tajuk: "", status: "Makluman", sebab: "", masa: "" });
      showToast("Item timeline baharu telah ditambah.");
    } catch (err) {
      showToast(`Gagal menambah timeline: ${err.message}`);
    }
  };

  const handleDeleteTimeline = async (id, tajuk) => {
    try {
      await deleteDoc(doc(db, "liveboard_timeline", id));
      await recordLog("Padam Timeline", tajuk);
      showToast("Item timeline telah dipadam.");
    } catch (err) {
      showToast(`Gagal memadam timeline: ${err.message}`);
    }
  };

  // Tambah item Galeri
  const handleAddGaleri = async (e) => {
    e.preventDefault();
    if (!newGaleri.tajuk.trim()) return;
    try {
      await addDoc(collection(db, "galeri_events"), {
        ...newGaleri,
        createdAtMs: Date.now(),
      });
      await recordLog("Tambah Galeri KMK", newGaleri.tajuk.trim());
      setNewGaleri({
        tajuk: "",
        kategori: "Aktiviti Kampus",
        penerangan: "",
        image: "",
        driveLink: "",
      });
      showToast("Slide Galeri KMK telah ditambah.");
    } catch (err) {
      showToast(`Gagal menambah galeri: ${err.message}`);
    }
  };

  const handleDeleteGaleri = async (id, tajuk) => {
    try {
      await deleteDoc(doc(db, "galeri_events", id));
      await recordLog("Padam Galeri KMK", tajuk);
      showToast("Slide galeri dipadam.");
    } catch (err) {
      showToast(`Gagal memadam galeri: ${err.message}`);
    }
  };

  // Tambah / Kemas kini akses Exco
  const handleSaveExcoUser = async (e) => {
    e.preventDefault();
    const emailClean = newExco.email.trim().toLowerCase();
    if (!emailClean) return;
    try {
      await setDoc(doc(db, "admin_users", emailClean), {
        email: emailClean,
        nama: newExco.nama.trim(),
        biro: newExco.biro.trim(),
        allowedModules: newExco.modules,
        updatedAtMs: Date.now(),
      });
      await recordLog(
        "Kemas Kini Akses Exco",
        `${emailClean} (${newExco.modules.join(", ")})`
      );
      setNewExco({
        email: "",
        nama: "",
        biro: "",
        modules: ["kafe_timeline"],
      });
      showToast(`Akses untuk ${emailClean} telah disimpan.`);
    } catch (err) {
      showToast(`Gagal menyimpan akses exco: ${err.message}`);
    }
  };

  const handleDeleteExcoUser = async (id) => {
    try {
      await deleteDoc(doc(db, "admin_users", id));
      await recordLog("Batal Akses Exco", id);
      showToast(`Akses ${id} telah dibatalkan.`);
    } catch (err) {
      showToast(`Gagal memadam akses exco: ${err.message}`);
    }
  };

  // Simpan Suis Penyelenggaraan
  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "system_settings", "maintenance"), {
        ...maintenance,
        updatedBy: user.email,
        updatedAtMs: Date.now(),
      });
      await recordLog(
        "Suis Penyelenggaraan",
        maintenance.enabled ? "DIAKTIFKAN" : "DIMATIKAN"
      );
      showToast("Tetapan penyelenggaraan berjaya disimpan.");
    } catch (err) {
      showToast(`Gagal menyimpan tetapan: ${err.message}`);
    }
  };

  const visibleTabs = ALL_TABS.filter((tab) => {
    if (isSuperAdmin) return true;
    if (tab.superOnly) return false;
    return allowedModules.includes(tab.id);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">
      {/* Sticky Top Header */}
      <nav className="sticky top-0 z-50 bg-[#1f1d6b]/95 backdrop-blur-md text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-md border-b-2 border-cyan-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Laman Utama</span>
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => navigate("/live-board")}
              className="text-xs sm:text-sm text-gray-200 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Lihat Live Board
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>{isSuperAdmin ? "Super Admin" : "Panel Admin JPP"}</span>
            </span>

            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Log Keluar</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {statusBanner && (
          <div className="mb-6 rounded-xl bg-cyan-50 border border-cyan-300 px-4 py-3 text-xs sm:text-sm text-cyan-900 font-medium flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={18} className="text-cyan-600 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Keadaan Belum Log Masuk */}
        {authLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-sm text-gray-500">
            Menyemak sesi pengesahan...
          </div>
        ) : !user ? (
          <div className="max-w-md mx-auto mt-14 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1f1d6b] text-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-md">
              <ShieldCheck size={34} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1f1d6b]">
              Portal Pentadbir JPP KMK
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              Log masuk menggunakan akaun Google rasmi untuk menguruskan Live
              Board, Galeri KMK, dan akses Exco.
            </p>
            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full inline-flex items-center justify-center gap-2.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <span>Log Masuk dengan Google</span>
            </button>
          </div>
        ) : permLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-sm text-gray-500">
            Menyemak kebenaran modul untuk {user.email}...
          </div>
        ) : visibleTabs.length === 0 ? (
          <div className="max-w-lg mx-auto mt-12 bg-white rounded-3xl shadow-lg border border-red-200 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Tiada Kebenaran Modul
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Akaun <strong>{user.email}</strong> belum diberikan akses dalam
              koleksi <code>admin_users</code>. Sila hubungi Super Admin (
              <code>{SUPER_ADMIN_EMAIL}</code>) untuk mendapatkan kebenaran.
            </p>
          </div>
        ) : (
          <>
            {/* Info Akaun & Tab Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d6b]">
                  Dashboard Pengurusan JPP KMK
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Log masuk sebagai:{" "}
                  <strong className="text-gray-800">{user.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-200">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#1f1d6b] text-cyan-300 shadow-sm"
                        : "bg-white text-gray-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: KAFE & TIMELINE */}
            {activeTab === "kafe_timeline" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kemas Kini Status Kafe */}
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Status Operasi Kafe (A, B, C)
                  </h2>
                  {kafeList.map((kafe, idx) => (
                    <div
                      key={kafe.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={kafe.tajuk}
                          onChange={(e) => {
                            const updated = [...kafeList];
                            updated[idx] = {
                              ...kafe,
                              tajuk: e.target.value,
                            };
                            setKafeList(updated);
                          }}
                          className="font-bold text-sm sm:text-base text-[#1f1d6b] border-b border-transparent focus:border-cyan-500 focus:outline-none w-full"
                        />
                        <select
                          value={kafe.status}
                          onChange={(e) => {
                            const updated = [...kafeList];
                            updated[idx] = {
                              ...kafe,
                              status: e.target.value,
                            };
                            setKafeList(updated);
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            kafe.status === "Ditutup"
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-300"
                          }`}
                        >
                          <option value="Buka">Buka</option>
                          <option value="Ditutup">Ditutup</option>
                        </select>
                      </div>

                      {kafe.status === "Ditutup" && (
                        <div>
                          <label className="block text-[11px] font-semibold text-red-700 mb-1">
                            Ditutup sehingga (Tarikh Buka Semula):
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 16 November 2026 (Isnin)"
                            value={kafe.tarikh_buka || ""}
                            onChange={(e) => {
                              const updated = [...kafeList];
                              updated[idx] = {
                                ...kafe,
                                tarikh_buka: e.target.value,
                              };
                              setKafeList(updated);
                            }}
                            className="w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs focus:outline-none focus:border-red-400"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Catatan / Sebab:
                        </label>
                        <textarea
                          rows={2}
                          value={kafe.sebab || ""}
                          onChange={(e) => {
                            const updated = [...kafeList];
                            updated[idx] = {
                              ...kafe,
                              sebab: e.target.value,
                            };
                            setKafeList(updated);
                          }}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <button
                        onClick={() => handleSaveKafe(kafe)}
                        className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Simpan Status Kafe</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Urus Timeline */}
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Tambah &amp; Urus Timeline Semasa
                  </h2>

                  <form
                    onSubmit={handleAddTimeline}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Tajuk perkembangan (cth: Bekalan Air Kembali Pulih)"
                      value={newTimeline.tajuk}
                      onChange={(e) =>
                        setNewTimeline({ ...newTimeline, tajuk: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Label Status (cth: Makluman / Selesai)"
                        value={newTimeline.status}
                        onChange={(e) =>
                          setNewTimeline({
                            ...newTimeline,
                            status: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Masa (kosongkan utk masa semasa)"
                        value={newTimeline.masa}
                        onChange={(e) =>
                          setNewTimeline({
                            ...newTimeline,
                            masa: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Huraian lanjut / sebab..."
                      value={newTimeline.sebab}
                      onChange={(e) =>
                        setNewTimeline({ ...newTimeline, sebab: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Terbitkan ke Timeline</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {timelineList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-cyan-700">
                            <span>{item.masa}</span>
                            <span>•</span>
                            <span>{item.status}</span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 mt-0.5">
                            {item.tajuk}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {item.sebab}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteTimeline(item.id, item.tajuk)
                          }
                          aria-label="Padam item timeline"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GALERI */}
            {activeTab === "galeri" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <form
                  onSubmit={handleAddGaleri}
                  className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit"
                >
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Tambah Slide Galeri KMK
                  </h2>
                  <input
                    type="text"
                    required
                    placeholder="Tajuk Acara / Program"
                    value={newGaleri.tajuk}
                    onChange={(e) =>
                      setNewGaleri({ ...newGaleri, tajuk: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Kategori (cth: Aktiviti Kampus / Akademik)"
                    value={newGaleri.kategori}
                    onChange={(e) =>
                      setNewGaleri({ ...newGaleri, kategori: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="URL Gambar atau laluan src/image/..."
                    value={newGaleri.image}
                    onChange={(e) =>
                      setNewGaleri({ ...newGaleri, image: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <input
                    type="url"
                    required
                    placeholder="Pautan Folder Google Drive (https://drive.google.com/...)"
                    value={newGaleri.driveLink}
                    onChange={(e) =>
                      setNewGaleri({ ...newGaleri, driveLink: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <textarea
                    rows={3}
                    placeholder="Penerangan ringkas program..."
                    value={newGaleri.penerangan}
                    onChange={(e) =>
                      setNewGaleri({ ...newGaleri, penerangan: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Simpan ke Galeri</span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Senarai Slide Galeri Firestore ({galeriItems.length})
                  </h2>
                  {galeriItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xs sm:text-sm text-gray-500">
                      Tiada item galeri tambahan dalam Firestore. Laman Utama
                      akan memaparkan senarai galeri lalai sehingga item baharu
                      ditambah di sini.
                    </div>
                  ) : (
                    galeriItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-cyan-700">
                            {item.kategori}
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {item.tajuk}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {item.driveLink}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteGaleri(item.id, item.tajuk)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PENGURUSAN E-MEL EXCO (SUPER ADMIN SAHAJA) */}
            {activeTab === "exco_users" && isSuperAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <form
                  onSubmit={handleSaveExcoUser}
                  className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit"
                >
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Daftar / Kemas Kini Akses Exco
                  </h2>
                  <input
                    type="email"
                    required
                    placeholder="E-mel Google Exco (cth: exco@gmail.com)"
                    value={newExco.email}
                    onChange={(e) =>
                      setNewExco({ ...newExco, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nama Penuh Exco"
                    value={newExco.nama}
                    onChange={(e) =>
                      setNewExco({ ...newExco, nama: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Jawatan / Biro"
                    value={newExco.biro}
                    onChange={(e) =>
                      setNewExco({ ...newExco, biro: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />

                  <div className="pt-1">
                    <p className="text-xs font-bold text-gray-700 mb-2">
                      Modul yang Dibenarkan:
                    </p>
                    <div className="space-y-2">
                      {ASSIGNABLE_MODULES.map((mod) => {
                        const checked = newExco.modules.includes(mod.id);
                        return (
                          <label
                            key={mod.id}
                            className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...newExco.modules, mod.id]
                                  : newExco.modules.filter((m) => m !== mod.id);
                                setNewExco({ ...newExco, modules: next });
                              }}
                              className="rounded text-[#1f1d6b]"
                            />
                            <span>{mod.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Simpan Kebenaran Exco</span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Senarai E-mel Exco Dibenarkan ({excoUsers.length})
                  </h2>
                  {excoUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xs sm:text-sm text-gray-500">
                      Belum ada e-mel exco didaftarkan dalam koleksi{" "}
                      <code>admin_users</code>.
                    </div>
                  ) : (
                    excoUsers.map((exco) => (
                      <div
                        key={exco.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-[#1f1d6b]">
                            {exco.nama || exco.email || exco.id}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {exco.email || exco.id}{" "}
                            {exco.biro ? `• ${exco.biro}` : ""}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(exco.allowedModules || []).map((m) => (
                              <span
                                key={m}
                                className="text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded-full"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteExcoUser(exco.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SUIS PENYELENGGARAAN */}
            {activeTab === "maintenance" && (
              <form
                onSubmit={handleSaveMaintenance}
                className="max-w-xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                  Suis Penyelenggaraan Portal
                </h2>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">
                      Aktifkan Mod Penyelenggaraan
                    </span>
                    <span className="text-xs text-gray-500">
                      Paparkan makluman penyelenggaraan kepada pelawat portal.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(maintenance.enabled)}
                    onChange={(e) =>
                      setMaintenance({
                        ...maintenance,
                        enabled: e.target.checked,
                      })
                    }
                    className="h-5 w-5 accent-[#1f1d6b]"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mesej Penyelenggaraan:
                  </label>
                  <textarea
                    rows={3}
                    value={maintenance.message || ""}
                    onChange={(e) =>
                      setMaintenance({
                        ...maintenance,
                        message: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Anggaran Selesai:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 November 2026, 2:00 PM"
                    value={maintenance.estimatedTime || ""}
                    onChange={(e) =>
                      setMaintenance({
                        ...maintenance,
                        estimatedTime: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-[#1f1d6b] hover:bg-indigo-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Save size={15} />
                  <span>Simpan Tetapan</span>
                </button>
              </form>
            )}

            {/* TAB 5: LOG AKTIVITI */}
            {activeTab === "logs" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                  Log Aktiviti Pentadbir Terkini
                </h2>
                {activityLogs.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Tiada rekod aktiviti lagi.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#1f1d6b]">
                            {log.action}
                          </span>{" "}
                          — <span className="text-gray-700">{log.details}</span>
                        </div>
                        <div className="text-gray-400 shrink-0">
                          {log.email} • {log.timestampText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
