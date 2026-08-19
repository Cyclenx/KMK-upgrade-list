import React from 'react';

const OrganizationPage = () => {
  // Data organisasi
  const groups = [
    { id: 1, name: "Majlis Tertinggi" },
    { id: 2, name: "Penerbitan dan Penerangan" },
    { id: 3, name: "Sahsiah dan Keselamatan" },
    { id: 4, name: "Kerohanian" },
    { id: 5, name: "Sukan dan Kebudayaan" },
    { id: 6, name: "Akademik" },
    { id: 7, name: "Perhubungan Luar" },
    { id: 8, name: "Kebajikan" },
  ];

  // Fungsi untuk jana 7 placeholder ahli
  const members = Array.from({ length: 7 });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Carta Organisasi
      </h1>

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.id} className="w-full">
            <h2 className="text-xl font-semibold mb-4 text-blue-700 border-l-4 border-blue-700 pl-3">
              {group.name}
            </h2>
            
            {/* Horizontal Slider Container */}
            <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide snap-x">
              {members.map((_, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-36 bg-white rounded-lg shadow-md p-4 snap-start hover:shadow-xl transition-shadow"
                >
                  <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full mb-3"></div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 truncate">Peserta {index + 1}</p>
                    <p className="text-xs text-gray-500">Jawatan</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationPage;