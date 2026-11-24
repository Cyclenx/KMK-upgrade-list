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
  Pin,
  Copy,
  Calendar,  Trash2,
  Save,
  CheckCircle2,
  Lock,
  BellRing,
  Send,
  AlertCircle,
  Loader2,
  Megaphone,
  X,
  ZoomIn,
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
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import {
  auth,
  googleProvider,
  db,
  storage,
  DEVELOPER_EMAILS,
} from "../firebase";
import {
  DEFAULT_KAFE_LIST,
  formatRelativeTime,
  getTimelineEffectiveMs,
  getTimelineStatus,
  sortTimeline,
  getVisibleTimeline,
  buildWhatsappText,
  copyTextToClipboard,
  PosterModal,
} from "./LiveBoard";

const ALL_TABS = [
  { id: "kafe_timeline", label: "Cafe & Timeline", icon: Coffee },
  { id: "notifikasi", label: "Notifikasi", icon: BellRing },
  { id: "promosi", label: "Kelulusan Promosi", icon: Megaphone },
  { id: "galeri", label: "Galeri Album", icon: ImageIcon },
  { id: "aktiviti", label: "Jejak Aktiviti JPP", icon: Calendar },
  { id: "exco_users", label: "Pengurusan E-mel Exco", icon: Users, devOnly: true },
  { id: "maintenance", label: "Suis Penyelenggaraan", icon: Wrench, devOnly: true },
  { id: "logs", label: "Log Aktiviti", icon: Activity },
];

const ASSIGNABLE_MODULES = [
  { id: "kafe_timeline", label: "Cafe & Timeline" },
  { id: "notifikasi", label: "Notifikasi" },
  { id: "promosi", label: "Kelulusan Promosi" },
  { id: "galeri", label: "Galeri Album" },
  { id: "aktiviti", label: "Jejak Aktiviti JPP" },
  { id: "logs", label: "Log Aktiviti" },
];

const FIRESTORE_DOC_LIMIT_BYTES = 1048576; // 1 MB

