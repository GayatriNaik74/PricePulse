import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function timeAgo(dateString) {
  if (!dateString) return "Not checked yet";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Alerts() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [dismissed, setDismissed] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/products").then((res) => setProducts(res.data));
    axiosClient.get("/products/price-history/all").then((res) => setHistory(res.data));
  }, []);

  const historyByProduct = history.reduce((acc, h) => {
    if (!acc[h.product_id]) acc[h.product_id] = [];
    acc[h.product_id].push(h);
    return acc;
  }, {});

  // An "alert" = product with a real current price whose price has dropped from its first recorded price
  const alertProducts = products
    .filter((p) => !dismissed.includes(p.id))
    .filter((p) => p.current_price != null)
    .map((p) => {
      const rows = (historyByProduct[p.id] || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      const originalPrice = rows.length > 0 ? rows[0].price : p.current_price;
      const dropPct = originalPrice > p.current_price
        ? (((originalPrice - p.current_price) / originalPrice) * 100).toFixed(0)
        : 0;
      return { ...p, originalPrice, dropPct: Number(dropPct) };
    })
    .filter((p) => p.dropPct > 0 || p.current_price <= p.target_price)
    .filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.dropPct - a.dropPct);

  const otherActiveCount = products.filter(
    (p) => !dismissed.includes(p.id) && !alertProducts.some((a) => a.id === p.id) && !p.is_paused
  ).length;

  const totalSavings = alertProducts.reduce(
    (sum, p) => sum + Math.max(p.originalPrice - p.current_price, 0),
    0
  );
  const targetHits = alertProducts.filter((p) => p.current_price <= p.target_price).length;
  const avgDrop = alertProducts.length
    ? (alertProducts.reduce((sum, p) => sum + p.dropPct, 0) / alertProducts.length).toFixed(0)
    : 0;

  const handleBuyNow = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />

      <main className="flex-1 bg-navy-950 min-h-screen">
        <div className="flex items-center justify-between px-8 py-5 bg-blue-50">
          <input
            type="text"
            placeholder="Search alerts or products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 bg-navy-950 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 outline-none"
          />
          <button
            onClick={() => navigate("/add-product")}
            className="bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Add Product
          </button>
        </div>

        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Alerts & Notifications</h1>
          <p className="text-gray-300 mt-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">
              {alertProducts.length} New
            </span>
            You have {alertProducts.length} price drop{alertProducts.length !== 1 ? "s" : ""} matching your tracking criteria.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-navy-900 rounded-xl p-5 border border-navy-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Savings Available</p>
              <p className="text-2xl font-bold text-mint-400 mt-1">₹{totalSavings.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">Across all tracked items</p>
            </div>
            <div className="bg-navy-900 rounded-xl p-5 border border-navy-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Target Hits</p>
              <p className="text-2xl font-bold text-white mt-1">{targetHits}</p>
              <p className="text-xs text-gray-500 mt-1">Active price triggers</p>
            </div>
            <div className="bg-navy-900 rounded-xl p-5 border border-navy-800">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Average Drop</p>
              <p className="text-2xl font-bold text-white mt-1">{avgDrop}%</p>
              <p className="text-xs text-gray-500 mt-1">Relative to target price</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-6">
            {alertProducts.map((p) => (
              <div key={p.id} className="bg-navy-900 border border-navy-800 rounded-xl p-5 flex gap-4 relative">
                <button
                  onClick={() => handleDismiss(p.id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                  ✕
                </button>
                <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-300 text-xs">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  {p.dropPct > 0 && (
                    <span className="bg-mint-400/10 text-mint-400 text-xs font-semibold px-2 py-1 rounded-md">
                      -{p.dropPct}% Drop
                    </span>
                  )}
                  <h3 className="text-white font-semibold mt-2">{p.name || "Fetching name..."}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-mint-400 text-xl font-bold">₹{p.current_price}</span>
                    <span className="text-gray-500 text-sm line-through">Target: ₹{p.target_price}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="bg-navy-800 px-2 py-1 rounded-md">{p.website || "Store"}</span>
                    <span>{timeAgo(p.last_checked)}</span>
                  </div>
                  <button
                    onClick={() => handleBuyNow(p.url)}
                    className="w-full bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold py-2.5 rounded-lg mt-4 transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {alertProducts.length === 0 && (
            <div className="border border-dashed border-navy-800 rounded-xl mt-6 py-16 text-center">
              <p className="text-white font-semibold text-lg">No active alerts right now</p>
              <p className="text-gray-500 text-sm mt-2">
                We'll notify you here the moment a tracked product's price drops.
              </p>
            </div>
          )}

          {otherActiveCount > 0 && (
            <div className="border border-dashed border-navy-800 rounded-xl mt-6 py-10 text-center">
              <p className="text-white font-semibold text-lg">Tracking {otherActiveCount} other item{otherActiveCount !== 1 ? "s" : ""}</p>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                Prices are stable for your other tracked products. We'll notify you the moment they dip below your targets.
              </p>
              <button onClick={() => navigate("/products")} className="text-mint-400 font-semibold text-sm mt-3 hover:underline">
                Manage All Tracked Products
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}