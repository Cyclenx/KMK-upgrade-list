import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
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
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Komponen 1 Biro: 3D Curved Cover-Flow
function BureauFocusSlider({ group, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const members = group.members;

  const prevMember = () => {
    setActiveIndex((prev) => (prev === 0 ? members.length - 1 : prev - 1));
  };

  const nextMember = () => {
    setActiveIndex((prev) => (prev === members.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-white/70 backdrop-blur-md p-4 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Biro dengan Peranan Tersuai */}
      <div className="flex items-center justify-between mb-4 border-l-4 border-cyan-500 pl-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1f1d6b]">
            {group.name}
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 max-w-xl">
            {group.peranan}
          </p>
        </div>
        <span className="text-xs bg-indigo-50 text-[#1f1d6b] border border-indigo-100/80 px-3 py-1 rounded-full font-bold shrink-0">
          {members.length} Ahli
        </span>
      </div>

      {/* Peringkat Paparan 3D Curve */}
      <div className="relative w-full h-[430px] sm:h-[460px] flex items-center justify-center [perspective:1200px] overflow-hidden">
        <button
          onClick={prevMember}
          aria-label="Ahli Sebelum"
          className="absolute left-2 sm:left-6 z-40 p-2.5 rounded-full bg-white hover:bg-cyan-500 hover:text-white text-[#1f1d6b] shadow-xl border border-slate-200 transition-all active:scale-90 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {members.map((member, idx) => {
            const offset = idx - activeIndex;
            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            const imagePath = `../image/${group.folder}/${member.file}`;
            const imageSrc = memberImages[imagePath];
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              member.name
            )}&background=1f1d6b&color=fff&size=256`;

            const rotateY = isCenter ? 0 : offset < 0 ? 32 : -32;
            const translateX = offset * 180;
            const translateZ = isCenter ? 25 : -40;
            const scale = isCenter ? 1 : 0.88;
            const zIndex = 30 - Math.abs(offset) * 5;

            return (
              <div
                key={member.id}
                onClick={() => {
                  if (isCenter) {
                    navigate(`/organisasi/${member.id}`);
                  } else {
                    setActiveIndex(idx);
                  }
                }}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex: zIndex,
                }}
                className={`absolute w-52 sm:w-60 bg-white rounded-2xl shadow-lg border transition-all duration-500 ease-out cursor-pointer overflow-hidden flex flex-col will-change-transform ${
                  isCenter
                    ? "border-cyan-400 ring-4 ring-cyan-400/25 shadow-2xl shadow-indigo-900/15"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <div className="w-full h-56 sm:h-64 bg-slate-100 overflow-hidden relative shrink-0">
                  <img
                    src={imageSrc || fallbackAvatar}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = fallbackAvatar;
                    }}
                  />
                  {isCenter && (
                    <div className="absolute top-2.5 right-2.5 bg-[#1f1d6b]/85 backdrop-blur-md text-cyan-300 p-1.5 rounded-full shadow-md">
                      <ExternalLink size={14} />
                    </div>
                  )}
                </div>

                <div className="p-3.5 text-center flex flex-col justify-center items-center bg-white flex-grow">
                  <p
                    className={`text-xs sm:text-[13px] font-bold leading-snug text-center min-h-[2.8rem] flex items-center justify-center px-1 ${
                      isCenter ? "text-gray-900" : "text-gray-700"
                    }`}
                    title={member.name}
                  >
                    {member.name}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isCenter
                        ? "text-cyan-800 bg-cyan-50 border border-cyan-200"
                        : "text-gray-600 bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={nextMember}
          aria-label="Ahli Seterusnya"
          className="absolute right-2 sm:right-6 z-40 p-2.5 rounded-full bg-white hover:bg-cyan-500 hover:text-white text-[#1f1d6b] shadow-xl border border-slate-200 transition-all active:scale-90 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-3 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 py-1 px-4 bg-slate-100 rounded-full border border-slate-200/80">
          {members.map((_, i) => {
            const isCurrent = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Pilih ahli ke-${i + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isCurrent
                    ? "w-7 h-2 bg-cyan-500"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>

        <span className="text-[11px] text-gray-400 mt-2 font-mono">
          [ 0{activeIndex + 1} / 0{members.length} ]
        </span>
      </div>
    </section>
  );
}

const OrganizationPage = () => {
  const navigate = useNavigate();

  const groups = [
    {
      id: 1,
      name: "Majlis Tertinggi",
      folder: "MT",
      peranan: "Merangka dasar pentadbiran, memimpin hal tuju kepimpinan serta menyelaras hubungan antara mahasiswa dan pengurusan kolej.",
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
      peranan: "Menguruskan saluran media rasmi, reka bentuk visual kreatif, montaj dan penyampaian maklumat telus kepada warga kolej.",
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
      peranan: "Memastikan keharmonian disiplin warga kolej, keselamatan fasiliti asrama, kelancaran trafik dan kawalan protokol acara.",
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
      peranan: "Mengimarahkan pusat ibadah, menganjurkan program pembinaan sahsiah rohani, usrah berkala dan sambutan kebesaran Islam.",
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
      peranan: "Menyemarakkan gaya hidup cergas melalui aktiviti riadah, kejohanan sukan, persaingan e-sukan serta apresiasi kesenian kampus.",
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
      peranan: "Memperkasa pencapaian ilmiah pelajar menerusi klinik akademik, bengkel peperiksaan, bimbingan rakan sebaya dan bank soalan.",
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
      peranan: "Membina jaringan strategik bersama institusi luar, agensi korporat, komuniti alumni serta menerajui program delegasi kepimpinan.",
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
      peranan: "Menjaga kesejahteraan hidup pelajar, menguruskan bantuan kecemasan, dana prihatin serta mengendalikan saluran aduan mahasiswa.",
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
      {/* Bar Navigasi Atas */}
      <nav className="sticky top-0 z-50 bg-[#1f1d6b]/95 backdrop-blur-md text-white py-4 px-4 sm:px-6 lg:px-8 shadow-md border-b-2 border-cyan-400">
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
        {/* Header Halaman */}
        <RevealOnScroll delay={100}>
          <div className="text-center mb-12">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-cyan-700 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 shadow-sm">
              Sesi 2026/2027
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1f1d6b] mt-3 tracking-tight">
              Carta Organisasi JPP KMK
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2.5 leading-relaxed">
              Pilih dan fokus pada barisan exco biro. Klik kad di bahagian tengah untuk membuka profil penuh.
            </p>
          </div>
        </RevealOnScroll>

        {/* Bahagian Biro & Slider 3D */}
        <div className="space-y-12">
          {groups.map((group, idx) => (
            <RevealOnScroll key={group.id} delay={idx * 60}>
              <BureauFocusSlider group={group} navigate={navigate} />
            </RevealOnScroll>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OrganizationPage;