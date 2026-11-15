import React, { useState, useEffect } from "react";
import { Wrench, Clock, ShieldCheck } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db, SUPER_ADMIN_EMAIL } from "../firebase";

export default function MaintenanceGuard({ children }) {
  const [maintenance, setMaintenance] = useState({
    enabled: false,
    message: "Portal JPP KMK sedang dalam penyelenggaraan berkala.",
    estimatedTime: "",
  });
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubMaint = onSnapshot(
      doc(db, "system_settings", "maintenance"),
      (snap) => {
        if (snap.exists()) {
          setMaintenance((prev) => ({ ...prev, ...snap.data() }));
        }
      },
      (error) => console.error("Firestore listener error:", error)
    );

    let unsubAdminDoc = () => {};
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubAdminDoc();

      if (!currentUser?.email) {
        setIsAdminUser(false);
        return;
      }

      const emailKey = currentUser.email.toLowerCase();
      if (emailKey === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setIsAdminUser(true);
        return;
      }

      unsubAdminDoc = onSnapshot(
        doc(db, "admin_users", emailKey),
        (docSnap) => {
          const mods = docSnap.exists() ? docSnap.data()?.allowedModules : [];
          setIsAdminUser(Array.isArray(mods) && mods.length > 0);
        },
        (error) => {
          console.error("Firestore listener error:", error);
          setIsAdminUser(false);
        }
      );
    });

    return () => {
      unsubMaint();
      unsubAdminDoc();
      unsubAuth();
    };
  }, []);

  if (maintenance.enabled && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f1d6b] via-indigo-950 to-slate-900 text-white flex items-center justify-center px-4 py-12 font-sans">
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center mx-auto mb-6">
            <Wrench size={32} />
          </div>

          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 px-3 py-1 rounded-full mb-3">
            Mod Penyelenggaraan
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Portal Sedang Diselenggara
          </h1>

          <p className="text-sm sm:text-base text-gray-200 mt-4 leading-relaxed">
            {maintenance.message ||
              "Portal JPP KMK sedang dalam penyelenggaraan berkala. Sila cuba lagi sebentar nanti."}
          </p>

          {maintenance.estimatedTime && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-xl text-xs sm:text-sm text-cyan-200 font-medium">
              <Clock size={16} className="shrink-0" />
              <span>Anggaran siap: {maintenance.estimatedTime}</span>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/15 flex items-center justify-center">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-cyan-300 transition-colors"
            >
              <ShieldCheck size={15} />
              <span>Akses Pentadbir (Admin)</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {maintenance.enabled && isAdminUser && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold py-1.5 px-4 text-center">
          Mod Penyelenggaraan Aktif — Anda sedang mengakses portal sebagai Admin.
        </div>
      )}
      {children}
    </>
  );
}
