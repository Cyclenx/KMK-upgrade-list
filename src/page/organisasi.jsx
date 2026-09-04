import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

// Imbas semua gambar di dalam folder src/image/ secara synchronous
const memberImages = import.meta.glob("../image/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

// Komponen Pembungkus Animasi Skrol Masuk
function RevealOnScroll({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
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
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out will-change-transform ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const OrganizationPage = () => {
  const navigate = useNavigate();

  const groups = [
    {
      id: 1,
      name: "Majlis Tertinggi",
      folder: "MT",
      members: [
        { id: 101, name: "MOHAMAD ZAWIR DANISH BIN MOHAMAD ZARIR", role: "Yang Dipertua", file: "test.png" },
        { id: 102, name: "Nur Aisyah", role: "Naib Yang Dipertua I", file: "02-nydp1.png" },
        { id: 103, name: "Muhammad Daniel", role: "Naib Yang Dipertua II", file: "03-nydp2.png" },
        { id: 104, name: "Siti Sarah", role: "Setiausaha Kehormat", file: "04-setiausaha.png" },
        { id: 105, name: "Nur Farhana", role: "Naib Setiausaha", file: "05-naib-setiausaha.png" },
        { id: 106, name: "Amirul Haziq", role: "Bendahari Kehormat", file: "06-bendahari.png" },
      ],
    },
    {
      id: 2,
      name: "Penerbitan dan Penerangan",
      folder: "02-penerbitan",
      members: [
        { id: 201, name: "Wan Irfan", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 202, name: "Nurul Iman", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 203, name: "Hafizuddin Ali", role: "Exco Grafik & Visual", file: "03-grafik.png" },
        { id: 204, name: "Ainul Mardhiah", role: "Exco Fotografi", file: "04-fotografi.png" },
        { id: 205, name: "Muhammad Zharif", role: "Exco Siaraya & Teknikal", file: "05-teknikal.png" },
        { id: 206, name: "Siti Hajar", role: "Exco Publisiti & Media", file: "06-publisiti.png" },
        { id: 207, name: "Khairul Anuar", role: "Exco Dokumentasi", file: "07-dokumentasi.png" },
      ],
    },
    {
      id: 3,
      name: "Sahsiah dan Keselamatan",
      folder: "03-sahsiah",
      members: [
        { id: 301, name: "Muhammad Adam", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 302, name: "Nur Izzati", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 303, name: "Haris Danial", role: "Exco Disiplin", file: "03-disiplin.png" },
        { id: 304, name: "Farah Diana", role: "Exco Kawalan Trafik", file: "04-trafik.png" },
        { id: 305, name: "Zulhilmi Azman", role: "Exco Keselamatan Blok", file: "05-keselamatan.png" },
        { id: 306, name: "Nur Batrisyia", role: "Exco Protokol Acara", file: "06-protokol.png" },
        { id: 307, name: "Syamil Haikal", role: "Exco Rondaan Malam", file: "07-rondaan.png" },
      ],
    },
    {
      id: 4,
      name: "Kerohanian",
      folder: "04-kerohanian",
      members: [
        { id: 401, name: "Luqman Hakim", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 402, name: "Fatin Nabilah", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 403, name: "Ahmad Muhaimin", role: "Exco Pengimarahan Surau", file: "03-surau.png" },
        { id: 404, name: "Nur Syamimi", role: "Exco Usrah & Dakwah", file: "04-usrah.png" },
        { id: 405, name: "Izzat Firdaus", role: "Exco Modul Kerohanian", file: "05-modul.png" },
        { id: 406, name: "Anis Sofia", role: "Exco Sambutan Perayaan", file: "06-sambutan.png" },
      ],
    },
    {
      id: 5,
      name: "Sukan dan Kebudayaan",
      folder: "05-sukan",
      members: [
        { id: 501, name: "Irfan Zikri", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 502, name: "Nur Safiyyah", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 503, name: "Danish Haikal", role: "Exco Sukan Padang", file: "03-padang.png" },
        { id: 504, name: "Qistina Balqis", role: "Exco Seni & Kebudayaan", file: "04-kebudayaan.png" },
        { id: 505, name: "Hakim Naufal", role: "Exco E-Sukan", file: "05-esukan.png" },
        { id: 506, name: "Alia Natasha", role: "Exco Sukan Dalaman", file: "06-dalaman.png" },
        { id: 507, name: "Afiq Hazim", role: "Exco Peralatan & Fasiliti", file: "07-fasiliti.png" },
      ],
    },
    {
      id: 6,
      name: "Akademik",
      folder: "06-akademik",
      members: [
        { id: 601, name: "Muhammad Akmal", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 602, name: "Nurul Husna", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 603, name: "Hazim Fikri", role: "Exco Peer Tutoring", file: "03-tutoring.png" },
        { id: 604, name: "Nabila Huda", role: "Exco Bengkel & Seminar", file: "04-bengkel.png" },
        { id: 605, name: "Faris Imran", role: "Exco Bank Soalan", file: "05-banksoalan.png" },
        { id: 606, name: "Adriana Zulaikha", role: "Exco Kajian Prestasi", file: "06-prestasi.png" },
        { id: 607, name: "Syakir Aiman", role: "Exco Hubungan Pensyarah", file: "07-pensyarah.png" },
      ],
    },
    {
      id: 7,
      name: "Perhubungan Luar",
      folder: "07-perhubungan",
      members: [
        { id: 701, name: "Arif Iskandar", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 702, name: "Maisarah Zulkifli", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 703, name: "Muadz Rahimi", role: "Exco Penajaan & Korporat", file: "03-penajaan.png" },
        { id: 704, name: "Syaza Nadhirah", role: "Exco Jaringan Alumni", file: "04-alumni.png" },
        { id: 705, name: "Naim Asyraf", role: "Exco Mobiliti Pelajar", file: "05-mobiliti.png" },
        { id: 706, name: "Nur Khadijah", role: "Exco Lawatan Ilmiah", file: "06-lawatan.png" },
        { id: 707, name: "Zaim Hakimi", role: "Exco Delegasi Luar", file: "07-delegasi.png" },
      ],
    },
    {
      id: 8,
      name: "Kebajikan",
      folder: "08-kebajikan",
      members: [
        { id: 801, name: "Nik Azhar", role: "Ketua Biro", file: "01-ketua.png" },
        { id: 802, name: "Nur Salsabila", role: "Penolong Ketua Biro", file: "02-penolong.png" },
        { id: 803, name: "Aiman Muqri", role: "Exco Bantuan Makanan", file: "03-makanan.png" },
        { id: 804, name: "Wardina Safiya", role: "Exco Fasiliti Asrama", file: "04-asrama.png" },
        { id: 805, name: "Rayyan Harith", role: "Exco Tabung Prihatin", file: "05-tabung.png" },
        { id: 806, name: "Aina Syazwani", role: "Exco Aduan & Khidmat", file: "06-aduan.png" },
        { id: 807, name: "Haziq Fahmi", role: "Exco Kesihatan & Kecemasan", file: "07-kesihatan.png" },
      ],
    },
  ];

  const totalMembers = groups.reduce((acc, curr) => acc + curr.members.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-24 selection:bg-cyan-500 selection:text-white">
      {/* Bar Atas Sticky */}
      <nav className="sticky top-0 z-30 bg-[#1f1d6b]/95 backdrop-blur-md text-white py-4 px-4 sm:px-6 lg:px-8 shadow-md border-b-2 border-cyan-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Laman Utama</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <Users size={14} className="text-cyan-400" />
            <span className="font-medium">{totalMembers} Pemimpin Mahasiswa</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        {/* Tajuk Halaman dengan Animasi */}
        <RevealOnScroll delay={100}>
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 shadow-sm">
              Sesi 2026/2027
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1f1d6b] mt-3 tracking-tight">
              Carta Organisasi JPP KMK
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2.5 leading-relaxed">
              Barisan Majlis Tertinggi dan Exco Biro Jawatankuasa Perwakilan Pelajar Kolej Matrikulasi Kedah. Klik mana-mana profil untuk melihat maklumat lanjut.
            </p>
          </div>
        </RevealOnScroll>

        {/* Bahagian Biro & Slider Kad */}
        <div className="space-y-14">
          {groups.map((group, gIdx) => (
            <RevealOnScroll key={group.id} delay={gIdx * 70}>
              <section className="w-full bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                {/* Header Biro */}
                <div className="flex items-center justify-between mb-5 border-l-4 border-cyan-500 pl-3.5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#1f1d6b]">
                      {group.name}
                    </h2>
                    <p className="text-[11px] text-gray-400 hidden sm:block">
                      Tatal secara mendatar untuk melihat barisan exco
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-[#1f1d6b] border border-indigo-100/80 px-3 py-1 rounded-full font-bold shadow-xs">
                    {group.members.length} Ahli
                  </span>
                </div>

                {/* Kontena Kad (Scroll Horizontal) */}
                <div className="flex overflow-x-auto space-x-4 pb-3 pt-1 no-scrollbar snap-x scroll-smooth">
                  {group.members.map((member, mIdx) => {
                    const imagePath = `../image/${group.folder}/${member.file}`;
                    const imageSrc = memberImages[imagePath];
                    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=1f1d6b&color=fff&size=256`;

                    return (
                      <div
                        key={member.id}
                        onClick={() => navigate(`/organisasi/${member.id}`)}
                        style={{ animationDelay: `${mIdx * 40}ms` }}
                        className="group flex-shrink-0 w-44 sm:w-48 bg-white rounded-2xl shadow-xs hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-2 transition-all duration-300 border border-slate-200/80 hover:border-cyan-400/80 overflow-hidden snap-start flex flex-col cursor-pointer"
                        title={`Klik untuk lihat profil ${member.name}`}
                      >
                        {/* Bingkai Gambar */}
                        <div className="w-full h-56 bg-slate-100 overflow-hidden relative">
                          <img
                            src={imageSrc || fallbackAvatar}
                            alt={member.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-108"
                            onError={(e) => {
                              e.target.src = fallbackAvatar;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                            <span className="text-[10px] text-cyan-300 font-medium flex items-center gap-0.5">
                              Lihat Profil <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>

                        {/* Maklumat Ahli */}
                        <div className="p-3.5 text-center flex flex-col justify-center flex-grow bg-white">
                          <p
                            className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-cyan-600 transition-colors"
                            title={member.name}
                          >
                            {member.name}
                          </p>
                          <span
                            className="inline-block mt-1.5 text-[10px] sm:text-[11px] font-semibold text-cyan-800 bg-cyan-50/80 border border-cyan-200/60 px-2.5 py-0.5 rounded-full truncate"
                            title={member.role}
                          >
                            {member.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </RevealOnScroll>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OrganizationPage;