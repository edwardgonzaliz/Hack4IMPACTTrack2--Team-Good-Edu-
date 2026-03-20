import { useEffect, useState } from "react";

export default function BinControl() {
  const [bins, setBins] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/bins")
      .then(res => res.json())
      .then(data => setBins(data));
  }, []);

  const updateLevel = (id, value) => {
    fetch(`http://127.0.0.1:8000/update_bin/${id}?level=${value}`, {
      method: "POST"
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-6">
      <h2 className="text-lg font-semibold mb-3">🎛️ IoT Bin Control</h2>

      {bins.map((bin) => (
        <div key={bin.id} className="mb-4">
          <p className="text-sm font-medium">{bin.id} ({bin.level}%)</p>

          <input
            type="range"
            min="0"
            max="100"
            defaultValue={bin.level}
            onChange={(e) => updateLevel(bin.id, e.target.value)}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}