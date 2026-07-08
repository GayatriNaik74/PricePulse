import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axiosClient.post("/products/", {
        url,
        target_price: parseFloat(targetPrice) || 0,
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Could not add this product. Check the URL and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-navy-900 rounded-2xl p-10 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Add New Product to Track</h1>
        <p className="text-gray-400 mb-8">
          Paste a product link from any supported retailer to start price tracking.
        </p>

        {error && (
          <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleTrack} className="flex flex-col gap-3">
          <input
            type="url"
            placeholder="Paste Product URL (Amazon, Flipkart, etc.)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-navy-800 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-mint-400"
            required
          />
          <input
            type="number"
            placeholder="Target price (₹)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-navy-800 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-mint-400"
            required
          />
          <button
            type="submit"
            className="bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold py-3 rounded-lg transition"
          >
            Track
          </button>
        </form>

        <div className="flex justify-center gap-6 mt-6 text-gray-500 text-xs tracking-wide">
          <span>AMAZON</span>
          <span>FLIPKART</span>
          <span>CROMA</span>
          <span>VIJAY SALES</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 text-sm mt-8 hover:text-gray-300"
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}