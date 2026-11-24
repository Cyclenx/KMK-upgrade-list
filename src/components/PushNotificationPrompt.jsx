import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Share,
  X,
  AlertCircle,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, getFirebaseMessaging } from "../firebase";

const VAPID_KEY =
  "BI88Q_lS3IPhHJsL0lm2aCW60xEcBswNNb3IsxK0AwxaPEFK5FjKrkmxMI06qrhimdGQ9W7xVGoJSRCDsusPk3E";

function detectPlatform() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isRunningStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.navigator.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)")?.matches === true
  );
}

export default function PushNotificationPrompt() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("desktop");
  const [standalone, setStandalone] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [foregroundToast, setForegroundToast] = useState(null);

  const registerAndSaveToken = useCallback(async (detectedPlatform) => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error("Pelayar ini tidak menyokong Firebase Cloud Messaging.");
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error("Gagal mendapatkan token notifikasi. Sila cuba semula.");
    }

    await setDoc(
      doc(db, "fcm_tokens", token),
      {
        token,
        platform: detectedPlatform,
        updatedAt: serverTimestamp(),
        userAgent: navigator.userAgent || "",
      },
      { merge: true }
    );

    setSubscribed(true);
    return messaging;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = detectPlatform();
    const isStandalone = isRunningStandalone();
    const hasNotifSupport =
      "Notification" in window && "serviceWorker" in navigator;

    setPlatform(detected);
    setStandalone(isStandalone);
    setSupported(hasNotifSupport);

    if (hasNotifSupport) {
      setPermission(Notification.permission);
    }

    let unsubscribeOnMessage = () => {};
    let isMounted = true;

    async function initForegroundListener() {
      if (!hasNotifSupport) return;
      const messaging = await getFirebaseMessaging();
      if (!messaging || !isMounted) return;

      unsubscribeOnMessage = onMessage(messaging, (payload) => {
        const title =
          payload?.notification?.title ||
          payload?.data?.title ||
          "Makluman JPP KMK";
        const body =
          payload?.notification?.body ||
          payload?.data?.body ||
          "Anda mempunyai kemas kini baharu daripada Portal Rasmi JPP KMK.";
        const url =
          payload?.fcmOptions?.link || payload?.data?.url || "/live-board";

        setForegroundToast({ title, body, url });
      });

      if (Notification.permission === "granted") {
        try {
          await registerAndSaveToken(detected);
        } catch (err) {
          console.error("FCM sync error:", err);
        }
      }
    }

    initForegroundListener();

    return () => {
      isMounted = false;
      unsubscribeOnMessage();
    };
  }, [registerAndSaveToken]);

  useEffect(() => {
    if (!foregroundToast) return undefined;
    const timer = setTimeout(() => setForegroundToast(null), 8000);
    return () => clearTimeout(timer);
  }, [foregroundToast]);

  const handleEnableNotifications = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setErrorMsg(
          result === "denied"
            ? "Kebenaran notifikasi telah disekat. Sila aktifkan semula melalui tetapan pelayar."
            : "Kebenaran notifikasi tidak diberikan."
        );
        return;
      }

      await registerAndSaveToken(platform);
    } catch (err) {
      console.error("Gagal mengaktifkan notifikasi:", err);
      setErrorMsg(
        err?.message || "Ralat berlaku semasa mengaktifkan notifikasi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToastClick = () => {
    if (!foregroundToast) return;
    const target = foregroundToast.url || "/live-board";
    setForegroundToast(null);
    if (target.startsWith("http")) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      navigate(target);
    }
  };

  const isIOSNotStandalone = platform === "ios" && !standalone;

  return (
    <>
      {/* Toast Banner untuk Notifikasi Foreground */}
      {foregroundToast && (
        <div
          role="alert"
          className="fixed top-4 inset-x-4 sm:left-auto sm:right-5 sm:max-w-md z-[100] bg-[#0f172a] text-white border border-cyan-400/40 rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 animate-fade-in"
        >
          <img
            src="/logo-jpp.png"
            alt="Logo JPP KMK"
            className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0"
          />
          <button
            type="button"
            onClick={handleToastClick}
            className="flex-1 text-left min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <BellRing size={12} />
              <span>Makluman Baharu</span>
            </div>
            <p className="text-sm font-bold text-white leading-snug mt-0.5 line-clamp-1">
              {foregroundToast.title}
            </p>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {foregroundToast.body}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setForegroundToast(null)}
            aria-label="Tutup notifikasi"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Banner Langganan Notifikasi */}
      {!dismissed && (isIOSNotStandalone || supported) && (
        <section className="bg-gradient-to-r from-[#1f1d6b] via-[#1e3a8a] to-[#0f172a] text-white rounded-3xl border border-cyan-400/25 shadow-sm p-4 sm:p-5">
          {isIOSNotStandalone ? (
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/15 border border-cyan-300/30 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/15 px-2 py-0.5 rounded-full">
                      Notifikasi iOS
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 mt-1.5 leading-relaxed">
                    Pengguna iPhone: Tekan ikon{" "}
                    <span className="inline-flex items-center gap-1 font-semibold text-cyan-300">
                      <Share size={13} className="inline" /> Share
                    </span>{" "}
                    (kotak anak panah atas) di bawah pelayar dan pilih{" "}
                    <strong className="text-white">&apos;Add to Home Screen&apos;</strong>{" "}
                    untuk menerima notifikasi terus ke skrin kunci.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Tutup arahan iOS"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/15 border border-cyan-300/30 text-cyan-300 flex items-center justify-center shrink-0">
                  {subscribed && permission === "granted" ? (
                    <CheckCircle2 size={20} className="text-emerald-300" />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {subscribed && permission === "granted"
                      ? "Notifikasi Rasmi JPP KMK Aktif"
                      : "Terima Makluman Rasmi JPP KMK Terus ke Peranti"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {subscribed && permission === "granted"
                      ? "Peranti anda telah didaftarkan untuk menerima hebahan penting & kemas kini Live Board."
                      : "Aktifkan notifikasi segera bagi hebahan kampus, status cafe dan pengumuman penting JPP."}
                  </p>
                  {errorMsg && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-amber-300">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {subscribed && permission === "granted" ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl">
                    <CheckCircle2 size={14} />
                    <span>Notifikasi Aktif</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-[#0f172a] text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Mengaktifkan...</span>
                      </>
                    ) : (
                      <>
                        <BellRing size={15} />
                        <span>Aktifkan Notifikasi</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  aria-label="Tutup banner notifikasi"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
