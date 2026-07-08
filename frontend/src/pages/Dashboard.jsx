import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/products").then((res) => setProducts(res.data));
    axiosClient.get("/products/price-history/all").then((res) => setHistory(res.data));
  }, []);

  // Aggregate: average price per day across all tracked products
  const chartData = Object.values(
    history.reduce((acc, h) => {
      const day = new Date(h.date).toISOString().slice(0, 10);
      if (!acc[day]) acc[day] = { date: day, total: 0, count: 0 };
      acc[day].total += h.price;
      acc[day].count += 1;
      return acc;
    }, {})
  )
    .map((d) => ({ date: d.date, avgPrice: +(d.total / d.count).toFixed(2) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Per-product history, to compute drops
  const historyByProduct = history.reduce((acc, h) => {
    if (!acc[h.product_id]) acc[h.product_id] = [];
    acc[h.product_id].push(h);
    return acc;
  }, {});

  const productsWithDrops = products
    .map((p) => {
      const rows = (historyByProduct[p.id] || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      if (rows.length < 2) return null;
      const first = rows[0].price;
      const latest = rows[rows.length - 1].price;
      if (latest >= first) return null;
      const dropPct = (((first - latest) / first) * 100).toFixed(1);
      return { ...p, originalPrice: first, dropPct };
    })
    .filter(Boolean)
    .sort((a, b) => b.dropPct - a.dropPct);

  const totalTracked = products.length;
  const activeAlerts = products.filter((p) => !p.is_paused).length;
  const recentDrops = productsWithDrops.length;
  const totalSavings = productsWithDrops.reduce(
    (sum, p) => sum + (p.originalPrice - p.current_price),
    0
  );

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />

      <main className="flex-1 bg-navy-950 min-h-screen">
        <div className="flex items-center justify-between px-8 py-5 bg-blue-50">
          <input
            type="text"
            placeholder="Track a new product URL..."
            className="w-96 bg-navy-950 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 outline-none"
            onKeyDown={(e) => e.key === "Enter" && navigate("/add-product")}
          />
          <button
            onClick={() => navigate("/add-product")}
            className="bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold px-5 py-2.5 rounded-lg transition"
          >
            + Add Product
          </button>
        </div>

        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-mint-400 mt-1">
            ↘ You have {recentDrops} price drop{recentDrops !== 1 ? "s" : ""} right now
          </p>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5 border-l-4 border-blue-400">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tracked</p>
              <p className="text-3xl font-bold text-navy-950 mt-1">{totalTracked}</p>
              <p className="text-xs text-gray-400 mt-1">Items you're monitoring</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-l-4 border-mint-400">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Active Alerts</p>
              <p className="text-3xl font-bold text-navy-950 mt-1">{activeAlerts}</p>
              <p className="text-xs text-gray-400 mt-1">Target prices set</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-l-4 border-red-300">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Recent Drops</p>
              <p className="text-3xl font-bold text-navy-950 mt-1">{recentDrops}</p>
              <p className="text-xs text-gray-400 mt-1">Since first tracked</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-l-4 border-mint-400">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Savings</p>
              <p className="text-3xl font-bold text-mint-500 mt-1">₹{totalSavings.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">Vigilance pays off</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="col-span-2 bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-navy-950">Price Activity</h2>
              <p className="text-xs text-gray-400 mb-4">Average price across your tracked products</p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgPrice" stroke="#22c99a" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm py-16 text-center">
                  No price history yet — data will appear after your first scrape.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-navy-950">Biggest Discounts</h2>
              <div className="mt-4 space-y-4">
                {productsWithDrops.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="text-sm font-medium text-navy-950">{p.name?.slice(0, 22) || "Product"}...</p>
                      <p className="text-xs text-gray-400">{p.website || "Store"}</p>
                    </div>
                    <span className="bg-red-100 text-red-500 text-xs font-bold px-2 py-1 rounded-full">
                      -{p.dropPct}%
                    </span>
                  </div>
                ))}
                {productsWithDrops.length === 0 && (
                  <p className="text-gray-400 text-sm">No discounts detected yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <h2 className="text-xl font-bold text-white">Recent Price Drops</h2>
            <button onClick={() => navigate("/products")} className="text-mint-400 text-sm hover:underline">
              View All
            </button>
          </div>

          <div className="grid grid-cols-4 gap-5 mt-4">
            {productsWithDrops.slice(0, 4).map((p) => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-300 text-xs">No image</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase">{p.website || "Store"}</p>
                  <p className="text-sm font-medium text-navy-950 mt-1 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-mint-500">₹{p.current_price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{p.originalPrice}</span>
                  </div>
                  <button
                    onClick={() => navigate("/products")}
                    className="w-full border border-gray-200 text-navy-950 text-xs font-medium py-2 rounded-lg mt-3 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {productsWithDrops.length === 0 && (
              <p className="text-gray-400 text-sm col-span-4 text-center py-8">
                No price drops yet — check back after your next scheduled scrape.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}