function calculateBytes(obj) {
  try {
    return new TextEncoder().encode(JSON.stringify(obj ?? {})).length;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  const num = Number(bytes) || 0;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(2)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

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
    isPinned: false,
    publishAt: "",
    expireAt: "",
  });
  const [nowTick, setNowTick] = useState(Date.now());
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  // Segarkan status berjadual / tamat tempoh & masa relatif setiap 30 saat
  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(tick);
  }, []);

  // State: Galeri
  const [galeriItems, setGaleriItems] = useState([]);
  const [galeriInputMode, setGaleriInputMode] = useState("upload");
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [newGaleri, setNewGaleri] = useState({
    tajuk: "",
    kategori: "Aktiviti Kampus",
    penerangan: "",
    image: "",
    driveLink: "",
  });

  // State: Jejak Aktiviti JPP (jpp_activities)
  const [jppActivities, setJppActivities] = useState([]);
  const [isCompressingActivityImg, setIsCompressingActivityImg] =
    useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    dateStr: "",
    category: "Kebajikan",
    location: "",
    participants: "",
    description: "",
    image: "",
    reportUrl: "",
  });

  const handleActivityFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingActivityImg(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setNewActivity((prev) => ({ ...prev, image: compressedDataUrl }));
        setIsCompressingActivityImg(false);
      };
      img.onerror = () => {
        setIsCompressingActivityImg(false);
        showToast("Gagal membaca fail gambar aktiviti.");
      };
      img.src = event.target?.result;
    };
    reader.onerror = () => {
      setIsCompressingActivityImg(false);
      showToast("Gagal memuatkan fail gambar aktiviti.");
    };
    reader.readAsDataURL(file);
  };

  const convertGoogleDriveImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
    const trimmed = rawUrl.trim();
    const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;
    }
    const idParamMatch = trimmed.match(/drive\.google\.com\/.*[?&]id=([^&]+)/i);
    if (idParamMatch && idParamMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1000`;
    }
    return trimmed;
  };

  const handleGaleriFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1000;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setNewGaleri((prev) => ({ ...prev, image: compressedDataUrl }));
        setIsCompressingImage(false);
      };
      img.onerror = () => {
        setIsCompressingImage(false);
        showToast("Gagal membaca fail gambar. Sila pilih fail lain.");
      };
      img.src = event.target?.result;
    };
    reader.onerror = () => {
      setIsCompressingImage(false);
      showToast("Gagal memuatkan fail gambar.");
    };
    reader.readAsDataURL(file);
  };

  // State: Exco Admin Users
  const [excoUsers, setExcoUsers] = useState([]);
  const [newExco, setNewExco] = useState({
    email: "",
    nama: "",
    biro: "",
    role: "exco",
    modules: ["kafe_timeline"],
  });

  // State: Suis Penyelenggaraan & Countdown PSPM
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: "Portal JPP KMK sedang dalam penyelenggaraan berkala.",
    estimatedTime: "",
  });
  const [countdownConfig, setCountdownConfig] = useState({
    title: "Peperiksaan Semester Program Matrikulasi (PSPM)",
    targetDate: "2027-03-15T08:00",
  });
  const [visitorStats, setVisitorStats] = useState({
    todayViews: 0,
    last7DaysViews: 0,
  });

  // State: Activity Logs
  const [activityLogs, setActivityLogs] = useState([]);

  // State: Push Notification
  const [pushForm, setPushForm] = useState({
    title: "",
    body: "",
    url: "/",
  });
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState(null);
  const [sendTimelinePush, setSendTimelinePush] = useState(true);

  // State: Kelulusan Promosi Pelajar
  const [promotionsList, setPromotionsList] = useState([]);
  const [promoLightboxUrl, setPromoLightboxUrl] = useState("");

  const isDeveloper =
    Boolean(user?.email) &&
    DEVELOPER_EMAILS.includes(user.email.toLowerCase());

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

  const handleSendPushNotification = async (e) => {
    e.preventDefault();
    const title = pushForm.title.trim();
    const body = pushForm.body.trim();
    const url = pushForm.url || "/";

    if (!title || !body) {
      setPushResult({
        type: "error",
        message: "Sila isi Tajuk Notifikasi dan Mesej Hebahan terlebih dahulu.",
      });
      return;
    }

    if (!auth.currentUser) {
      setPushResult({
        type: "error",
        message: "Sesi log masuk tidak sah. Sila log masuk semula.",
      });
      return;
    }

    setPushSending(true);
    setPushResult(null);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(
        "https://jppkmk-push.halimhafizhan1059.workers.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ title, body, url }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Gagal menghantar notifikasi (HTTP ${response.status}).`
        );
      }

      const sentCount =
        data?.sentCount ?? data?.successCount ?? data?.sent ?? data?.count;
      const successMsg =
        typeof sentCount === "number"
          ? `Berjaya dihantar kepada ${sentCount} peranti!`
          : data?.message || "Notifikasi berjaya dihantar kepada semua peranti!";

      setPushResult({ type: "success", message: successMsg });
      setPushForm((prev) => ({ ...prev, title: "", body: "" }));
      await recordLog("Hantar Push Notification", `${title} (${url})`);
      showToast(successMsg);
    } catch (err) {
      console.error("Gagal menghantar push notification:", err);
      setPushResult({
        type: "error",
        message:
          err?.message ||
          "Ralat rangkaian berlaku semasa menghantar notifikasi.",
      });
    } finally {
      setPushSending(false);
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

    const emailKey = user.email.toLowerCase();
    if (DEVELOPER_EMAILS.includes(emailKey)) {
      setRole("developer");
      setAllowedModules(ALL_TABS.map((t) => t.id));
      setPermLoading(false);
      return;
    }

    setPermLoading(true);
    const unsubUserDoc = onSnapshot(
      doc(db, "admin_users", emailKey),
      (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : null;
        const isActive = data?.status === "active";

        if (isActive && data?.role === "admin") {
          const allTabIds = ALL_TABS.map((t) => t.id);
          setRole("admin");
          setAllowedModules(allTabIds);
          setActiveTab((prev) =>
            allTabIds.includes(prev) ? prev : allTabIds[0]
          );
        } else if (isActive) {
          const mods = Array.isArray(data?.allowedModules)
            ? data.allowedModules.filter((m) => m !== "exco_users")
            : [];
          setAllowedModules(mods);
          setRole(mods.length > 0 ? "exco" : null);
          if (mods.length > 0) {
            setActiveTab((prev) => (mods.includes(prev) ? prev : mods[0]));
          }
        } else {
          setRole(null);
          setAllowedModules([]);
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
  }, [authLoading, user]);

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

    const unsubPromotions = onSnapshot(
      collection(db, "promotions"),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        setPromotionsList(docs);
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

    const unsubActivities = onSnapshot(
      collection(db, "jpp_activities"),
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => {
          const cmp = String(b.dateStr || "").localeCompare(
            String(a.dateStr || "")
          );
          if (cmp !== 0) return cmp;
          return (b.createdAtMs || 0) - (a.createdAtMs || 0);
        });
        setJppActivities(docs);
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

    const unsubCountdown = onSnapshot(
      doc(db, "system_settings", "countdown"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCountdownConfig((prev) => ({
            title: data.title || prev.title,
            targetDate: (data.targetDate || prev.targetDate).slice(0, 16),
          }));
        }
      },
      handleListenerError
    );

    const unsubStats = onSnapshot(
      collection(db, "liveboard_stats"),
      (snap) => {
        const nowDate = new Date();
        const formatYMD = (dt) => {
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, "0");
          const d = String(dt.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        const todayKey = formatYMD(nowDate);
        const last7Keys = new Set();
        for (let i = 0; i < 7; i += 1) {
          const dt = new Date(nowDate);
          dt.setDate(nowDate.getDate() - i);
          last7Keys.add(formatYMD(dt));
        }

        let todayTotal = 0;
        let weekTotal = 0;
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const dateKey = data.date || docSnap.id;
          const v = Number(data.views) || 0;
          if (dateKey === todayKey) todayTotal += v;
          if (last7Keys.has(dateKey)) weekTotal += v;
        });
        setVisitorStats({ todayViews: todayTotal, last7DaysViews: weekTotal });
      },
      handleListenerError
    );

    const unsubExco =
      role === "developer"
        ? onSnapshot(
            collection(db, "admin_users"),
            (snap) => {
              setExcoUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            },
            handleListenerError
          )
        : () => {};

    const unsubLogs =
      role === "developer" ||
      role === "admin" ||
      allowedModules.includes("logs")
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
      unsubPromotions();
      unsubGaleri();
      unsubActivities();
      unsubExco();
      unsubMaint();
      unsubCountdown();
      unsubStats();
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
        "Kemas Kini Status Cafe",
        `${kafe.tajuk} -> ${kafe.status}`
      );
      showToast(`${kafe.tajuk} berjaya dikemas kini!`);
    } catch (err) {
      showToast(`Ralat menyimpan cafe: ${err.message}`);
    }
  };

  // Tambah item Timeline
  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!newTimeline.tajuk.trim()) return;

    const publishAtMs = newTimeline.publishAt
      ? new Date(newTimeline.publishAt).getTime()
      : null;
    const expireAtMs = newTimeline.expireAt
      ? new Date(newTimeline.expireAt).getTime()
      : null;

    if (
      (publishAtMs !== null && Number.isNaN(publishAtMs)) ||
      (expireAtMs !== null && Number.isNaN(expireAtMs))
    ) {
      showToast("Tarikh/masa jadual tidak sah. Sila semak semula.");
      return;
    }
    if (publishAtMs !== null && expireAtMs !== null && expireAtMs <= publishAtMs) {
      showToast("Masa tamat tempoh mesti selepas masa terbitan.");
      return;
    }

    try {
      const masaText =
        newTimeline.masa.trim() ||
        new Date(publishAtMs || Date.now()).toLocaleTimeString("ms-MY", {
          hour: "2-digit",
          minute: "2-digit",
        });

      const tajukTrimmed = newTimeline.tajuk.trim();
      const sebabTrimmed = newTimeline.sebab.trim();

      await addDoc(collection(db, "liveboard_timeline"), {
        tajuk: tajukTrimmed,
        status: newTimeline.status.trim() || "Makluman",
        sebab: sebabTrimmed,
        masa: masaText,
        isPinned: Boolean(newTimeline.isPinned),
        publishAtMs,
        expireAtMs,
        createdAtMs: Date.now(),
      });
      await recordLog("Tambah Timeline", tajukTrimmed);
      setNewTimeline({
        tajuk: "",
        status: "Makluman",
        sebab: "",
        masa: "",
        isPinned: false,
        publishAt: "",
        expireAt: "",
      });

      if (sendTimelinePush && auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          const response = await fetch(
            "https://jppkmk-push.halimhafizhan1059.workers.dev",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                title: tajukTrimmed || "Hebahan Baharu Live Board JPP KMK",
                body: sebabTrimmed || tajukTrimmed,
                url: "/live-board",
              }),
            }
          );

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.error || data?.message || "Gagal hantar push");
          }

          const sentCount =
            data?.sentCount ?? data?.successCount ?? data?.sent ?? data?.count;
          showToast(
            typeof sentCount === "number"
              ? `Hebahan Timeline diterbitkan & notifikasi dihantar kepada ${sentCount} peranti!`
              : "Hebahan Timeline diterbitkan & notifikasi berjaya dihantar!"
          );
        } catch (pushErr) {
          console.error("Push notification gagal selepas simpan timeline:", pushErr);
          showToast(
            "Hebahan Timeline berjaya diterbitkan, tetapi notifikasi gagal dihantar."
          );
        }
      } else {
        showToast(
          publishAtMs && publishAtMs > Date.now()
            ? "Item timeline telah dijadualkan."
            : "Item timeline baharu telah ditambah."
        );
      }
    } catch (err) {
      showToast(`Gagal menambah timeline: ${err.message}`);
    }
  };

  // Kelulusan & pemadaman Promosi Pelajar
  const pendingPromotionsCount = promotionsList.filter(
    (p) => p.status === "pending"
  ).length;

  const handleApprovePromotion = async (promo) => {
    try {
      await updateDoc(doc(db, "promotions", promo.id), {
        status: "approved",
        approvedBy: user?.email || "admin",
        approvedAtMs: Date.now(),
      });
      await recordLog("Luluskan Promosi", promo.tajuk);
      showToast(`Promosi "${promo.tajuk}" telah diluluskan!`);
    } catch (err) {
      showToast(`Gagal meluluskan promosi: ${err.message}`);
    }
  };

  const handleDeletePromotion = async (promo) => {
    if (
      !window.confirm(
        `Adakah anda pasti mahu menolak / memadam promosi "${promo.tajuk}"?`
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "promotions", promo.id));
      if (promo.posterPath) {
        try {
          await deleteObject(ref(storage, promo.posterPath));
        } catch (storageErr) {
          console.warn("Poster storage tidak dapat dipadam:", storageErr);
        }
      }
      await recordLog("Padam / Tolak Promosi", promo.tajuk);
      showToast(`Promosi "${promo.tajuk}" telah dipadam.`);
    } catch (err) {
      showToast(`Gagal memadam promosi: ${err.message}`);
    }
  };

  // Perkongsian: hebahan WhatsApp & poster story (item aktif sahaja)
  const shareTimelineItems = getVisibleTimeline(timelineList, nowTick);

  const handleCopyWhatsapp = async () => {
    const ok = await copyTextToClipboard(
      buildWhatsappText(kafeList, shareTimelineItems)
    );
    showToast(
      ok
        ? "Hebahan WhatsApp telah disalin ke papan keratan."
        : "Gagal menyalin teks. Sila cuba lagi."
    );
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
    if (!newGaleri.tajuk.trim()) {
      showToast("Sila masukkan tajuk program.");
      return;
    }
    if (!newGaleri.image.trim()) {
      showToast("Sila muat naik gambar atau masukkan pautan gambar terlebih dahulu.");
      return;
    }
    try {
      const finalImage = convertGoogleDriveImageUrl(newGaleri.image);
      const cleanDriveUrl = (newGaleri.driveLink || "").trim();
      await addDoc(collection(db, "galeri_events"), {
        ...newGaleri,
        tajuk: newGaleri.tajuk.trim(),
        image: finalImage,
        // Pautan Google Drive adalah pilihan; simpan "" jika tidak diisi
        driveLink: cleanDriveUrl,
        driveUrl: cleanDriveUrl,
        link: cleanDriveUrl,
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

  // Tambah & Padam Rekod Aktiviti JPP (jpp_activities)
  const handleAddJppActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.title.trim() || !newActivity.dateStr) return;
    try {
      await addDoc(collection(db, "jpp_activities"), {
        title: newActivity.title.trim(),
        dateStr: newActivity.dateStr,
        category: newActivity.category || "Kebajikan",
        location: newActivity.location.trim(),
        participants: newActivity.participants.trim(),
        description: newActivity.description.trim(),
        image: newActivity.image
          ? convertGoogleDriveImageUrl(newActivity.image)
          : "",
        reportUrl: newActivity.reportUrl.trim(),
        createdAtMs: Date.now(),
      });
      await recordLog("Tambah Aktiviti JPP", newActivity.title.trim());
      setNewActivity({
        title: "",
        dateStr: "",
        category: "Kebajikan",
        location: "",
        participants: "",
        description: "",
        image: "",
        reportUrl: "",
      });
      showToast("Rekod aktiviti JPP telah ditambah.");
    } catch (err) {
      showToast(`Gagal menambah aktiviti JPP: ${err.message}`);
    }
  };

  const handleDeleteJppActivity = async (id, title) => {
    try {
      await deleteDoc(doc(db, "jpp_activities", id));
      await recordLog("Padam Aktiviti JPP", title);
      showToast("Rekod aktiviti JPP telah dipadam.");
    } catch (err) {
      showToast(`Gagal memadam aktiviti JPP: ${err.message}`);
    }
  };

  // Tambah / Kemas kini akses Exco atau Admin
  const handleSaveExcoUser = async (e) => {
    e.preventDefault();
    const emailClean = newExco.email.trim().toLowerCase();
    if (!emailClean) return;
    const selectedRole = newExco.role === "admin" ? "admin" : "exco";
    const modulesToSave =
      selectedRole === "admin"
        ? ALL_TABS.filter((t) => !t.devOnly).map((t) => t.id)
        : newExco.modules;

    try {
      await setDoc(doc(db, "admin_users", emailClean), {
        email: emailClean,
        nama: newExco.nama.trim(),
        biro: newExco.biro.trim(),
        role: selectedRole,
        status: "active",
        allowedModules: modulesToSave,
        updatedAtMs: Date.now(),
      });
      await recordLog(
        "Kemas Kini Akses Pengguna",
        `${emailClean} [${selectedRole}] (${modulesToSave.join(", ")})`
      );
      setNewExco({
        email: "",
        nama: "",
        biro: "",
        role: "exco",
        modules: ["kafe_timeline"],
      });
      showToast(`Akses ${selectedRole} untuk ${emailClean} telah disimpan.`);
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

  // Simpan Tetapan Countdown PSPM
  const handleSaveCountdown = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "system_settings", "countdown"), {
        title:
          countdownConfig.title.trim() ||
          "Peperiksaan Semester Program Matrikulasi (PSPM)",
        targetDate: countdownConfig.targetDate || "2027-03-15T08:00:00",
        updatedBy: user.email,
        updatedAtMs: Date.now(),
      });
      await recordLog(
        "Tetapan Countdown PSPM",
        `${countdownConfig.title} (${countdownConfig.targetDate})`
      );
      showToast("Tetapan Countdown PSPM berjaya disimpan.");
    } catch (err) {
      showToast(`Gagal menyimpan countdown: ${err.message}`);
    }
  };

  const hasAccess = isDeveloper || role === "admin" || role === "exco";

  const canAccessTab = (tabId) => {
    if (isDeveloper) return true;
    if (role === "admin") {
      return (
        tabId === "kafe_timeline" ||
        tabId === "galeri" ||
        tabId === "aktiviti" ||
        tabId === "logs"
      );
    }
    if (role === "exco") {
      if (tabId === "exco_users" || tabId === "maintenance") return false;
      if (tabId === "aktiviti") {
        return (
          allowedModules.includes("aktiviti") ||
          allowedModules.includes("galeri")
        );
      }
      return allowedModules.includes(tabId);
    }
    return false;
  };

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
              <span>
                {isDeveloper
                  ? "Developer"
                  : role === "admin"
                  ? "Admin JPP"
                  : "Exco Modul"}
              </span>
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
        ) : !hasAccess ? (
          <div className="max-w-lg mx-auto mt-12 bg-white rounded-3xl shadow-lg border border-red-200 p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Tiada Kebenaran Modul
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Akaun <strong>{user.email}</strong> belum diberikan akses aktif
              dalam koleksi <code>admin_users</code>. Sila hubungi Developer
              untuk mendapatkan kebenaran.
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
              {ALL_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                const isLockedForUser = !canAccessTab(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#1f1d6b] text-cyan-300 shadow-sm"
                        : "bg-white text-gray-600 hover:bg-slate-100 border border-slate-200"
                    } ${isLockedForUser && !isSelected ? "opacity-80" : ""}`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.id === "promosi" && pendingPromotionsCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-[#0f172a]">
                        {pendingPromotionsCount}
                      </span>
                    )}
                    {isLockedForUser && (
                      <Lock size={13} className="opacity-80 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* SKRIN PUTIH BERKUNCI UNTUK TAB YANG TIADA AKSES */}
            {!canAccessTab(activeTab) ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 sm:p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-5">
                  <Lock size={40} />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1f1d6b]">
                  Akses Halaman Dikunci
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                  {activeTab === "exco_users" || activeTab === "maintenance"
                    ? "Hanya Developer sahaja yang dapat mengakses dan mengubah tetapan halaman ini."
                    : "Akaun anda tidak diberikan kebenaran untuk mengakses modul ini. Sila hubungi Developer jika memerlukan akses."}
                </p>
              </div>
            ) : (
              <>
            {/* TAB 1: KAFE & TIMELINE */}
            {activeTab === "kafe_timeline" && (
              <div className="space-y-6">
                {/* Statistik Pelawat Live Board */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">
                      Statistik Pelawat Live Board
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1f1d6b]">
                      Ringkasan Trafik Harian &amp; Mingguan
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 px-4 py-2.5 text-center min-w-[130px]">
                      <span className="block text-[10px] font-bold uppercase text-gray-500">
                        Paparan Hari Ini
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-[#1f1d6b]">
                        {visitorStats.todayViews}
                      </span>
                    </div>
                    <div className="rounded-xl bg-cyan-50/80 border border-cyan-200 px-4 py-2.5 text-center min-w-[130px]">
                      <span className="block text-[10px] font-bold uppercase text-cyan-800">
                        7 Hari Terakhir
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-cyan-700">
                        {visitorStats.last7DaysViews}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kemas Kini Status Kafe */}
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Status Operasi Cafe (A, B, C)
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
                        <span>Simpan Status Cafe</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Urus Timeline */}
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Tambah &amp; Urus Timeline Semasa
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyWhatsapp}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <Copy size={15} />
                      <span>Salin Hebahan WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPosterOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#1f1d6b] hover:bg-indigo-900 text-cyan-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <ImageIcon size={15} />
                      <span>Jana Poster Story</span>
                    </button>
                  </div>

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
                    <label className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTimeline.isPinned}
                        onChange={(e) =>
                          setNewTimeline({
                            ...newTimeline,
                            isPinned: e.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-amber-600"
                      />
                      <Pin size={13} />
                      <span>Semat di Paling Atas (Pinned)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Jadualkan Terbitan — kosongkan untuk terbit serta-merta
                        </label>
                        <input
                          type="datetime-local"
                          value={newTimeline.publishAt}
                          onChange={(e) =>
                            setNewTimeline({
                              ...newTimeline,
                              publishAt: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          Tamat Tempoh Automatik — kosongkan jika kekal
                        </label>
                        <input
                          type="datetime-local"
                          value={newTimeline.expireAt}
                          onChange={(e) =>
                            setNewTimeline({
                              ...newTimeline,
                              expireAt: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-cyan-50/80 border border-cyan-200 px-3.5 py-2.5">
                      <label className="flex items-center gap-2.5 text-xs font-bold text-[#1f1d6b] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendTimelinePush}
                          onChange={(e) => setSendTimelinePush(e.target.checked)}
                          className="h-4 w-4 accent-cyan-600 rounded"
                        />
                        <BellRing size={14} className="text-cyan-700 shrink-0" />
                        <span>Hantar Push Notification ke telefon pelajar serentak</span>
                      </label>
                      <p className="text-[11px] text-gray-600 mt-1 ml-6">
                        Apabila ditandakan, notifikasi segera akan dihantar kepada semua peranti pelajar yang melanggan sebaik sahaja hebahan Timeline diterbitkan.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Terbitkan ke Timeline</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {sortTimeline(timelineList).map((item) => {
                      const itemStatus = getTimelineStatus(item, nowTick);
                      const relativeText = formatRelativeTime(
                        getTimelineEffectiveMs(item),
                        nowTick
                      );
                      const statusBadge =
                        itemStatus === "scheduled"
                          ? {
                              label: "Berjadual",
                              cls: "bg-blue-50 text-blue-700 border-blue-200",
                            }
                          : itemStatus === "expired"
                          ? {
                              label: "Tamat Tempoh",
                              cls: "bg-slate-100 text-slate-600 border-slate-300",
                            }
                          : {
                              label: "Aktif",
                              cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                            };
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${
                            item.isPinned
                              ? "bg-amber-50/70 border-amber-300"
                              : "bg-white border-slate-200"
                          } ${itemStatus === "expired" ? "opacity-70" : ""}`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-cyan-700">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge.cls}`}
                              >
                                {statusBadge.label}
                              </span>
                              {item.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                                  <Pin size={10} />
                                  DISEMAT
                                </span>
                              )}
                              <span>{item.masa}</span>
                              {relativeText && (
                                <span className="text-gray-400 font-medium">
                                  • {relativeText}
                                </span>
                              )}
                              <span>•</span>
                              <span>{item.status}</span>
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 mt-0.5">
                              {item.tajuk}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.sebab}
                            </p>
                            {(item.publishAtMs || item.expireAtMs) && (
                              <p className="text-[10px] text-gray-400 mt-1.5">
                                {item.publishAtMs
                                  ? `Terbit: ${new Date(
                                      item.publishAtMs
                                    ).toLocaleString("ms-MY")}`
                                  : ""}
                                {item.publishAtMs && item.expireAtMs ? " • " : ""}
                                {item.expireAtMs
                                  ? `Tamat: ${new Date(
                                      item.expireAtMs
                                    ).toLocaleString("ms-MY")}`
                                  : ""}
                              </p>
                            )}
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
                      );
                    })}
                  </div>

                  <PosterModal
                    open={isPosterOpen}
                    onClose={() => setIsPosterOpen(false)}
                    kafeItems={kafeList}
                    timelineItems={shareTimelineItems}
                  />
                </div>
                </div>
              </div>
            )}

            {/* TAB 2: GALERI ALBUM (galeri_events SAHAJA) */}
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
                  <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1f1d6b]">
                        Gambar Pratonton Galeri
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setGaleriInputMode(
                            galeriInputMode === "upload" ? "url" : "upload"
                          )
                        }
                        className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 underline cursor-pointer"
                      >
                        {galeriInputMode === "upload"
                          ? "Atau guna pautan gambar luar"
                          : "Kembali ke muat naik fail"}
                      </button>
                    </div>

                    {galeriInputMode === "upload" ? (
                      <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cyan-300 bg-white hover:bg-cyan-50/50 px-4 py-4 text-center cursor-pointer transition-colors">
                        <ImageIcon size={22} className="text-cyan-600" />
                        <span className="text-xs font-semibold text-gray-700">
                          {isCompressingImage
                            ? "Sedang memampatkan gambar..."
                            : "Pilih atau ambil gambar (Auto-mampat <= 1000px)"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Mesra telefon &amp; laptop (JPG, PNG, WEBP)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGaleriFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <input
                        type="text"
                        placeholder="Tampal URL gambar atau pautan fail Google Drive..."
                        value={newGaleri.image}
                        onChange={(e) =>
                          setNewGaleri({
                            ...newGaleri,
                            image: convertGoogleDriveImageUrl(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm"
                      />
                    )}

                    {newGaleri.image && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-gray-100 aspect-[4/2]">
                        <img
                          src={newGaleri.image}
                          alt="Pratonton Galeri"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewGaleri((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                        >
                          Buang Gambar
                        </button>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="galeri-drive-link"
                    className="block text-xs font-semibold text-gray-600 -mb-1"
                  >
                    Pautan Album Google Drive (Pilihan)
                  </label>
                  <input
                    id="galeri-drive-link"
                    type="url"
                    placeholder="https://drive.google.com/... (boleh dibiarkan kosong)"
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
                            {item.driveLink || item.driveUrl || item.link || "Tiada pautan Google Drive"}
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

            {/* TAB BAHARU: JEJAK AKTIVITI JPP (jpp_activities SAHAJA) */}
            {activeTab === "aktiviti" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <form
                  onSubmit={handleAddJppActivity}
                  className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 h-fit"
                >
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Tambah Rekod Aktiviti JPP
                  </h2>
                  <input
                    type="text"
                    required
                    placeholder="Nama Program / Aktiviti JPP"
                    value={newActivity.title}
                    onChange={(e) =>
                      setNewActivity({ ...newActivity, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Tarikh Program:
                      </label>
                      <input
                        type="date"
                        required
                        value={newActivity.dateStr}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            dateStr: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Kategori:
                      </label>
                      <select
                        value={newActivity.category}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            category: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white"
                      >
                        <option value="Kebajikan">Kebajikan</option>
                        <option value="Kerohanian">Kerohanian</option>
                        <option value="Sukan dan Kebudayaan">
                          Sukan dan Kebudayaan
                        </option>
                        <option value="Penerbitan dan Penerangan">
                          Penerbitan dan Penerangan
                        </option>
                        <option value="Perhubungan Luar">
                          Perhubungan Luar
                        </option>
                        <option value="Akademik">Akademik</option>
                        <option value="Keselamatan dan Sahsiah">
                          Keselamatan dan Sahsiah
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Tempat Program (cth: Dewan Sri Ledang)"
                      value={newActivity.location}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          location: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Penyertaan (cth: 450 Pelajar, pilihan)"
                      value={newActivity.participants}
                      onChange={(e) =>
                        setNewActivity({
                          ...newActivity,
                          participants: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Ringkasan & impak program..."
                    value={newActivity.description}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />

                  <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <span className="text-xs font-bold text-[#1f1d6b] block">
                      Gambar Sorotan (Pilihan, Auto-Compress &lt;= 800px)
                    </span>
                    <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cyan-300 bg-white hover:bg-cyan-50/50 px-3 py-3 text-center cursor-pointer transition-colors">
                      <ImageIcon size={18} className="text-cyan-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        {isCompressingActivityImg
                          ? "Memampatkan gambar..."
                          : "Pilih gambar sorotan aktiviti"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleActivityFileChange}
                        className="hidden"
                      />
                    </label>
                    {newActivity.image && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/2]">
                        <img
                          src={newActivity.image}
                          alt="Pratonton Aktiviti"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewActivity((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer"
                        >
                          Buang
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="url"
                    placeholder="Pautan Album / Laporan Google Drive (pilihan)"
                    value={newActivity.reportUrl}
                    onChange={(e) =>
                      setNewActivity({
                        ...newActivity,
                        reportUrl: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Simpan Aktiviti JPP</span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                    Senarai Rekod Aktiviti JPP ({jppActivities.length})
                  </h2>
                  {jppActivities.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xs sm:text-sm text-gray-500">
                      Tiada rekod dalam <code>jpp_activities</code>. Laman Utama
                      memaparkan 3 aktiviti contoh sehingga rekod baharu
                      ditambah.
                    </div>
                  ) : (
                    jppActivities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase text-cyan-700">
                            <span>{act.dateStr}</span>
                            <span>•</span>
                            <span>{act.category}</span>
                            {act.location && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500">
                                  {act.location}
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-[#1f1d6b] mt-0.5">
                            {act.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {act.description}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteJppActivity(act.id, act.title)
                          }
                          aria-label="Padam aktiviti JPP"
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

            {/* TAB 3: PENGURUSAN E-MEL EXCO */}
            {activeTab === "exco_users" && isDeveloper && (
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Peranan (Role):
                    </label>
                    <select
                      value={newExco.role}
                      onChange={(e) =>
                        setNewExco({ ...newExco, role: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm bg-white"
                    >
                      <option value="exco">
                        Exco (Modul Terpilih Sahaja)
                      </option>
                      <option value="admin">
                        Admin (Semua Tab Kecuali Pengurusan E-mel)
                      </option>
                    </select>
                  </div>

                  {newExco.role !== "admin" && (
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
                  )}

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

            {/* TAB 4: SUIS PENYELENGGARAAN, COUNTDOWN PSPM & PEMANTAU KUOTA */}
            {activeTab === "maintenance" && isDeveloper && (
              <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <form
                onSubmit={handleSaveMaintenance}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
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

              <form
                onSubmit={handleSaveCountdown}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <h2 className="text-lg font-bold text-[#1f1d6b] border-b-2 border-cyan-500 pb-2">
                  Tetapan Countdown PSPM
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tajuk Acara / Peperiksaan:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Peperiksaan Semester Program Matrikulasi (PSPM)"
                    value={countdownConfig.title}
                    onChange={(e) =>
                      setCountdownConfig({
                        ...countdownConfig,
                        title: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tarikh &amp; Masa Sasaran:
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={countdownConfig.targetDate}
                    onChange={(e) =>
                      setCountdownConfig({
                        ...countdownConfig,
                        targetDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Save size={15} />
                  <span>Simpan Countdown PSPM</span>
                </button>
              </form>
              </div>

              {/* Widget Khas Developer: Pemantau Saiz Dokumen & Kuota Firestore */}
              {(() => {
                const collectionsSummary = [
                  {
                    name: "galeri_events",
                    label: "Galeri KMK",
                    docs: galeriItems,
                  },
                  {
                    name: "liveboard_kafe",
                    label: "Status Cafe",
                    docs: kafeList,
                  },
                  {
                    name: "liveboard_timeline",
                    label: "Timeline Live Board",
                    docs: timelineList,
                  },
                  {
                    name: "admin_users",
                    label: "Pengguna Admin/Exco",
                    docs: excoUsers,
                  },
                  {
                    name: "audit_logs",
                    label: "Log Aktiviti",
                    docs: activityLogs,
                  },
                ].map((col) => {
                  const bytes = col.docs.reduce(
                    (sum, item) => sum + calculateBytes(item),
                    0
                  );
                  return {
                    ...col,
                    count: col.docs.length,
                    bytes,
                  };
                });

                const totalDocs = collectionsSummary.reduce(
                  (sum, c) => sum + c.count,
                  0
                );
                const totalBytes = collectionsSummary.reduce(
                  (sum, c) => sum + c.bytes,
                  0
                );

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-cyan-500 pb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">
                          Diagnostik Pangkalan Data (Developer)
                        </span>
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#1f1d6b]">
                          Pemantau Saiz Dokumen &amp; Kuota Firestore
                        </h2>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2 text-center">
                          <span className="block text-[10px] font-bold uppercase text-gray-500">
                            Jumlah Dokumen
                          </span>
                          <span className="text-lg font-extrabold text-[#1f1d6b]">
                            {totalDocs}
                          </span>
                        </div>
                        <div className="rounded-xl bg-cyan-50 border border-cyan-200 px-4 py-2 text-center">
                          <span className="block text-[10px] font-bold uppercase text-cyan-800">
                            Saiz Keseluruhan
                          </span>
                          <span className="text-lg font-extrabold text-cyan-700">
                            {formatBytes(totalBytes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Mengikut Koleksi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {collectionsSummary.map((col) => (
                        <div
                          key={col.name}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
                        >
                          <span className="text-[10px] font-mono font-bold text-cyan-700 block truncate">
                            {col.name}
                          </span>
                          <h4 className="text-xs font-bold text-gray-800 mt-0.5">
                            {col.label}
                          </h4>
                          <div className="mt-2 flex items-baseline justify-between text-xs">
                            <span className="text-gray-500">
                              {col.count} dokumen
                            </span>
                            <span className="font-extrabold text-[#1f1d6b]">
                              {formatBytes(col.bytes)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Senarai Pemeriksa Had 1 MB untuk galeri_events */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#1f1d6b]">
                          Pemeriksa Had 1 MB Dokumen (<code>galeri_events</code>)
                        </h3>
                        <span className="text-[11px] text-gray-500">
                          Had Maksimum Firestore: 1,048,576 B (1.00 MB) / dokumen
                        </span>
                      </div>

                      {galeriItems.length === 0 ? (
                        <p className="text-xs text-gray-500 bg-slate-50 rounded-xl p-4 border border-slate-200">
                          Tiada dokumen dalam koleksi <code>galeri_events</code>{" "}
                          buat masa ini.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {galeriItems.map((item) => {
                            const bytes = calculateBytes(item);
                            const kbText = `${(bytes / 1024).toFixed(2)} KB`;
                            const pct = Math.min(
                              100,
                              (bytes / FIRESTORE_DOC_LIMIT_BYTES) * 100
                            );
                            const pctText = `${pct.toFixed(1)}%`;
                            const isHigh = pct > 75;
                            const isMedium = pct >= 50 && pct <= 75;
                            const barColor = isHigh
                              ? "bg-red-500"
                              : isMedium
                              ? "bg-amber-500"
                              : "bg-emerald-500";

                            return (
                              <div
                                key={item.id}
                                className={`rounded-xl border p-3.5 space-y-2 ${
                                  isHigh
                                    ? "bg-red-50/70 border-red-200"
                                    : "bg-slate-50/60 border-slate-200"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-bold text-gray-900 truncate">
                                      {item.tajuk || item.id}
                                    </span>
                                    {isHigh && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300">
                                        Amaran: Menghampiri Had 1MB Firestore
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono font-bold text-[#1f1d6b] shrink-0">
                                    {kbText} ({pctText})
                                  </span>
                                </div>

                                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
              </div>
            )}

            {/* TAB NOTIFIKASI PUSH */}
            {activeTab === "notifikasi" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
                <div className="border-b-2 border-cyan-500 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1f1d6b] text-cyan-300 flex items-center justify-center shrink-0">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1f1d6b]">
                      Hantar Push Notification ke Pelajar
                    </h2>
                    <p className="text-xs text-gray-500">
                      Siarkan makluman segera terus ke peranti Android, iOS (PWA) dan Desktop yang melanggan notifikasi portal.
                    </p>
                  </div>
                </div>

                {pushResult && (
                  <div
                    role="alert"
                    className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
                      pushResult.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {pushResult.type === "success" ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-red-500 shrink-0" />
                    )}
                    <span>{pushResult.message}</span>
                  </div>
                )}

                <form onSubmit={handleSendPushNotification} className="space-y-4">
                  <div>
                    <label
                      htmlFor="push-title"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5"
                    >
                      Tajuk Notifikasi
                    </label>
                    <input
                      id="push-title"
                      type="text"
                      required
                      value={pushForm.title}
                      onChange={(e) =>
                        setPushForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Makluman Terkini JPP KMK"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="push-body"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5"
                    >
                      Mesej Hebahan
                    </label>
                    <textarea
                      id="push-body"
                      rows={4}
                      required
                      value={pushForm.body}
                      onChange={(e) =>
                        setPushForm((prev) => ({ ...prev, body: e.target.value }))
                      }
                      placeholder="Cafe C dibuka semula seperti biasa bermula jam 5.00 petang."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-y"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="push-url"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5"
                    >
                      Pautan Destinasi
                    </label>
                    <select
                      id="push-url"
                      value={pushForm.url}
                      onChange={(e) =>
                        setPushForm((prev) => ({ ...prev, url: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    >
                      <option value="/">Laman Utama (/)</option>
                      <option value="/live-board">Live Board Cafe (/live-board)</option>
                      <option value="/takwim">Takwim (/takwim)</option>
                      <option value="/organisasi">Organisasi (/organisasi)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={pushSending}
                      className="inline-flex items-center justify-center gap-2 bg-[#1f1d6b] hover:bg-indigo-900 disabled:opacity-60 text-cyan-300 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      {pushSending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sedang Menghantar...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Hantar Notifikasi ke Semua Pelajar</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB KELULUSAN PROMOSI PELAJAR */}
            {activeTab === "promosi" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-[#1f1d6b]">
                      Kelulusan Promosi Aktiviti &amp; Jualan Pelajar
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Semak kiriman pelajar sebelum diluluskan untuk paparan umum di halaman /promosi.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                      Menunggu: {pendingPromotionsCount}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      Diluluskan:{" "}
                      {promotionsList.filter((p) => p.status === "approved").length}
                    </span>
                  </div>
                </div>

                {promotionsList.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-gray-500">
                    Belum ada sebarang kiriman promosi daripada pelajar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {promotionsList.map((promo) => {
                      const isPending = promo.status === "pending";
                      return (
                        <div
                          key={promo.id}
                          className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                            isPending
                              ? "border-amber-300 ring-1 ring-amber-200"
                              : "border-slate-200"
                          }`}
                        >
                          {promo.posterUrl && (
                            <div
                              onClick={() => setPromoLightboxUrl(promo.posterUrl)}
                              className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer group"
                            >
                              <img
                                src={promo.posterUrl}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-45"
                              />
                              <img
                                src={promo.posterUrl}
                                alt={promo.tajuk}
                                className="relative z-10 w-full h-full object-contain"
                              />
                              <span className="absolute bottom-2.5 right-2.5 z-20 inline-flex items-center gap-1 bg-black/70 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                                <ZoomIn size={12} />
                                <span>Klik untuk Besarkan</span>
                              </span>
                            </div>
                          )}

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                      promo.jenis === "jualan"
                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                        : "bg-cyan-50 text-cyan-800 border border-cyan-200"
                                    }`}
                                  >
                                    {promo.jenis === "jualan"
                                      ? "Jualan Pelajar"
                                      : "Aktiviti & Program"}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-[#1f1d6b] border border-indigo-200">
                                    {promo.jurusan}
                                  </span>
                                </div>

                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                                    isPending
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {isPending ? "Pending" : "Approved"}
                                </span>
                              </div>

                              <h3 className="text-base font-extrabold text-gray-900">
                                {promo.tajuk}
                              </h3>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
                                <div>
                                  <strong>Tarikh:</strong> {promo.tarikh || "-"}
                                </div>
                                <div>
                                  <strong>Masa:</strong> {promo.masa || "-"}
                                </div>
                                <div>
                                  <strong>Lokasi:</strong> {promo.lokasi || "-"}
                                </div>
                                <div>
                                  <strong>Penganjur/Penjual:</strong>{" "}
                                  {promo.namaPenganjur || "-"}
                                </div>
                                <div className="sm:col-span-2">
                                  <strong>Hubungan:</strong> {promo.hubungan || "-"}
                                </div>
                                {promo.jenis === "aktiviti" && promo.yuran && (
                                  <div className="sm:col-span-2">
                                    <strong>Yuran / Syarat:</strong> {promo.yuran}
                                  </div>
                                )}
                              </div>

                              {promo.jenis === "aktiviti" && promo.penerangan && (
                                <p className="text-xs text-gray-600 bg-slate-50 rounded-xl p-3 border border-slate-100 whitespace-pre-line">
                                  {promo.penerangan}
                                </p>
                              )}

                              {promo.jenis === "jualan" &&
                                Array.isArray(promo.menuItems) &&
                                promo.menuItems.length > 0 && (
                                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-100 text-gray-600 font-bold">
                                        <tr>
                                          <th className="px-3 py-1.5">Kategori</th>
                                          <th className="px-3 py-1.5">Produk</th>
                                          <th className="px-3 py-1.5 text-right">
                                            Harga
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {promo.menuItems.map((m, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-1.5">
                                              {m.kategori}
                                            </td>
                                            <td className="px-3 py-1.5 font-medium">
                                              {m.nama}
                                            </td>
                                            <td className="px-3 py-1.5 text-right font-bold text-[#1f1d6b]">
                                              RM {Number(m.harga || 0).toFixed(2)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => handleApprovePromotion(promo)}
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Luluskan</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePromotion(promo)}
                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                              >
                                <Trash2 size={14} />
                                <span>Tolak / Padam</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {promoLightboxUrl && (
                  <div
                    onClick={() => setPromoLightboxUrl("")}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <button
                      type="button"
                      onClick={() => setPromoLightboxUrl("")}
                      aria-label="Tutup poster"
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
                    >
                      <X size={22} />
                    </button>
                    <img
                      src={promoLightboxUrl}
                      alt="Pratonton poster penuh"
                      onClick={(e) => e.stopPropagation()}
                      className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl"
                    />
                  </div>
                )}
              </div>
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
          </>
        )}
      </main>
    </div>
  );
}
