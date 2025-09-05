import { useState } from "react";
import SigilCanvas from "../components/SigilCanvas";

export default function Generator() {
  const [initials, setInitials] = useState("DC");
  const [seed, setSeed] = useState(Math.random());

  return (
    <div>
      <h2 className="text-3xl font-bold text-purple-400 mb-6">Sigil Generator</h2>
      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase())}
          placeholder="Enter your initials"
          className="p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:border-purple-400"
        />
        <button
          onClick={() => setSeed(Math.random())}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg"
        >
          Generate ✨
        </button>
      </div>
      <SigilCanvas initials={initials} seed={seed} />
    </div>
  );
}
