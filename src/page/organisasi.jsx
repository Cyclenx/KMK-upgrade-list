import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";

// Imbas semua gambar di dalam folder src/image/ secara synchronous
const memberImages = import.meta.glob("../image/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const memberImagesLower = Object.fromEntries(
  Object.entries(memberImages).map(([key, val]) => [key.toLowerCase(), val])
);

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
            const imageSrc =
              memberImages[imagePath] ||
              memberImagesLower[imagePath.toLowerCase()];
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
                <div className="w-full h-67 sm:h-80 bg-slate-100 overflow-hidden relative shrink-0">
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
        { id: 101, name: "MOHAMAD ZAWIR DANISH BIN MOHAMAD ZARIR", role: "Yang Dipertua", file: "zawir.jpg" },
        { id: 102, name: "Nur Kamalin Sofea binti Muhd Shahrin", role: "Naib Yang Dipertua", file: "kamalin.jpg" },
        { id: 103, name: "ZAHRATUL HANA BINTI MOHD ZAINI", role: "Majlis Tertinggi", file: "hana.jpg" },
        { id: 104, name: "LAILATUL BADARIAH BINTI SHARULL IDZHAM", role: "Majlis Tertinggi", file: "laila.jpg" },
        { id: 105, name: "NIK NUR AISYAH BINTI NIK MOHD HAZRUL", role: "Majlis Tertinggi", file: "aisyah.jpg" },
        { id: 106, name: "MOHAMAD AIDIL AIMAN BIN MUSTAFFA", role: "Majlis Tertinggi", file: "06-mt.png" },
      ],
    },
    {
      id: 2,
      name: "Penerangan dan Penerbitan",
      folder: "PENERBITAN DAN PENERANGAN",
      peranan: "Menguruskan saluran media rasmi, reka bentuk visual kreatif, montaj dan penyampaian maklumat telus kepada warga kolej.",
      members: [
        { id: 201, name: "RASYIEKA NABIHA BINTI RAZLI", role: "Ketua Exco Penerangan & Penerbitan", file: "cika.jpg" },
        { id: 202, name: "ALEEYA FARISYA BINTI AMRIMI", role: "Penolong Ketua Exco Penerangan & Penerbitan", file: "aleeya.jpg" },
        { id: 203, name: "NUR KAMILIA SHUHADA BINTI AHMAD JASMIR", role: "Biro Penerangan & Penerbitan", file: "kami.jpg" },
        { id: 204, name: "MUHAMMAD HAFIZHAN HAZIQ BIN MOHD ABDUL HALIM", role: "Biro Penerangan & Penerbitan", file: "pijan.jpg" },
        { id: 205, name: "NURSYUHADA BINTI MD YUSRI", role: "Biro Penerangan & Penerbitan", file: "syuhada.jpg" },
        { id: 206, name: "NUR IRDINA SAFFIYA BINTI MOHAMMAD SUHAIMAY", role: "Biro Penerangan & Penerbitan", file: "irdina.jpg" },
        { id: 207, name: "ALEEYA HANI BINTI ISMAIL", role: "Biro Penerangan & Penerbitan", file: "hani.jpg" },
      ],
    },
    {
      id: 3,
      name: "Sahsiah dan Keselamatan",
      folder: "SAHSIAH DAN KESELAMATAN",
      peranan: "Memastikan keharmonian disiplin warga kolej, keselamatan fasiliti asrama, kelancaran trafik dan kawalan protokol acara.",
      members: [
        { id: 301, name: "MUHAMMAD ABQARI BIN FAIZUL BAHARIN", role: "Ketua Exco Sahsiah & Keselamatan", file: "abqari.jpg" },
        { id: 302, name: "SYAZANA BINTI SAID AMAN", role: "Penolong Ketua Exco Sahsiah & Keselamatan", file: "syazana.jpg" },
        { id: 303, name: "MUHAMMAD AFIQ SYAHMI BIN ASHAM", role: "Biro Sahsiah & Keselamatan", file: "afiq.jpg" },
        { id: 304, name: "WAN HAZAMI BIN EDDRIN NIZAM", role: "Biro Sahsiah & Keselamatan", file: "wan.jpg" },
        { id: 305, name: "DANIAL HAKIMI BIN MOHD FEISAL", role: "Biro Sahsiah & Keselamatan", file: "danial.jpg" },
        { id: 306, name: "SITI ZULAIKHA BINTI RAMLI", role: "Biro Sahsiah & Keselamatan", file: "siti.jpg" },
        { id: 307, name: "MUHAMMAD IMAN AZFAR BIN MOHD ISHAK", role: "Biro Sahsiah & Keselamatan", file: "azfar.jpg" },
      ],
    },
    {
      id: 4,
      name: "Kerohanian dan Moral",
      folder: "KEROHANIAN DAN MORAL",
      peranan: "Mengimarahkan pusat ibadah, menganjurkan program pembinaan sahsiah rohani, usrah berkala dan sambutan kebesaran Islam.",
      members: [
        { id: 401, name: "NUR MUHAMMAD RABBAANII BIN RAMLAN", role: "Ketua Exco Kerohanian & Moral", file: "bani.jpg" },
        { id: 402, name: "IFFA SOFEA BINTI MOHD KHARMIZI", role: "Penolong Ketua Exco Kerohanian & Moral", file: "iffa.jpg" },
        { id: 403, name: "UZAIR UZMANA BIN JUFRY ANUAR", role: "Biro Kerohanian & Moral", file: "uzair.jpg" },
        { id: 404, name: "NUR ATIKAH UMAIRAH BINTI MOHAMAD ZOLKARNAIN", role: "Biro Kerohanian & Moral", matric: "MS2518174476", file: "atikah.jpg" },
        { id: 405, name: "Ahmad Fahimi bin Salim", role: "Biro Kerohanian & Moral", matric: "MS2618204982", file: "fahimi.jpg" },
        { id: 406, name: "NUR AIMI WADHIHAH BINTI AZIZI", role: "Biro Kerohanian & Moral", matric: "MS2618123093", file: "aimi.jpg" },
      ],
    },
    {
      id: 5,
      name: "Sukan dan Kebudayaan",
      folder: "SUKAN DAN KEBUDAYAAN",
      peranan: "Menyemarakkan gaya hidup cergas melalui aktiviti riadah, kejohanan sukan, persaingan e-sukan serta apresiasi kesenian kampus.",
      members: [
        { id: 501, name: "PANG YI ZHENG", role: "Ketua Exco Sukan & Kebudayaan", file: "pang.jpg" },
        { id: 502, name: "ALISYA BALQIS BINTI AZRUL", role: "Penolong Ketua Exco Sukan & Kebudayaan", file: "alisya.jpg" },
        { id: 503, name: "QASEH SURI SYAFIQAH BINTI MOHAMAD FAIRUS", role: "Biro Sukan & Kebudayaan", matric: "MS2618123116", file: "qaseh.jpg" },
        { id: 504, name: "NIK MUHAMMAD NABYL HEZRYL BIN ROSLI", role: "Biro Sukan & Kebudayaan", file: "nabyl.jpg" },
        { id: 505, name: "MAYTHANI A/P VIKIT", role: "Biro Sukan & Kebudayaan", file: "may.jpg" },
        { id: 506, name: "NUR SYASYA NAYLI BINTI SHAHIDAN", role: "Biro Sukan & Kebudayaan", file: "syasya.jpg" },
        { id: 507, name: "ARIF FAUZAN BIN AHMAD FAUZI", role: "Biro Sukan & Kebudayaan", file: "fauzan.jpg" },
      ],
    },
    {
      id: 6,
      name: "Akademik",
      folder: "EXCO AKADEMIK",
      peranan: "Memperkasa pencapaian ilmiah pelajar menerusi klinik akademik, bengkel peperiksaan, bimbingan rakan sebaya dan bank soalan.",
      members: [
        { id: 601, name: "TAI TUNG YAN", role: "Ketua Exco Akademik", file: "yan.jpg" },
        { id: 602, name: "AZFA MUZZAMIL BIN ABAS", role: "Penolong Ketua Exco Akademik", file: "azfa.jpg" },
        { id: 603, name: "NUR NAJWA UMAIRA BINTI SURISAN", role: "Biro Akademik", file: "najwa.jpg" },
        { id: 604, name: "SITI NURAIN ANISYA BINTI MOHAMAD ZUKI", role: "Biro Akademik", file: "anisya.jpg" },
        { id: 605, name: "MAYSARAH BINTI PAHMI", role: "Biro Akademik", file: "maysarah.jpg" },
        { id: 606, name: "KEITH KITTIPHAN A/L PERON", role: "Biro Akademik", file: "keith.jpg" },
        { id: 607, name: "KUNG FENG RUI", role: "Biro Akademik", file: "fen.jpg" },
      ],
    },
    {
      id: 7,
      name: "Perhubungan Luar",
      folder: "PERHUBUNGAN LUAR",
      peranan: "Membina jaringan strategik bersama institusi luar, agensi korporat, komuniti alumni serta menerajui program delegasi kepimpinan.",
      members: [
        { id: 701, name: "AMIRUL ASWADI BIN MOHD AZLAN", role: "Ketua Exco Perhubungan Luar", file: "amirul.jpg" },
        { id: 702, name: "CHEAK ZI XUAN", role: "Penolong Ketua Exco Perhubungan Luar", file: "cheak.jpg" },
        { id: 703, name: "NUR HUMAIRA BINTI MUHAMMAD SHIRMAN SHAH", role: "Biro Perhubungan Luar", file: "humaira.jpg" },
        { id: 704, name: "SYED MIRZA SALIM ALKHARED BIN SYED JEFFRY", role: "Biro Perhubungan Luar", file: "mirza.jpg" },
        { id: 705, name: "NUR AZREENA BINTI MOHD NIZARUDDIN", role: "Biro Perhubungan Luar", file: "azreena.jpg" },
        { id: 706, name: "NUR ADRIANA QISTINA BINTI MOHD SHAHRUL AFIZAN", role: "Biro Perhubungan Luar", file: "adriana.jpg" },
        { id: 707, name: "AININ ZARRA BINTI KHALIT", role: "Biro Perhubungan Luar", file: "ainin.jpg" },
      ],
    },
    {
      id: 8,
      name: "Kebajikan",
      folder: "EXCO KEBAJIKAN",
      peranan: "Menjaga kesejahteraan hidup pelajar, menguruskan bantuan kecemasan, dana prihatin serta mengendalikan saluran aduan mahasiswa.",
      members: [
        { id: 801, name: "FATIN NAJIHA BINTI MOHD NOR", role: "Ketua Exco Kebajikan", file: "fatin.jpg" },
        { id: 802, name: "ISFAHAN BIN SYAKIRIN", role: "Penolong Ketua Exco Kebajikan", file: "isfahan.jpg" },
        { id: 803, name: "MUHAMMAD FAHIM BIN MOHD FADZLY", role: "Biro Kebajikan", file: "fahim.jpg" },
        { id: 804, name: "FARIHAH UMAIRAH BINTI ABDUL TAUWAB", role: "Biro Kebajikan", file: "farihah.jpg" },
        { id: 805, name: "NUR AISYAH MAISARAH BINTI ANUAR SANI", role: "Biro Kebajikan", file: "aisyah.jpg" },
        { id: 806, name: "DHIA ALIA NUR IMAN BINTI MOHD ROSLI", role: "Biro Kebajikan", file: "dhia.jpg" },
        { id: 807, name: "MUHAMMAD ADAM DANISH BIN FAUZI", role: "Biro Kebajikan", file: "adam.jpg" },
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
