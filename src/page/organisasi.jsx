import React from 'react';

const OrganizationPage = () => {
  const groups = [
    {
      id: 1,
      name: "Majlis Tertinggi",
      members: [
        { id: 101, name: "Zawir Danish", role: "Yang Dipertua", image: "/images/mt-1.jpg" },
        { id: 102, name: "Nur Aisyah", role: "Naib Yang Dipertua I", image: "/images/mt-2.jpg" },
        { id: 103, name: "Muhammad Daniel", role: "Naib Yang Dipertua II", image: "/images/mt-3.jpg" },
        { id: 104, name: "Siti Sarah", role: "Setiausaha Kehormat", image: "/images/mt-4.jpg" },
        { id: 105, name: "Nur Farhana", role: "Naib Setiausaha", image: "/images/mt-5.jpg" },
        { id: 106, name: "Amirul Haziq", role: "Bendahari Kehormat", image: "/images/mt-6.jpg" },
        { id: 107, name: "Muhammad Danish", role: "Naib Bendahari", image: "/images/mt-7.jpg" },
      ],
    },
    {
      id: 2,
      name: "Penerbitan dan Penerangan",
      members: [
        { id: 201, name: "Wan Irfan", role: "Ketua Biro", image: "/images/pen-1.jpg" },
        { id: 202, name: "Nurul Iman", role: "Penolong Ketua Biro", image: "/images/pen-2.jpg" },
        { id: 203, name: "Hafizuddin Ali", role: "Exco Grafik & Visual", image: "/images/pen-3.jpg" },
        { id: 204, name: "Ainul Mardhiah", role: "Exco Fotografi", image: "/images/pen-4.jpg" },
        { id: 205, name: "Muhammad Zharif", role: "Exco Siaraya & Teknikal", image: "/images/pen-5.jpg" },
        { id: 206, name: "Siti Hajar", role: "Exco Publisiti & Media", image: "/images/pen-6.jpg" },
        { id: 207, name: "Khairul Anuar", role: "Exco Dokumentasi", image: "/images/pen-7.jpg" },
      ],
    },
    {
      id: 3,
      name: "Sahsiah dan Keselamatan",
      members: [
        { id: 301, name: "Muhammad Adam", role: "Ketua Biro", image: "/images/sk-1.jpg" },
        { id: 302, name: "Nur Izzati", role: "Penolong Ketua Biro", image: "/images/sk-2.jpg" },
        { id: 303, name: "Haris Danial", role: "Exco Disiplin", image: "/images/sk-3.jpg" },
        { id: 304, name: "Farah Diana", role: "Exco Kawalan Trafik", image: "/images/sk-4.jpg" },
        { id: 305, name: "Zulhilmi Azman", role: "Exco Keselamatan Blok", image: "/images/sk-5.jpg" },
        { id: 306, name: "Nur Batrisyia", role: "Exco Protokol Acara", image: "/images/sk-6.jpg" },
        { id: 307, name: "Syamil Haikal", role: "Exco Rondaan Malam", image: "/images/sk-7.jpg" },
      ],
    },
    {
      id: 4,
      name: "Kerohanian",
      members: [
        { id: 401, name: "Luqman Hakim", role: "Ketua Biro", image: "/images/kro-1.jpg" },
        { id: 402, name: "Fatin Nabilah", role: "Penolong Ketua Biro", image: "/images/kro-2.jpg" },
        { id: 403, name: "Ahmad Muhaimin", role: "Exco Pengimarahan Surau", image: "/images/kro-3.jpg" },
        { id: 404, name: "Nur Syamimi", role: "Exco Usrah & Dakwah", image: "/images/kro-4.jpg" },
        { id: 405, name: "Izzat Firdaus", role: "Exco Modul Kerohanian", image: "/images/kro-5.jpg" },
        { id: 406, name: "Anis Sofia", role: "Exco Sambutan Perayaan", image: "/images/kro-6.jpg" },
        { id: 407, name: "Taufiq Hidayat", role: "Exco Logistik Ibadah", image: "/images/kro-7.jpg" },
      ],
    },
    {
      id: 5,
      name: "Sukan dan Kebudayaan",
      members: [
        { id: 501, name: "Irfan Zikri", role: "Ketua Biro", image: "/images/suk-1.jpg" },
        { id: 502, name: "Nur Safiyyah", role: "Penolong Ketua Biro", image: "/images/suk-2.jpg" },
        { id: 503, name: "Danish Haikal", role: "Exco Sukan Padang", image: "/images/suk-3.jpg" },
        { id: 504, name: "Qistina Balqis", role: "Exco Seni & Kebudayaan", image: "/images/suk-4.jpg" },
        { id: 505, name: "Hakim Naufal", role: "Exco E-Sukan", image: "/images/suk-5.jpg" },
        { id: 506, name: "Alia Natasha", role: "Exco Sukan Dalaman", image: "/images/suk-6.jpg" },
        { id: 507, name: "Afiq Hazim", role: "Exco Peralatan & Fasiliti", image: "/images/suk-7.jpg" },
      ],
    },
    {
      id: 6,
      name: "Akademik",
      members: [
        { id: 601, name: "Muhammad Akmal", role: "Ketua Biro", image: "/images/aka-1.jpg" },
        { id: 602, name: "Nurul Husna", role: "Penolong Ketua Biro", image: "/images/aka-2.jpg" },
        { id: 603, name: "Hazim Fikri", role: "Exco Peer Tutoring", image: "/images/aka-3.jpg" },
        { id: 604, name: "Nabila Huda", role: "Exco Bengkel & Seminar", image: "/images/aka-4.jpg" },
        { id: 605, name: "Faris Imran", role: "Exco Bank Soalan", image: "/images/aka-5.jpg" },
        { id: 606, name: "Adriana Zulaikha", role: "Exco Kajian Prestasi", image: "/images/aka-6.jpg" },
        { id: 607, name: "Syakir Aiman", role: "Exco Hubungan Pensyarah", image: "/images/aka-7.jpg" },
      ],
    },
    {
      id: 7,
      name: "Perhubungan Luar",
      members: [
        { id: 701, name: "Arif Iskandar", role: "Ketua Biro", image: "/images/pl-1.jpg" },
        { id: 702, name: "Maisarah Zulkifli", role: "Penolong Ketua Biro", image: "/images/pl-2.jpg" },
        { id: 703, name: "Muadz Rahimi", role: "Exco Penajaan & Korporat", image: "/images/pl-3.jpg" },
        { id: 704, name: "Syaza Nadhirah", role: "Exco Jaringan Alumni", image: "/images/pl-4.jpg" },
        { id: 705, name: "Naim Asyraf", role: "Exco Mobiliti Pelajar", image: "/images/pl-5.jpg" },
        { id: 706, name: "Nur Khadijah", role: "Exco Lawatan Ilmiah", image: "/images/pl-6.jpg" },
        { id: 707, name: "Zaim Hakimi", role: "Exco Delegasi Luar", image: "/images/pl-7.jpg" },
      ],
    },
    {
      id: 8,
      name: "Kebajikan",
      members: [
        { id: 801, name: "Nik Azhar", role: "Ketua Biro", image: "/images/keb-1.jpg" },
        { id: 802, name: "Nur Salsabila", role: "Penolong Ketua Biro", image: "/images/keb-2.jpg" },
        { id: 803, name: "Aiman Muqri", role: "Exco Bantuan Makanan", image: "/images/keb-3.jpg" },
        { id: 804, name: "Wardina Safiya", role: "Exco Fasiliti Asrama", image: "/images/keb-4.jpg" },
        { id: 805, name: "Rayyan Harith", role: "Exco Tabung Prihatin", image: "/images/keb-5.jpg" },
        { id: 806, name: "Aina Syazwani", role: "Exco Aduan & Khidmat", image: "/images/keb-6.jpg" },
        { id: 807, name: "Haziq Fahmi", role: "Exco Kesihatan & Kecemasan", image: "/images/keb-7.jpg" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800 tracking-wide">
          Carta Organisasi
        </h1>

        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.id} className="w-full">
              <div className="flex items-center space-x-3 mb-5 border-l-4 border-blue-600 pl-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {group.name}
                </h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {group.members.length} Ahli
                </span>
              </div>

              {/* Slider Kontena Kad */}
              <div className="flex overflow-x-auto space-x-5 pb-4 scrollbar-hide snap-x">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden snap-start flex flex-col"
                  >
                    {/* Bahagian Gambar */}
                    <div className="w-full h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name
                          )}&background=0D8ABC&color=fff&size=256`;
                        }}
                      />
                    </div>

                    {/* Bahagian Maklumat */}
                    <div className="p-3 text-center flex flex-col justify-center flex-grow bg-white">
                      <p
                        className="text-sm font-bold text-gray-800 truncate"
                        title={member.name}
                      >
                        {member.name}
                      </p>
                      <span
                        className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full truncate"
                        title={member.role}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
