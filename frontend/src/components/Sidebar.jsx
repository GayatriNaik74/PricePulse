import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "My Tracked Products", path: "/products", icon: "📦" },
  { label: "Alerts", path: "/alerts", icon: "🔔" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="w-64 bg-blue-50 min-h-screen flex flex-col justify-between px-4 py-6">
      <div>
        <h1 className="text-xl font-bold text-mint-500 mb-8 px-2">PricePulse</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path
                  ? "bg-navy-950 text-mint-400"
                  : "text-navy-900 hover:bg-navy-950/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        <button className="w-full bg-mint-400 hover:bg-mint-500 text-navy-950 font-semibold py-2.5 rounded-lg transition">
          Upgrade Plan
        </button>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition"
        >
          ↩ Sign Out
        </button>
      </div>
    </aside>
  );
}