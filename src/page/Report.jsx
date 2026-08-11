const { useState } = require("react");

const logo = require("../logokmk.png");

function App() {
  const [Nama, SetNama] = useState("");
  const [NoMatrix, SetNoMatrix] = useState("");
  const [NoTel, SetNoTel] = useState("");
  const [Cadangan, SetCadangan] = useState("");

  const Send = async () => {
    const Response = await fetch("http://localhost:5500/Hantar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Nama: Nama,
        NoMatrix: NoMatrix,
        NoTel: NoTel,
        Cadangan: Cadangan,
      }),
    });

    if (Response.ok) {
      console.log("OK");
    }
  };
  return (
    <div className="flex flex-col items-center mb-28">
      <div className="h-28 w-full bg-blue-900 flex justify-center rounded-b-md sm:rounded-none sm:justify-normal items-center  sm:pl-4">
        <img src={logo} className="w-20 h-20" />
      </div>
      <h1 className="font-bold mt-10 text-2xl">
        PORTAL CADANGAN PENAMBAH BAIKKAN
      </h1>
      <div className="mt-10 p-2 sm:w-80 w-[80%] ">
        <div className="flex flex-col">
          <label className="font-semibold">Nama</label>
          <input
            value={Nama}
            onInput={(e) => {
              SetNama(e.target.value);
            }}
            placeholder="Masukkan Nama"
            className="focus:outline-none mt-3 border-gray-400 border-2 p-1 rounded-r-md w-full"
          ></input>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">No Telefon</label>
          <input
            value={NoMatrix}
            onInput={(e) => {
              SetNoMatrix(e.target.value);
            }}
            placeholder="Masukkan No Telefon"
            className="focus:outline-none mt-3 border-gray-400 border-2 p-1 rounded-r-md w-full"
          ></input>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">No Matrix</label>
          <input
            value={NoTel}
            onInput={(e) => {
              SetNoTel(e.target.value);
            }}
            placeholder="Masukkan No Matrix"
            className="focus:outline-none mt-3 border-gray-400 border-2 p-1 rounded-r-md w-full"
          ></input>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Penambah Baikkan</label>
          <textarea
            value={Cadangan}
            onInput={(e) => {
              SetCadangan(e.target.value);
            }}
            placeholder="Cadangan Penambah Baikkan"
            className="h-52 focus:outline-none mt-3 border-gray-400 border-2 p-1 rounded-r-md w-full"
          ></textarea>
        </div>
        <div className="w-full justify-center items-center flex mt-4">
          <button
            onClick={() => {
              Send();
            }}
            className="text-center text-white bg-blue-800 p-3 px-5 font-bold rounded-md"
          >
            Hantar
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
