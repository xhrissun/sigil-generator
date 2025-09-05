import { useEffect, useState } from "react";
import SigilGenerator from "../pages/SigilGenerator";
import { getAllSigils } from "../utils/sigilAPI";

function GenerateSigil() {
  const [sigils, setSigils] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSigils = async () => {
      try {
        const data = await getAllSigils();
        // If backend returns { sigils: [], pagination: {...} }
        setSigils(data.sigils || []);
      } catch (error) {
        console.error("Error loading sigils:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSigils();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Generate a Sigil</h2>
      <SigilGenerator />

      <h3 className="text-xl font-bold mt-10 mb-4">Saved Sigils</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sigils.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sigils.map((sigil) => (
            <div
              key={sigil._id}
              className="p-4 bg-dark-800 rounded-lg shadow-lg border border-dark-700"
            >
              <h4 className="font-semibold text-lg mb-2">
                {sigil.intention || "Untitled Sigil"}
              </h4>
              {sigil.imageData ? (
                <img
                  src={sigil.imageData}
                  alt={sigil.intention}
                  className="w-full h-48 object-contain rounded"
                />
              ) : (
                <p className="text-gray-500 italic">No image data</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No saved sigils yet.</p>
      )}
    </div>
  );
}

export default GenerateSigil;
