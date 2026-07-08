import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function timeAgo(dateString) {
  if (!dateString) return "Never";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const navigate = useNavigate();

  const loadProducts = () => {
    axiosClient.get("/products").then((res) => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Remove this product from tracking?")) return;
    await axiosClient.delete(`/products/${id}`);
    loadProducts();
  };

  const handleToggleStatus = async (product) => {
    const action = product.is_paused ? "resume" : "pause";
    await axiosClient.patch(`/products/${product.id}/${action}`);
    loadProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditValue(product.target_price);
  };

  const saveEdit = async (id) => {
    await axiosClient.patch(`/products/${id}`, { target_price: parseFloat(editValue) });
    setEditingId(null);
    loadProducts();
  };

  const filtered = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((sum, p) => sum + (p.current_price || 0), 0);
  const targetHits = products.filter((p) => p.current_price != null && p.current_price <= p.target_price).length;
  const activeAlerts = products.filter((p) => !p.is_paused).length;
  const uniqueStores = new Set(products.map((p) => p.website).filter(Boolean)).size || 1;

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />

      <main className="flex-1 bg-navy-950 min-h-screen">
        <div className="flex items-center justify-between px-8 py-5 bg-blue-50">
          <input
            type="text"
            placeholder="Search products..."
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
          <h1 className="text-3xl font-bold text-white">My Tracked Products</h1>
          <p className="text-gray-400 mt-1">
            Monitoring {products.length} item{products.length !== 1 ? "s" : ""} across {uniqueStores} retailer{uniqueStores !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Value</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">₹{totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Target Hits</p>
              <p className="text-2xl font-bold text-mint-500 mt-1">{targetHits} Product{targetHits !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Products</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{products.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Active Alerts</p>
              <p className="text-2xl font-bold text-navy-950 mt-1">{activeAlerts}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-950 text-gray-400 text-xs uppercase">
                  <th className="text-left px-6 py-4 font-medium">Product</th>
                  <th className="text-left px-6 py-4 font-medium">Current Price</th>
                  <th className="text-left px-6 py-4 font-medium">Target Price</th>
                  <th className="text-left px-6 py-4 font-medium">Status</th>
                  <th className="text-left px-6 py-4 font-medium">Last Updated</th>
                  <th className="text-left px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-10">
                      No products yet — click "Add Product" to start tracking.
                    </td>
                  </tr>
                )}
                {filtered.map((p) => {
                  const hitTarget = p.current_price != null && p.current_price <= p.target_price;
                  return (
                    <tr key={p.id} className={`border-t ${hitTarget ? "bg-mint-50" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                             <span className="text-gray-300 text-[10px]">No image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-navy-950">{p.name || "Fetching name..."}</p>
                            <p className="text-xs text-gray-400">{p.website || "Unknown store"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-navy-950">
                        {p.current_price != null ? `₹${p.current_price}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === p.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 border rounded px-2 py-1"
                            />
                            <button onClick={() => saveEdit(p.id)} className="text-mint-500 text-xs font-semibold">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Cancel</button>
                          </div>
                        ) : (
                          `₹${p.target_price}`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            p.is_paused ? "bg-gray-200 text-gray-600" : "bg-mint-100 text-mint-600"
                          }`}
                        >
                          {p.is_paused ? "PAUSED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{timeAgo(p.last_checked)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-gray-400">
                          <button onClick={() => startEdit(p)} title="Edit target price" className="hover:text-navy-950">✏️</button>
                          <button onClick={() => handleToggleStatus(p)} title={p.is_paused ? "Resume" : "Pause"} className="hover:text-navy-950">
                            {p.is_paused ? "▶️" : "⏸️"}
                          </button>
                          <button onClick={() => handleDelete(p.id)} title="Delete" className="hover:text-red-500">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}